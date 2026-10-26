import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import { ButtonLink } from "@/components/common/button-link";
import { LogoIcon } from "@/components/layout/logo";
import { Icon, ChevronRightIcon, ClockIcon, ExternalLinkIcon } from "@/lib/icons";
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
import styles from "./page.module.css";

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
    <div className={styles.page} data-layout={layout} style={hueStyle}>
      {layout === "karte" ? (
        <ProfileCard host={host} image={image} facts={facts} />
      ) : (
        <>
          {layout === "poster" ? (
            <PosterHero host={host} image={image} />
          ) : (
            <StageHero host={host} image={image} />
          )}
          <section className={`shell ${styles.block}`}>
            {/* Ohne Steckbrief keine zweite Spalte, die leer bliebe. */}
            <div className={hasProfile ? `${styles.body} ${styles.bodySplit}` : styles.body}>
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
    <nav aria-label="Breadcrumb" className={styles.crumbs}>
      <ol role="list">
        <li>
          <Link href="/">Start</Link>
        </li>
        <li>
          <Icon icon={ChevronRightIcon} className={styles.crumbIcon} aria-hidden />
          <Link href="/moderatoren">Moderatoren</Link>
        </li>
        <li>
          <Icon icon={ChevronRightIcon} className={styles.crumbIcon} aria-hidden />
          <span aria-current="page">{host.name}</span>
        </li>
      </ol>
    </nav>
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
    <div className={`${styles.avatar} ${className ?? ""}`}>
      {image ? (
        <Image
          src={image}
          alt={host.name}
          fill
          sizes={`${size}px`}
          className={styles.avatarImage}
          priority
        />
      ) : (
        <span className={styles.avatarFallback} aria-hidden="true">
          <LogoIcon className={styles.avatarLogo} />
        </span>
      )}
    </div>
  );
}

function Socials({ host }: { host: HostDTO }) {
  if (host.socials.length === 0) return null;
  return (
    <div className={styles.socials}>
      {host.socials.map((social) => (
        <ButtonLink
          key={social.url}
          href={social.url}
          external
          variant="neutral"
          mode="stroke"
          size="sm"
        >
          {social.label}
          <Icon icon={ExternalLinkIcon} />
        </ButtonLink>
      ))}
    </div>
  );
}

function Bio({ bio }: { bio: string }) {
  return (
    <div className={styles.bio}>
      {bio.split("\n").filter(Boolean).map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
    </div>
  );
}

function About({ host }: { host: HostDTO }) {
  return (
    <div className={styles.about}>
      <h2 className={styles.sectionTitle}>Über {host.name}</h2>
      <Bio bio={host.bio} />
      {host.quote && (
        <blockquote className={styles.quote}>
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
    <aside className={styles.profile} aria-label={`Steckbrief ${host.name}`}>
      <h2 className={styles.sectionTitle}>Steckbrief</h2>
      {facts.length > 0 && (
        <dl className={styles.facts}>
          {facts.map((fact) => (
            <div key={fact.label} className={styles.fact}>
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {host.genres.length > 0 && (
        <div className={styles.genres}>
          <p className={styles.genresLabel}>Musik</p>
          <ul className={styles.genreList} role="list">
            {host.genres.map((genre) => (
              <li key={genre} className={styles.genre}>
                {genre}
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}

/* ------------------------------------------------------------------------ */
/* Aufbau "Bühne": breites Farbband, grosses rundes Bild                     */
/* ------------------------------------------------------------------------ */

function StageHero({ host, image }: { host: HostDTO; image: string | null }) {
  return (
    <header className={styles.stage}>
      <div className="shell">
        <Crumbs host={host} />
        <div className={styles.stageInner}>
          <Avatar host={host} image={image} size={240} className={styles.stageAvatar} />
          <div className={styles.stageText}>
            <p className={styles.role}>{host.role}</p>
            <h1 className={styles.stageName}>{host.name}</h1>
            {host.tagline && <p className={styles.tagline}>{host.tagline}</p>}
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
    <header className={styles.poster}>
      <div className={styles.posterImage}>
        {image ? (
          <Image
            src={image}
            alt={host.name}
            fill
            sizes="(max-width: 900px) 100vw, 50vw"
            className={styles.avatarImage}
            priority
          />
        ) : (
          <span className={styles.avatarFallback} aria-hidden="true">
            <LogoIcon className={styles.avatarLogo} />
          </span>
        )}
      </div>
      <div className={styles.posterPanel}>
        <Crumbs host={host} />
        <p className={styles.role}>{host.role}</p>
        <h1 className={styles.posterName}>{host.name}</h1>
        {host.tagline && <p className={styles.tagline}>{host.tagline}</p>}
        <Socials host={host} />
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
    <section className={styles.cardSection}>
      <div className="shell">
        <Crumbs host={host} />
        <article className={styles.card}>
          <div className={styles.cardBanner} aria-hidden="true" />
          <div className={styles.cardHead}>
            <Avatar host={host} image={image} size={136} className={styles.cardAvatar} />
            <div className={styles.cardHeadText}>
              <h1 className={styles.cardName}>{host.name}</h1>
              <p className={styles.cardRole}>{host.role}</p>
            </div>
          </div>
          {host.tagline && <p className={`${styles.tagline} ${styles.cardTagline}`}>{host.tagline}</p>}
          <div className={styles.cardBody}>
            <About host={host} />
            <Profile host={host} facts={facts} />
            <Socials host={host} />
          </div>
        </article>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------------ */
/* Unter jedem Aufbau                                                        */
/* ------------------------------------------------------------------------ */

function ShowList({ shows }: { shows: ShowDTO[] }) {
  if (shows.length === 0) return null;

  return (
    <section className={`shell ${styles.block}`} aria-labelledby="shows-title">
      <h2 id="shows-title" className={styles.sectionTitle}>
        Sendungen
      </h2>
      <ul className={styles.showList} role="list">
        {shows.map((show) => (
          <li key={show.id} className={styles.show}>
            <div className={styles.showHead}>
              <h3 className={styles.showTitle}>{show.title}</h3>
              <span className={styles.showTime}>
                <Icon icon={ClockIcon} />
                {WEEKDAY_LABELS[show.weekday]}, {show.startTime}–{show.endTime} Uhr
              </span>
            </div>
            <p className={styles.showDescription}>{show.description}</p>
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
    <section className={`shell ${styles.block}`}>
      <h2 className={styles.sectionTitle}>Beiträge von {host.name}</h2>
      <ul className={styles.articleList} role="list">
        {articles.map((article) => (
          <li key={article.id}>
            <Link href={`/news/${article.slug}`} className={styles.articleLink}>
              <span className={styles.articleTitle}>{article.title}</span>
              <span className={styles.articleMeta}>
                {article.publishedAt ? formatDate(article.publishedAt) : ""} ·{" "}
                {formatReadingTime(article.readingTime)}
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
    <section className={`shell ${styles.block}`}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      <ul className={styles.teamList} role="list">
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
    <Link href={`/moderatoren/${host.slug}`} className={styles.teamLink}>
      <span className={styles.teamAvatar}>
        {image ? (
          <Image src={image} alt="" fill sizes="48px" className={styles.avatarImage} />
        ) : (
          <LogoIcon className={styles.teamLogo} />
        )}
      </span>
      <span className={styles.teamText}>
        <span className={styles.teamName}>{host.name}</span>
        <span className={styles.teamRole}>{host.role}</span>
      </span>
    </Link>
  );
}
