import { site } from "@/lib/site";
import type { CurrentShow, ScheduleSlot } from "./types";

/**
 * Programme schedule from laut.fm.
 *
 * laut.fm models the week as playlist slots: `{ day: "mon", hour: 6, end_time: 0 }`
 * where `end_time` is an hour-of-day, not a duration, and may wrap past midnight.
 * This module normalises that into concrete weekday/hour ranges the UI can use,
 * and resolves which slot is on air right now.
 *
 * The station broadcasts on Europe/Berlin time; all resolution happens in that
 * zone regardless of where the server or the visitor is.
 */

const API = "https://api.laut.fm/station";
const STATION_TZ = "Europe/Berlin";

const DAY_INDEX: Record<string, number> = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};

export const WEEKDAY_LABELS = [
  "Sonntag",
  "Montag",
  "Dienstag",
  "Mittwoch",
  "Donnerstag",
  "Freitag",
  "Samstag",
] as const;

interface RawSlot {
  id: number;
  name: string;
  day: string;
  hour: number;
  /** Stunde des Endes — kann null sein, dann zaehlt `length`. */
  end_time: number | null;
  /** Laenge der Playlist in Sekunden. */
  length?: number | null;
  description: string | null;
  color: string | null;
}

/**
 * Wie lange ein Slot laeuft, in Minuten.
 *
 * laut.fm beschreibt das auf zwei Arten, und welche gefuellt ist, haengt davon
 * ab, wie der Sendeplatz angelegt wurde:
 *
 *   `end_time` — die Stunde, zu der Schluss ist. Kann ueber Mitternacht laufen.
 *   `length`   — die Laenge der Playlist in Sekunden.
 *
 * Frueher wurde nur `end_time` gelesen. Ist das null, wurde daraus die Stunde 0
 * und der Sendeplan zeigte "00:00 bis 00:00".
 */
function durationOf(slot: RawSlot): number {
  const startHour = Number(slot.hour) || 0;

  if (typeof slot.end_time === "number") {
    const diff = (slot.end_time - startHour + 24) % 24;
    // start === end ist laut.fms Schreibweise fuer "die vollen 24 Stunden".
    return (diff === 0 ? 24 : diff) * 60;
  }

  if (typeof slot.length === "number" && slot.length > 0) {
    return Math.max(1, Math.round(slot.length / 60));
  }

  return 24 * 60;
}

export async function getSchedule(): Promise<ScheduleSlot[]> {
  try {
    const res = await fetch(`${API}/${site.station}/schedule`, {
      next: { revalidate: 600 },
      signal: AbortSignal.timeout(5000),
      headers: { accept: "application/json" },
    });
    if (!res.ok) return [];
    const raw = (await res.json()) as RawSlot[];
    if (!Array.isArray(raw)) return [];

    return raw
      .map((slot) => ({
        id: slot.id,
        name: slot.name?.trim() || "VoltFM",
        description: slot.description?.trim() || null,
        weekday: DAY_INDEX[slot.day?.toLowerCase()] ?? 0,
        startHour: Number(slot.hour) || 0,
        startMinute: 0,
        durationMinutes: durationOf(slot),
        color: slot.color?.trim() || null,
      }))
      .sort((a, b) => a.weekday - b.weekday || a.startHour - b.startHour);
  } catch {
    return [];
  }
}

/** Current weekday/hour/minute in the station's timezone. */
function stationNow(now = new Date()): { weekday: number; hour: number; minute: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: STATION_TZ,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const weekday = DAY_INDEX[get("weekday").toLowerCase().slice(0, 3)] ?? now.getDay();
  // Intl renders midnight as "24" in some runtimes.
  const hour = Number(get("hour")) % 24;
  return { weekday, hour, minute: Number(get("minute")) };
}

/** Minutes from the start of the week (Sunday 00:00) for a weekday + hour. */
function weekMinutes(weekday: number, hour: number, minute = 0): number {
  return weekday * 1440 + hour * 60 + minute;
}

/** "07:00" — die Startzeit eines Slots. */
export function formatSlotStart(slot: ScheduleSlot): string {
  return `${String(slot.startHour).padStart(2, "0")}:${String(slot.startMinute).padStart(2, "0")}`;
}

/**
 * "bis 18:13" bzw. "24 Stunden".
 *
 * Laeuft ein Slot ueber Mitternacht, steht das dabei — sonst liest sich
 * "23:00 bis 02:00" wie ein Fehler.
 */
export function formatSlotEnd(slot: ScheduleSlot): string {
  if (slot.durationMinutes >= 24 * 60) return "durchgehend";

  const startTotal = slot.startHour * 60 + slot.startMinute;
  const endTotal = startTotal + slot.durationMinutes;
  const hour = Math.floor(endTotal / 60) % 24;
  const minute = endTotal % 60;
  const naechsterTag = endTotal >= 24 * 60;

  return `bis ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}${
    naechsterTag ? " (Folgetag)" : ""
  }`;
}

/** Die bereits verrechnete Dauer des Slots. */
function slotDuration(slot: ScheduleSlot): number {
  return slot.durationMinutes;
}

function toShow(slot: ScheduleSlot, startsAt: Date): CurrentShow {
  const endsAt = new Date(startsAt.getTime() + slotDuration(slot) * 60_000);
  return {
    name: slot.name,
    description: slot.description,
    startsAt: startsAt.toISOString(),
    endsAt: endsAt.toISOString(),
    color: slot.color,
  };
}

/**
 * Resolve the slot on air now and the one after it.
 *
 * Slots are projected onto an absolute minute-of-week line and compared there,
 * which makes midnight-wrapping and week-wrapping fall out naturally.
 */
export function resolveCurrentAndNext(
  slots: ScheduleSlot[],
  now = new Date(),
): { current: CurrentShow | null; next: CurrentShow | null } {
  if (slots.length === 0) return { current: null, next: null };

  const { weekday, hour, minute } = stationNow(now);
  const nowMinutes = weekMinutes(weekday, hour, minute);
  const WEEK = 7 * 1440;

  // Each slot, expressed as minutes-from-now until it starts (0..WEEK).
  const projected = slots.map((slot) => {
    const start = weekMinutes(slot.weekday, slot.startHour);
    const untilStart = (start - nowMinutes + WEEK) % WEEK;
    return { slot, untilStart, duration: slotDuration(slot) };
  });

  // On air = started in the past (untilStart measured backwards) and not ended.
  const current =
    projected
      .map((p) => ({ ...p, sinceStart: (WEEK - p.untilStart) % WEEK }))
      .filter((p) => p.sinceStart < p.duration)
      .sort((a, b) => a.sinceStart - b.sinceStart)[0] ?? null;

  const upcoming =
    projected.filter((p) => p.untilStart > 0).sort((a, b) => a.untilStart - b.untilStart)[0] ??
    null;

  return {
    current: current
      ? toShow(current.slot, new Date(now.getTime() - current.sinceStart * 60_000))
      : null,
    next: upcoming
      ? toShow(upcoming.slot, new Date(now.getTime() + upcoming.untilStart * 60_000))
      : null,
  };
}

export async function getCurrentAndNextShow(): Promise<{
  current: CurrentShow | null;
  next: CurrentShow | null;
}> {
  return resolveCurrentAndNext(await getSchedule());
}

/** Groups slots by weekday for the programme page. */
export function groupByWeekday(slots: ScheduleSlot[]): { weekday: number; slots: ScheduleSlot[] }[] {
  return Array.from({ length: 7 }, (_, weekday) => ({
    weekday,
    slots: slots.filter((s) => s.weekday === weekday),
  }));
}
