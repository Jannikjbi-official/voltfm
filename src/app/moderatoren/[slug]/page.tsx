import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import { ButtonLink } from "@/components/common/button-link";
import { LogoIcon } from "@/components/layout/logo";
import { cn } from "@heroui/react";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { Icon, ExternalLinkIcon } from "@/lib/icons";
import {
  getHostBySlug,
  getShowsBySlugs,
  listHosts,
  listArticlesByAuthor,
  countArticlesByAuthor,
  type ArticleDTO,
  type HostDTO,
  type ShowDTO,
} from "@/services/content";
import { resolveHostImage } from "@/services/discord/avatar";
import { imageHue } from "@/services/images/hue";
import { WEEKDAY_LABELS } from "@/services/radio/schedule";
import { formatDate, formatMonthYear, formatReadingTime } from "@/lib/format";
import { site } from "@/lib/site";

type Params = { slug: string };

/* Kein generateStaticParams: Das Root-Layout liest das Theme-Cookie, jede
   Seite rendert also ohnehin pro Anfrage. Mit vorab erzeugten Pfaden
   behandelt Vercel jeden spaeter angelegten Slug als statische Seite, und
   die scheitert an cookies() mit DYNAMIC_SERVER_USAGE (500) — passiert mit
   /events/radioaid-2026, und ein neues Profil haette dasselbe Problem. */

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const host = await getHostBySlug(slug);
  if (!host) return { title: "Moderator nicht gefunden" };

  return {
    title: host.name,
    description: `${host.role} bei VoltFM. ${host.bio.slice(0, 150)}`,
    alternates: { canonical: `/moderatoren/${host.slug}` },
    openGraph: {
      type: "profile",
      title: `${host.name} — ${site.name}`,
      description: host.role,
      images: host.image ? [host.image] : undefined,
    },
  };
}

export const revalidate = 3600;

/**
 * Ein Moderatorenprofil.
 *
 * Jede Person bekommt ihren eigenen Aufbau (`profileLayout`, im Admin
 * waehlbar) und ihre eigene Farbe: entweder im Admin gesetzt oder aus dem
 * Profilbild gelesen. Der Inhalt ist in allen Aufbauten derselbe und kommt
 * vollstaendig aus dem Profil — was dort leer ist, erscheint hier nicht.
 */
/**
 * Die Personenfarbe. Die Seite setzt nur den Farbton (--host-hue, inline als
 * Variable); Helligkeit und Buntheit stehen hier fest, damit jede Schrift auf
 * jeder Flaeche den WCAG-AA-Kontrast haelt — egal, welchen Ton jemand waehlt.
 * Ohne eigenen Ton gilt 95, der Farbton des Sendergelbs.
 *
 *   --host-accent   Linien und Kanten
 *   --host-ink      Schrift in Personenfarbe auf dem Seitengrund
 *   --host-soft     getoenter Grund hinter normaler Schrift
 *   --host-deep     kraeftige Flaeche hinter heller Schrift (--host-on-deep)
 */
const HOST_TOKENS = cn(
  "[--host-hue:95]",
  "[--host-accent:oklch(0.56_0.11_var(--host-hue))]",
  "[--host-ink:oklch(0.45_0.1_var(--host-hue))]",
  "[--host-soft:oklch(0.94_0.025_var(--host-hue))]",
  "[--host-deep:oklch(0.36_0.08_var(--host-hue))]",
  "[--host-on-deep:oklch(0.98_0.01_var(--host-hue))]",
  "dark:[--host-accent:oklch(0.68_0.1_var(--host-hue))]",
  "dark:[--host-ink:oklch(0.8_0.08_var(--host-hue))]",
  "dark:[--host-soft:oklch(0.19_0.025_var(--host-hue))]",
  "dark:[--host-deep:oklch(0.32_0.07_var(--host-hue))]",
);

/**
 * Ein Moderatorenprofil.
 *
 * Jede Person bekommt ihren eigenen Aufbau (`profileLayout`, im Admin
 * waehlbar) und ihre eigene Farbe: entweder im Admin gesetzt oder aus dem
 * Profilbild gelesen. Der Inhalt ist in allen Aufbauten derselbe und kommt
 * vollstaendig aus dem Profil — was dort leer ist, erscheint hier nicht.
 *
 *   buehne — getoente Flaeche mit Funkwellen, grosses rundes Bild, Name daneben
 *   poster — Bild und Name als ein grosser Block in Personenfarbe
 *   karte  — wie ein App-Profil: Karte mit Banner links, Inhalt rechts
 */
export default async function HostPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const host = await getHostBySlug(slug);
  if (!host) notFound();

  const [shows, image, articles, articleCount, allHosts] = await Promise.all([
    getShowsBySlugs(host.showSlugs),
    resolveHostImage(host),
    listArticlesByAuthor(host.name, 4),
    countArticlesByAuthor(host.name),
    listHosts(),
  ]);

  // Im Admin gesetzt gewinnt; sonst der Farbton des Profilbilds.
  const hue = host.accentHue ?? (await imageHue(image));
  const hueStyle =
    hue === null ? undefined : ({ "--host-hue": String(hue) } as React.CSSProperties);

  /* Wer sonst noch auf denselben Sendungen steht. Kommt aus den Sendungen
     selbst, nicht aus einer eigenen Liste — so kann es nicht auseinanderlaufen. */
  const coHostSlugs = new Set(
    shows.flatMap((show) => show.hostSlugs).filter((s) => s !== host.slug),
  );
  const coHosts = allHosts.filter((h) => coHostSlugs.has(h.slug));
  const otherHosts = allHosts.filter((h) => h.slug !== host.slug && !coHostSlugs.has(h.slug));

  const facts = buildFacts(host, shows, articleCount);
  const hasProfile = facts.length > 0 || host.genres.length > 0;
  const layout = host.profileLayout ?? "buehne";

  return (
    <div data-layout={layout} style={hueStyle} className={cn(HOST_TOKENS, "pb-4")}>
      {layout === "karte" ? (
        <section className="shell pt-10 sm:pt-14">
          <Crumbs host={host} />
          <div className="mt-8 grid gap-12 lg:grid-cols-[22rem_minmax(0,1fr)] lg:gap-14">
            <ProfileCard host={host} image={image} facts={facts} />
            <div className="min-w-0">
              <About host={host} />
              <ShowList shows={shows} className="pt-14 sm:pt-16" />
              <AuthorArticles host={host} articles={articles} className="pt-14 sm:pt-16" />
            </div>
          </div>
        </section>
      ) : (
        <>
          {layout === "poster" ? (
            <PosterHero host={host} image={image} />
          ) : (
            <StageHero host={host} image={image} />
          )}
          <section className="shell pt-14 sm:pt-20">
            {/* Ohne Steckbrief keine zweite Spalte, die leer bliebe. */}
            <div
              className={cn(
                "grid gap-10",
                hasProfile && "lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-16",
              )}
            >
              <About host={host} />
              <Profile host={host} facts={facts} />
            </div>
          </section>
          <ShowList shows={shows} />
          <AuthorArticles host={host} articles={articles} />
        </>
      )}

      <Team title={`Zusammen mit ${host.name} auf Sendung`} hosts={coHosts} />
      <Team title="Weitere Stimmen" hosts={otherHosts} />
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* Daten                                                                     */
/* ------------------------------------------------------------------------ */

type Fact = { label: string; value: string };

/**
 * Was im Steckbrief steht. Nichts davon ist erfunden: Sendungen und Sendezeit
 * kommen aus dem Sendeplan, Beitraege aus den News, der Rest aus dem Profil.
 */
function buildFacts(host: HostDTO, shows: ShowDTO[], articleCount: number): Fact[] {
  const facts: Fact[] = [];
  if (host.joinedAt) facts.push({ label: "Dabei seit", value: formatMonthYear(host.joinedAt) });
  if (host.location) facts.push({ label: "Sitzt in", value: host.location });

  if (shows.length > 0) {
    const weeklyMinutes = shows.reduce((sum, show) => {
      const [sh, sm] = show.startTime.split(":").map(Number);
      const [eh, em] = show.endTime.split(":").map(Number);
      // Ueber Mitternacht laufende Sendungen ergeben sonst eine negative Dauer.
      return sum + ((eh * 60 + em - (sh * 60 + sm) + 1440) % 1440);
    }, 0);
    facts.push({ label: "Sendungen", value: String(shows.length) });
    facts.push({
      label: "Pro Woche",
      value:
        weeklyMinutes >= 60
          ? `${(Math.round((weeklyMinutes / 60) * 10) / 10).toLocaleString("de-DE")} Std.`
          : `${weeklyMinutes} Min.`,
    });
  }

  if (articleCount > 0) facts.push({ label: "Beiträge", value: String(articleCount) });
  // Frei im Admin gepflegte Angaben stehen hinter den abgeleiteten.
  for (const detail of host.details) facts.push(detail);
  return facts;
}

/* ------------------------------------------------------------------------ */
/* Bausteine, die jeder Aufbau nutzt                                         */
/* ------------------------------------------------------------------------ */

function Crumbs({ host }: { host: HostDTO }) {
  return (
    <Breadcrumbs
      items={[
        { href: "/", label: "Start" },
        { href: "/moderatoren", label: "Moderatoren" },
        { href: `/moderatoren/${host.slug}`, label: host.name },
      ]}
    />
  );
}

/** Rundes Profilbild. Ohne Bild das Senderlogo — kein erfundenes Gesicht. */
function Avatar({
  host,
  image,
  size,
  className,
}: {
  host: HostDTO;
  image: string | null;
  size: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative aspect-square shrink-0 overflow-hidden rounded-full bg-surface-secondary",
        className,
      )}
    >
      {image ? (
        <Image src={image} alt={host.name} fill sizes={`${size}px`} className="object-cover" priority />
      ) : (
        <LogoFallback />
      )}
    </div>
  );
}

function LogoFallback({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("grid size-full place-items-center bg-ink [--logo-mark:var(--volt)]", className)}
    >
      <LogoIcon className="h-auto w-[42%]" />
    </span>
  );
}

function Socials({ host, onDeep = false }: { host: HostDTO; onDeep?: boolean }) {
  if (host.socials.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {host.socials.map((social) => (
        <ButtonLink
          key={social.url}
          href={social.url}
          external
          variant={onDeep ? "outline" : "secondary"}
          size="sm"
          className={
            onDeep
              ? "border-[color-mix(in_oklch,var(--host-on-deep)_45%,transparent)] text-[var(--host-on-deep)] hover:bg-[color-mix(in_oklch,var(--host-on-deep)_12%,transparent)]"
              : undefined
          }
        >
          {social.label}
          <Icon icon={ExternalLinkIcon} />
        </ButtonLink>
      ))}
    </div>
  );
}

/** Ueberschrift eines Profilabschnitts, davor eine kurze Pille in Personenfarbe. */
function SectionTitle({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="mb-6 flex items-center gap-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
    >
      <span aria-hidden="true" className="h-2.5 w-7 shrink-0 rounded-full bg-[var(--host-accent)]" />
      <span className="min-w-0 break-words">{children}</span>
    </h2>
  );
}

function Bio({ bio }: { bio: string }) {
  return (
    <div className="flex max-w-[65ch] flex-col gap-4 text-lg leading-relaxed text-pretty text-foreground">
      {bio
        .split("\n")
        .filter(Boolean)
        .map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
    </div>
  );
}

function About({ host }: { host: HostDTO }) {
  return (
    <div className="min-w-0">
      <SectionTitle>Über {host.name}</SectionTitle>
      <Bio bio={host.bio} />
      {host.quote && (
        <blockquote className="mt-10 max-w-[60ch] rounded-3xl border border-[color-mix(in_oklch,var(--host-accent)_30%,transparent)] bg-[var(--host-soft)] p-6 text-xl leading-snug font-bold tracking-tight text-balance text-foreground sm:p-8 sm:text-2xl">
          <p>{host.quote}</p>
        </blockquote>
      )}
    </div>
  );
}

/**
 * Steckbrief: Angaben als Kacheln und die Musikrichtungen. Leer heisst: nicht
 * da. `plain` laesst Karte und Ueberschrift weg — fuer die Profilkarte, die
 * schon eine Karte ist.
 */
function Profile({ host, facts, plain = false }: { host: HostDTO; facts: Fact[]; plain?: boolean }) {
  if (facts.length === 0 && host.genres.length === 0) return null;

  const body = (
    <>
      {facts.length > 0 && (
        <dl className="grid grid-cols-2 gap-2">
          {facts.map((fact) => (
            <div key={fact.label} className="min-w-0 rounded-2xl bg-surface-secondary px-4 py-3">
              <dt className="text-xs text-muted">{fact.label}</dt>
              <dd className="mt-0.5 font-bold break-words text-foreground">{fact.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {host.genres.length > 0 && (
        <div className={cn(facts.length > 0 && "mt-5")}>
          <p className="mb-2 text-xs text-muted">Musik</p>
          <ul className="flex flex-wrap gap-1.5" aria-label="Musikrichtungen">
            {host.genres.map((genre) => (
              <li
                key={genre}
                className="rounded-full border border-[color-mix(in_oklch,var(--host-accent)_35%,transparent)] bg-[var(--host-soft)] px-3 py-1 text-sm font-semibold text-[var(--host-ink)]"
              >
                {genre}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );

  if (plain) return body;

  return (
    <aside aria-label={`Steckbrief ${host.name}`} className="min-w-0 lg:self-start">
      <div className="surface-card rounded-3xl p-5 sm:p-6">
        <h2 className="mb-4 text-lg font-bold tracking-tight text-foreground">Steckbrief</h2>
        {body}
      </div>
    </aside>
  );
}

/** Drei feine Kreise in Personenfarbe — Funkwellen, kein Verlauf, kein Leuchten. */
function Waves({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className={cn("pointer-events-none absolute", className)}>
      <span className="absolute top-1/2 left-1/2 size-[18rem] -translate-1/2 rounded-full border border-[color-mix(in_oklch,var(--host-accent)_40%,transparent)]" />
      <span className="absolute top-1/2 left-1/2 size-[30rem] -translate-1/2 rounded-full border border-[color-mix(in_oklch,var(--host-accent)_26%,transparent)]" />
      <span className="absolute top-1/2 left-1/2 size-[42rem] -translate-1/2 rounded-full border border-[color-mix(in_oklch,var(--host-accent)_14%,transparent)]" />
    </span>
  );
}

/* ------------------------------------------------------------------------ */
/* Aufbau "Bühne": getoente Flaeche, grosses rundes Bild                     */
/* ------------------------------------------------------------------------ */

function StageHero({ host, image }: { host: HostDTO; image: string | null }) {
  return (
    <header className="shell pt-10 sm:pt-14">
      <Crumbs host={host} />
      <div className="relative mt-8 overflow-hidden rounded-[var(--radius)] bg-[var(--host-soft)] px-6 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-16">
        {/* Die Wellen gehen vom Bild aus. */}
        <Waves className="top-[7rem] left-[6rem] sm:top-[9.5rem] sm:left-[8.5rem] md:top-1/2 lg:left-[10.5rem]" />
        <div className="relative flex flex-col items-start gap-8 md:flex-row md:items-center md:gap-12">
          <Avatar
            host={host}
            image={image}
            size={240}
            className="w-36 ring-4 ring-[var(--host-accent)] ring-offset-4 ring-offset-[var(--host-soft)] sm:w-48 lg:w-56"
          />
          <div className="flex w-full min-w-0 flex-col gap-4 @container">
            <span className="w-fit rounded-full bg-[var(--host-deep)] px-3.5 py-1 text-sm font-semibold text-[var(--host-on-deep)]">
              {host.role}
            </span>
            {/* Groesse nach Spaltenbreite: Auch ein langer Name in einem Wort
                bricht nicht mitten im Wort um. */}
            <h1 className="font-display text-[clamp(2.25rem,12cqw,5rem)] leading-[0.92] text-balance break-words text-foreground">
              {host.name}
            </h1>
            {host.tagline && (
              <p className="max-w-[52ch] text-lg text-pretty text-muted">{host.tagline}</p>
            )}
            <Socials host={host} />
          </div>
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------------ */
/* Aufbau "Poster": Bild und Name als ein Block in Personenfarbe             */
/* ------------------------------------------------------------------------ */

function PosterHero({ host, image }: { host: HostDTO; image: string | null }) {
  return (
    <header className="shell pt-10 sm:pt-14">
      <Crumbs host={host} />
      <div className="mt-8 grid overflow-hidden rounded-[2.5rem] bg-[var(--host-deep)] text-[var(--host-on-deep)] md:grid-cols-2">
        <div className="relative aspect-square">
          {image ? (
            <Image
              src={image}
              alt={host.name}
              fill
              sizes="(max-width: 768px) 100vw, 640px"
              className="object-cover"
              priority
            />
          ) : (
            /* Ohne Bild bleibt der Block eine Flaeche in Personenfarbe. */
            <LogoFallback className="bg-[var(--host-deep)]" />
          )}
        </div>
        <div className="flex min-w-0 flex-col justify-between gap-10 p-6 @container sm:p-10 lg:p-14">
          <span className="w-fit rounded-full border border-[color-mix(in_oklch,var(--host-on-deep)_40%,transparent)] px-3.5 py-1 text-sm font-semibold">
            {host.role}
          </span>
          <div className="flex flex-col gap-5">
            <h1 className="font-display text-[clamp(2.75rem,16cqw,7rem)] leading-[0.86] break-words">
              {host.name}
            </h1>
            {host.tagline && (
              <p className="max-w-[44ch] text-lg text-pretty opacity-85">{host.tagline}</p>
            )}
            <Socials host={host} onDeep />
          </div>
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------------ */
/* Aufbau "Karte": wie ein App-Profil, Karte links, Inhalt rechts            */
/* ------------------------------------------------------------------------ */

function ProfileCard({
  host,
  image,
  facts,
}: {
  host: HostDTO;
  image: string | null;
  facts: Fact[];
}) {
  const hasProfile = facts.length > 0 || host.genres.length > 0;

  return (
    <aside aria-label={`Profil ${host.name}`} className="min-w-0 lg:self-start">
      <article className="surface-card overflow-hidden rounded-[var(--radius)]">
        <div aria-hidden="true" className="relative h-28 overflow-hidden bg-[var(--host-deep)] sm:h-32">
          <span className="absolute -top-16 -right-10 size-48 rounded-full border border-[color-mix(in_oklch,var(--host-on-deep)_22%,transparent)]" />
          <span className="absolute -top-28 -right-24 size-80 rounded-full border border-[color-mix(in_oklch,var(--host-on-deep)_14%,transparent)]" />
        </div>
        <div className="px-5 pb-6 sm:px-6">
          <Avatar
            host={host}
            image={image}
            size={112}
            className="-mt-12 w-24 ring-[6px] ring-[var(--surface)] sm:w-28"
          />
          <div className="mt-4 min-w-0 @container">
            <h1 className="font-display text-[clamp(2rem,14cqw,2.9rem)] leading-[0.95] break-words text-foreground">
              {host.name}
            </h1>
            <p className="mt-2 font-semibold text-[var(--host-ink)]">{host.role}</p>
          </div>
          {host.tagline && (
            <p className="mt-5 rounded-2xl bg-[var(--host-soft)] px-4 py-3 text-sm leading-relaxed text-pretty text-foreground">
              {host.tagline}
            </p>
          )}
          {host.socials.length > 0 && (
            <div className="mt-5">
              <Socials host={host} />
            </div>
          )}
          {hasProfile && (
            <div className="mt-6 border-t border-separator pt-6">
              <Profile host={host} facts={facts} plain />
            </div>
          )}
        </div>
      </article>
    </aside>
  );
}

/* ------------------------------------------------------------------------ */
/* Unter jedem Aufbau                                                        */
/* ------------------------------------------------------------------------ */

function ShowList({
  shows,
  className = "shell pt-16 sm:pt-20",
}: {
  shows: ShowDTO[];
  className?: string;
}) {
  if (shows.length === 0) return null;

  return (
    <section className={className} aria-labelledby="shows-title">
      <SectionTitle id="shows-title">Sendungen</SectionTitle>
      <ul className="grid gap-4 md:grid-cols-2">
        {shows.map((show) => (
          <li key={show.id} className="surface-card flex gap-4 rounded-3xl p-5">
            <span
              aria-hidden="true"
              className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[var(--host-deep)] text-base font-bold text-[var(--host-on-deep)]"
            >
              {WEEKDAY_LABELS[show.weekday].slice(0, 2)}
            </span>
            <div className="min-w-0">
              <h3 className="text-lg leading-tight font-bold tracking-tight break-words text-foreground">
                {show.title}
              </h3>
              <p className="mt-1.5 font-mono text-xs text-muted">
                {WEEKDAY_LABELS[show.weekday]}, {show.startTime}–{show.endTime} Uhr
              </p>
              <p className="mt-3 text-sm leading-relaxed text-pretty text-muted">{show.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Beitraege, die diese Person geschrieben hat. */
function AuthorArticles({
  host,
  articles,
  className = "shell pt-16 sm:pt-20",
}: {
  host: HostDTO;
  articles: ArticleDTO[];
  className?: string;
}) {
  if (articles.length === 0) return null;

  return (
    <section className={className}>
      <SectionTitle>Beiträge von {host.name}</SectionTitle>
      <ul className="surface-card flex flex-col gap-1 rounded-3xl p-2">
        {articles.map((article) => (
          <li key={article.id}>
            <Link
              href={`/news/${article.slug}`}
              className="group flex flex-col gap-1 rounded-2xl px-4 py-3.5 transition-colors hover:bg-surface-secondary sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
            >
              <span className="font-semibold text-foreground transition-colors group-hover:text-[var(--host-ink)]">
                {article.title}
              </span>
              <span className="flex shrink-0 gap-3 font-mono text-xs text-muted">
                {article.publishedAt && <span>{formatDate(article.publishedAt)}</span>}
                <span>{formatReadingTime(article.readingTime)}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Die anderen aus dem Team, mit Bild. */
function Team({ title, hosts }: { title: string; hosts: HostDTO[] }) {
  if (hosts.length === 0) return null;

  return (
    <section className="shell pt-16 sm:pt-20">
      <SectionTitle>{title}</SectionTitle>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {hosts.map((other) => (
          <li key={other.id}>
            <TeamLink host={other} />
          </li>
        ))}
      </ul>
    </section>
  );
}

async function TeamLink({ host }: { host: HostDTO }) {
  const image = await resolveHostImage(host);
  return (
    <Link
      href={`/moderatoren/${host.slug}`}
      className="surface-card hover-lift flex items-center gap-4 rounded-2xl p-3 pr-5"
    >
      <span className="relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-full bg-surface-secondary">
        {image ? (
          <Image src={image} alt="" fill sizes="56px" className="object-cover" />
        ) : (
          <LogoFallback />
        )}
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="truncate font-bold tracking-tight text-foreground">{host.name}</span>
        <span className="truncate text-sm text-muted">{host.role}</span>
      </span>
    </Link>
  );
}
