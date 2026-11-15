import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import { ButtonLink } from "@/components/common/button-link";
import { LogoIcon } from "@/components/layout/logo";
import { Chip, cn } from "@heroui/react";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { Icon, ClockIcon, ExternalLinkIcon } from "@/lib/icons";
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
 *   buehne — getoentes Band, grosses rundes Bild, Name daneben
 *   poster — Bild randlos neben einer Flaeche in Personenfarbe
 *   karte  — wie ein Discord-Profil: Banner, Bild darueber, alles auf einer Karte
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
        <ProfileCard host={host} image={image} facts={facts} />
      ) : (
        <>
          {layout === "poster" ? (
            <PosterHero host={host} image={image} />
          ) : (
            <StageHero host={host} image={image} />
          )}
          <section className="shell pt-12 sm:pt-16">
            {/* Ohne Steckbrief keine zweite Spalte, die leer bliebe. */}
            <div
              className={cn(
                "grid gap-10",
                hasProfile && "lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16",
              )}
            >
              <About host={host} />
              <Profile host={host} facts={facts} />
            </div>
          </section>
        </>
      )}

      <ShowList shows={shows} />
      <AuthorArticles host={host} articles={articles} />
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
          ? `${Math.round((weeklyMinutes / 60) * 10) / 10} Std.`
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

function LogoFallback() {
  return (
    <span
      aria-hidden="true"
      className="grid size-full place-items-center bg-ink [--logo-mark:var(--volt)]"
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
          variant="outline"
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

/** Ueberschrift eines Profilabschnitts, mit einer Linie in Personenfarbe. */
function SectionTitle({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="mb-5 border-b-2 border-[var(--host-accent)] pb-2.5 font-wide text-xl font-bold text-foreground sm:text-2xl"
    >
      {children}
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
        <blockquote className="mt-8 border-l-4 border-[var(--host-accent)] py-1 pl-5 font-wide text-xl leading-snug text-balance text-foreground italic">
          <p>{host.quote}</p>
        </blockquote>
      )}
    </div>
  );
}

/** Steckbrief: Angaben und Musikrichtungen. Leer heisst: nicht da. */
function Profile({ host, facts }: { host: HostDTO; facts: Fact[] }) {
  if (facts.length === 0 && host.genres.length === 0) return null;

  return (
    <aside aria-label={`Steckbrief ${host.name}`} className="min-w-0">
      <SectionTitle>Steckbrief</SectionTitle>
      {facts.length > 0 && (
        <dl className="flex flex-col divide-y divide-separator">
          {facts.map((fact) => (
            <div key={fact.label} className="flex items-baseline justify-between gap-4 py-2.5">
              <dt className="text-sm text-muted">{fact.label}</dt>
              <dd className="text-right font-semibold break-words text-foreground">{fact.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {host.genres.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 text-sm text-muted">Musik</p>
          <ul className="flex flex-wrap gap-1.5" aria-label="Musikrichtungen">
            {host.genres.map((genre) => (
              <li key={genre}>
                <Chip size="sm" variant="soft">
                  {genre}
                </Chip>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}

/* ------------------------------------------------------------------------ */
/* Aufbau "Bühne": getoentes Band, grosses rundes Bild                       */
/* ------------------------------------------------------------------------ */

function StageHero({ host, image }: { host: HostDTO; image: string | null }) {
  return (
    <header className="border-b-4 border-[var(--host-accent)] bg-[var(--host-soft)]">
      <div className="shell pt-8 pb-12 sm:pb-16">
        <Crumbs host={host} />
        <div className="mt-8 flex flex-col items-start gap-8 sm:flex-row sm:items-center sm:gap-12">
          <Avatar host={host} image={image} size={240} className="w-40 sm:w-52 lg:w-60" />
          <div className="flex w-full min-w-0 flex-col gap-4 @container">
            <p className="font-semibold text-[var(--host-ink)]">{host.role}</p>
            {/* Groesse nach Spaltenbreite: Auch ein langer Name in einem Wort
                bricht nicht mitten im Wort um. */}
            <h1 className="font-display text-[clamp(2.25rem,12cqw,4.5rem)] leading-[0.92] text-balance break-words text-foreground">
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
/* Aufbau "Poster": Bild randlos, Name auf der Personenfarbe                 */
/* ------------------------------------------------------------------------ */

function PosterHero({ host, image }: { host: HostDTO; image: string | null }) {
  return (
    <header>
      <div className="shell py-5">
        <Crumbs host={host} />
      </div>
      <div className="grid bg-[var(--host-deep)] text-[var(--host-on-deep)] md:min-h-[min(78vh,720px)] md:grid-cols-2">
        <div className="relative aspect-square md:aspect-auto">
          {image ? (
            <Image
              src={image}
              alt={host.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          ) : (
            <LogoFallback />
          )}
        </div>
        <div className="flex min-w-0 flex-col justify-end gap-5 px-4 py-10 @container sm:px-8 md:px-12 md:py-14 lg:px-16">
          <p className="font-semibold opacity-85">{host.role}</p>
          <h1 className="font-display text-[clamp(2.5rem,14cqw,6rem)] leading-[0.88] break-words">
            {host.name}
          </h1>
          {host.tagline && <p className="max-w-[44ch] text-lg text-pretty opacity-85">{host.tagline}</p>}
          <Socials host={host} onDeep />
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------------ */
/* Aufbau "Karte": wie ein Discord-Profil, alles auf einer Karte             */
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
  return (
    <section className="shell pt-8">
      <Crumbs host={host} />
      <article className="mx-auto mt-8 max-w-3xl overflow-hidden rounded-3xl border border-border bg-surface">
        <div aria-hidden="true" className="h-28 bg-[var(--host-deep)] sm:h-40" />
        <div className="px-5 pb-8 sm:px-10">
          <div className="-mt-14 flex flex-col gap-4 sm:-mt-16">
            <Avatar
              host={host}
              image={image}
              size={136}
              className="w-28 ring-[6px] ring-[var(--surface)] sm:w-[8.5rem]"
            />
            <div className="min-w-0 @container">
              <h1 className="font-display text-[clamp(2rem,9cqw,3.25rem)] leading-[0.95] break-words text-foreground">
                {host.name}
              </h1>
              <p className="mt-2 font-semibold text-[var(--host-ink)]">{host.role}</p>
            </div>
          </div>
          {host.tagline && (
            <p className="mt-6 rounded-xl bg-[var(--host-soft)] px-4 py-3 text-pretty text-foreground">
              {host.tagline}
            </p>
          )}
          <div className="mt-8 flex flex-col gap-10">
            <About host={host} />
            <Profile host={host} facts={facts} />
            <Socials host={host} />
          </div>
        </div>
      </article>
    </section>
  );
}

/* ------------------------------------------------------------------------ */
/* Unter jedem Aufbau                                                        */
/* ------------------------------------------------------------------------ */

function ShowList({ shows }: { shows: ShowDTO[] }) {
  if (shows.length === 0) return null;

  return (
    <section className="shell pt-14 sm:pt-16" aria-labelledby="shows-title">
      <SectionTitle id="shows-title">Sendungen</SectionTitle>
      <ul className="grid gap-4 md:grid-cols-2">
        {shows.map((show) => (
          <li
            key={show.id}
            className="rounded-2xl border border-border border-l-4 border-l-[var(--host-accent)] bg-surface p-5"
          >
            <h3 className="font-wide text-lg font-bold text-foreground">{show.title}</h3>
            <p className="mt-1 inline-flex items-center gap-2 text-sm text-muted">
              <Icon icon={ClockIcon} className="text-xs" />
              {WEEKDAY_LABELS[show.weekday]}, {show.startTime}–{show.endTime} Uhr
            </p>
            <p className="mt-3 text-sm leading-relaxed text-pretty text-muted">{show.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Beitraege, die diese Person geschrieben hat. */
function AuthorArticles({ host, articles }: { host: HostDTO; articles: ArticleDTO[] }) {
  if (articles.length === 0) return null;

  return (
    <section className="shell pt-14 sm:pt-16">
      <SectionTitle>Beiträge von {host.name}</SectionTitle>
      <ul className="flex flex-col divide-y divide-separator">
        {articles.map((article) => (
          <li key={article.id}>
            <Link
              href={`/news/${article.slug}`}
              className="group flex flex-col gap-1 rounded-md py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
            >
              <span className="font-semibold text-foreground decoration-[var(--host-accent)] decoration-2 underline-offset-4 group-hover:underline">
                {article.title}
              </span>
              <span className="flex shrink-0 gap-3 text-sm text-muted">
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
    <section className="shell pt-14 sm:pt-16">
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
      className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3 transition-colors hover:border-[var(--host-accent)]"
    >
      <span className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-full bg-surface-secondary">
        {image ? (
          <Image src={image} alt="" fill sizes="48px" className="object-cover" />
        ) : (
          <LogoFallback />
        )}
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="truncate font-semibold text-foreground">{host.name}</span>
        <span className="truncate text-sm text-muted">{host.role}</span>
      </span>
    </Link>
  );
}
