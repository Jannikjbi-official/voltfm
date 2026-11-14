import "server-only";

import { revalidatePath } from "next/cache";

import { articles, milestones, stationDays } from "@/db/collections";
import { renderRichText } from "@/lib/sanitize";
import { announceDueArticles } from "@/services/discord/news";
import {
  getStationStats,
  getTrackStats,
  radioadminConfigured,
  RadioadminError,
} from "@/services/lautfm/radioadmin";
import {
  anniversaryText,
  monthlySwitchOnsText,
  simultaneousRecordText,
  snapshotText,
  type MilestoneText,
} from "./texts";

/**
 * Automatische Beitraege zu Meilensteinen.
 *
 * Laeuft einmal am Tag (Vercel Cron, /api/cron/meilensteine):
 *
 *  1. Tageszahlen von laut.fm holen. Die API gibt 15 Tage heraus; was der
 *     Lauf verpasst hat, holt er beim naechsten Mal nach.
 *  2. Rekord gleichzeitig: die meisten Hoerer beim Start eines Songs.
 *  3. Einschaltungen pro Monat — erst, wenn der Monat vollstaendig da ist.
 *     Der erste vollstaendige Monat ist nur der Vergleichswert: Wie oft
 *     VoltFM vorher eingeschaltet wurde, weiss niemand, also kann er nicht
 *     "zum ersten Mal" ueber einer Marke liegen.
 *  4. Jahrestag im Januar (seit Januar 2021).
 *  5. Einmal ein Startbeitrag mit den letzten 14 Tagen, sobald die da sind.
 *
 * Jede Marke gibt es genau einmal (Sammlung `milestones`). Was beim ersten
 * Abruf schon erreicht war, wird nur vermerkt, nicht gefeiert: Der Text sagt
 * "seit die Seite mitzaehlt", und das stimmt nur fuer das, was danach kam.
 */

const MONTHLY_THRESHOLDS = [1000, 2500, 5000, 10_000, 25_000, 50_000, 100_000];
/** Gefeiert im Beitrag "Über 1000 Hörer – Danke!" (Oktober 2026). */
const MONTHLY_REACHED_BEFORE_START = 1000;
const SIMULTANEOUS_THRESHOLDS = [10, 25, 50, 100, 250, 500, 1000];
const FOUNDED_YEAR = 2021;
/** Wie weit die Songliste fuer Tagesspitzen zurueck abgefragt wird. */
const PEAK_LOOKBACK_DAYS = 14;

export interface MilestoneRun {
  ok: boolean;
  collected: number;
  published: string[];
  seeded: string[];
  skipped?: string;
  error?: string;
}

/** Kalendertag in Senderzeit, yyyy-mm-dd. */
export function stationDate(date: Date): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export async function runMilestones(now = new Date()): Promise<MilestoneRun> {
  const run: MilestoneRun = { ok: true, collected: 0, published: [], seeded: [] };

  try {
    await Promise.all([
      stationDays().createIndex({ date: 1 }, { unique: true }),
      milestones().createIndex({ key: 1 }, { unique: true }),
    ]);
    await startOnce(now, run);

    if (radioadminConfigured()) {
      const firstCollection = await collect(now, run);
      await checkSimultaneous(now, firstCollection, run);
      await checkMonthly(now, run);
      await checkStartPost(now, run);
    } else {
      run.skipped = "LAUTFM_RADIOADMIN_TOKEN fehlt, nur der Jahrestag läuft.";
    }

    await checkAnniversary(now, run);
  } catch (error) {
    run.ok = false;
    run.error =
      error instanceof RadioadminError && (error.status === 401 || error.status === 403)
        ? "laut.fm lehnt das Token ab (abgelaufen oder falscher Origin)."
        : error instanceof Error
          ? error.message
          : String(error);
    console.error("[meilensteine]", error);
  }

  // Der letzte Lauf, fuer die Einstellungsseite im Admin.
  await milestones()
    .updateOne(
      { key: "lauf" },
      { $set: { key: "lauf", reachedAt: now, note: JSON.stringify(run) } },
      { upsert: true },
    )
    .catch(() => {});

  if (run.published.length > 0) {
    try {
      revalidatePath("/");
      revalidatePath("/news");
    } catch {
      // Ausserhalb einer Next-Anfrage (Skript, Test) gibt es nichts zu erneuern.
    }
    await announceDueArticles({ force: true });
  }
  return run;
}

/* --- Start ------------------------------------------------------------------ */

async function startOnce(now: Date, run: MilestoneRun): Promise<void> {
  const start = await milestones().updateOne(
    { key: "start" },
    { $setOnInsert: { key: "start", reachedAt: now, note: "Ab hier zählt die Seite mit." } },
    { upsert: true },
  );
  if (!start.upsertedCount) return;

  for (const threshold of MONTHLY_THRESHOLDS.filter((t) => t <= MONTHLY_REACHED_BEFORE_START)) {
    await seed(`monat-${threshold}`, now, "vor dem Start erreicht", run);
  }
  // Der Jahrestag dieses Jahres ist vorbei, ausser wir stehen noch am Anfang
  // des Januars — dann kommt er noch.
  const [year, month, day] = stationDate(now).split("-").map(Number);
  if (!(month === 1 && day <= 7)) await seed(`jahrestag-${year}`, now, "vor dem Start", run);
}

/* --- 1. Daten holen ---------------------------------------------------------- */

/** Liefert true beim allerersten erfolgreichen Abruf. */
async function collect(now: Date, run: MilestoneRun): Promise<boolean> {
  const stats = await getStationStats();
  const dates = new Set([...Object.keys(stats.switchOns), ...Object.keys(stats.listeningHours)]);
  for (const date of dates) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    await stationDays().updateOne(
      { date },
      {
        $set: {
          ...(date in stats.switchOns ? { switchOns: stats.switchOns[date] } : {}),
          ...(date in stats.listeningHours ? { listeningHours: stats.listeningHours[date] } : {}),
          updatedAt: now,
        },
      },
      { upsert: true },
    );
    run.collected++;
  }

  // Tagesspitzen nur fuer abgeschlossene Tage, jeden Tag nur einmal.
  for (let back = 1; back <= PEAK_LOOKBACK_DAYS; back++) {
    const date = stationDate(new Date(now.getTime() - back * 86_400_000));
    const doc = await stationDays().findOne({ date }, { projection: { peak: 1 } });
    if (doc && doc.peak !== undefined) continue;

    let tracks: Awaited<ReturnType<typeof getTrackStats>> = [];
    try {
      tracks = await getTrackStats(date);
    } catch (error) {
      // Fuer weit zurueckliegende Tage hat laut.fm womoeglich nichts mehr.
      if (!(error instanceof RadioadminError && error.status === 404)) throw error;
    }
    const best = tracks.reduce<(typeof tracks)[number] | null>(
      (top, track) => (track.listeners > (top?.listeners ?? 0) ? track : top),
      null,
    );
    await stationDays().updateOne(
      { date },
      {
        $set: {
          peak: best
            ? { listeners: best.listeners, at: best.startedAt, title: best.title, artist: best.artist }
            : null,
          updatedAt: now,
        },
      },
      { upsert: true },
    );
  }

  const first = await milestones().updateOne(
    { key: "messung" },
    { $setOnInsert: { key: "messung", reachedAt: now, note: "Erster Abruf bei laut.fm." } },
    { upsert: true },
  );
  return first.upsertedCount > 0;
}

/* --- 2. Rekord gleichzeitig -------------------------------------------------- */

async function checkSimultaneous(now: Date, seedOnly: boolean, run: MilestoneRun): Promise<void> {
  const best = await stationDays()
    .find({ "peak.listeners": { $gt: 0 } })
    .sort({ "peak.listeners": -1, date: 1 })
    .limit(1)
    .next();
  if (!best?.peak) return;
  const peak = best.peak;

  const crossed = await unreached(
    SIMULTANEOUS_THRESHOLDS.filter((t) => peak.listeners >= t).map((t) => `gleichzeitig-${t}`),
  );
  if (crossed.length === 0) return;

  if (seedOnly) {
    for (const key of crossed) await seed(key, now, "beim ersten Abruf schon erreicht", run);
    return;
  }

  const threshold = Math.max(...crossed.map((key) => Number(key.split("-")[1])));
  await publish(
    simultaneousRecordText({
      threshold,
      listeners: peak.listeners,
      at: peak.at,
      date: best.date,
      title: peak.title,
      artist: peak.artist,
    }),
    crossed,
    now,
    run,
  );
}

/* --- 3. Einschaltungen pro Monat --------------------------------------------- */

async function checkMonthly(now: Date, run: MilestoneRun): Promise<void> {
  const currentMonth = stationDate(now).slice(0, 7);
  const days = await stationDays()
    .find({ date: { $lt: `${currentMonth}-01` }, switchOns: { $exists: true } })
    .project<{ date: string; switchOns?: number; listeningHours?: number }>({ date: 1, switchOns: 1, listeningHours: 1 })
    .toArray();

  let baseline = (await unreached(["monat-basis"])).length === 0;
  const byMonth = new Map<string, typeof days>();
  for (const day of days) {
    const month = day.date.slice(0, 7);
    byMonth.set(month, [...(byMonth.get(month) ?? []), day]);
  }

  for (const [month, list] of [...byMonth].sort(([a], [b]) => a.localeCompare(b))) {
    const [year, m] = month.split("-").map(Number);
    const daysInMonth = new Date(Date.UTC(year, m, 0)).getUTCDate();
    // Ein Monat zaehlt erst, wenn jeder Tag da ist — sonst waere die Summe zu klein.
    if (list.length < daysInMonth) continue;

    const switchOns = list.reduce((sum, day) => sum + (day.switchOns ?? 0), 0);
    const listeningHours = list.reduce((sum, day) => sum + (day.listeningHours ?? 0), 0);
    const crossed = await unreached(
      MONTHLY_THRESHOLDS.filter((t) => switchOns >= t).map((t) => `monat-${t}`),
    );

    if (!baseline) {
      await seed("monat-basis", now, `${month}: ${switchOns} Einschaltungen, erster gemessener Monat`, run);
      for (const key of crossed) await seed(key, now, `im ${month}, dem ersten gemessenen Monat`, run);
      baseline = true;
      continue;
    }
    if (crossed.length === 0) continue;

    const threshold = Math.max(...crossed.map((key) => Number(key.split("-")[1])));
    await publish(monthlySwitchOnsText({ month, threshold, switchOns, listeningHours }), crossed, now, run);
  }
}

/* --- 4. Jahrestag --------------------------------------------------------------- */

async function checkAnniversary(now: Date, run: MilestoneRun): Promise<void> {
  const [year, month] = stationDate(now).split("-").map(Number);
  const years = year - FOUNDED_YEAR;
  if (month !== 1 || years < 1) return;

  const key = `jahrestag-${year}`;
  if ((await unreached([key])).length === 0) return;
  await publish(anniversaryText({ years }), [key], now, run);
}

/* --- 5. Startbeitrag ------------------------------------------------------------ */

async function checkStartPost(now: Date, run: MilestoneRun): Promise<void> {
  if ((await unreached(["startbeitrag"])).length === 0) return;

  // Die 14 abgeschlossenen Tage vor heute — dieselben, fuer die collect()
  // die Tagesspitzen holt.
  const dates = Array.from({ length: PEAK_LOOKBACK_DAYS }, (_, i) =>
    stationDate(new Date(now.getTime() - (i + 1) * 86_400_000)),
  );
  const days = await stationDays()
    .find({ date: { $in: dates }, switchOns: { $exists: true } })
    .toArray();
  // Nur mit allen 14 Tagen, sonst stimmt "in den letzten 14 Tagen" nicht.
  if (days.length < dates.length) return;

  const best = days
    .filter((day) => day.peak && day.peak.listeners > 0)
    .sort((a, b) => b.peak!.listeners - a.peak!.listeners || a.date.localeCompare(b.date))[0];

  await publish(
    snapshotText({
      date: stationDate(now),
      switchOns: days.reduce((sum, day) => sum + (day.switchOns ?? 0), 0),
      listeningHours: days.reduce((sum, day) => sum + (day.listeningHours ?? 0), 0),
      peak: best?.peak ? { ...best.peak, date: best.date } : null,
    }),
    ["startbeitrag"],
    now,
    run,
  );
}

/* --- Hilfen -------------------------------------------------------------------- */

async function unreached(keys: string[]): Promise<string[]> {
  if (keys.length === 0) return [];
  const done = await milestones()
    .find({ key: { $in: keys } }, { projection: { key: 1 } })
    .toArray();
  const reached = new Set(done.map((doc) => doc.key));
  return keys.filter((key) => !reached.has(key));
}

async function seed(key: string, now: Date, note: string, run: MilestoneRun): Promise<void> {
  const result = await milestones().updateOne(
    { key },
    { $setOnInsert: { key, reachedAt: now, note } },
    { upsert: true },
  );
  if (result.upsertedCount) run.seeded.push(key);
}

/**
 * Legt den Beitrag an und vermerkt die Marken. Die hoechste Marke wird zuerst
 * beansprucht: Laufen zwei Durchgaenge gleichzeitig, schreibt nur einer.
 */
async function publish(text: MilestoneText, keys: string[], now: Date, run: MilestoneRun): Promise<void> {
  const [main, ...rest] = [...keys].sort(
    (a, b) => Number(b.split("-")[1]) - Number(a.split("-")[1]),
  );
  const claim = await milestones().updateOne(
    { key: main },
    { $setOnInsert: { key: main, reachedAt: now, articleSlug: text.slug } },
    { upsert: true },
  );
  if (!claim.upsertedCount) return;
  for (const key of rest) {
    await milestones().updateOne(
      { key },
      { $setOnInsert: { key, reachedAt: now, articleSlug: text.slug } },
      { upsert: true },
    );
  }

  const content = renderRichText(text.source);
  const words = content.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  const result = await articles().updateOne(
    { slug: text.slug },
    {
      $setOnInsert: {
        slug: text.slug,
        title: text.title,
        excerpt: text.excerpt,
        content,
        contentSource: text.source,
        coverLabel: text.coverLabel,
        // Geschrieben hat ihn die Seite, nicht eine Person.
        authorName: "VoltFM",
        categorySlug: "in-eigener-sache",
        tags: ["Meilenstein"],
        status: "published",
        featured: false,
        publishedAt: now,
        readingTime: Math.max(1, Math.round(words / 200)),
        seoTitle: text.title,
        seoDescription: text.excerpt,
        createdAt: now,
        updatedAt: now,
      },
    },
    { upsert: true },
  );
  if (result.upsertedCount) run.published.push(text.slug);
}
