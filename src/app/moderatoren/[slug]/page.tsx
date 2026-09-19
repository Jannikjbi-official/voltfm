import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import { PageHeader } from "@/components/common/page-header";
import { ButtonLink } from "@/components/common/button-link";
import { Badge } from "@/components/ui/badge";
import { ImagePlaceholder } from "@/components/common/image-placeholder";
import { Icon, ExternalLinkIcon, ClockIcon } from "@/lib/icons";
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
import { WEEKDAY_LABELS } from "@/services/radio/schedule";
import { formatDate, formatReadingTime } from "@/lib/format";
import { site } from "@/lib/site";
import styles from "./page.module.css";

type Params = { slug: string };

export async function generateStaticParams(): Promise<Params[]> {
  const hosts = await listHosts();
  return hosts.map((host) => ({ slug: host.slug }));
}

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

  /* Wer sonst noch auf denselben Sendungen steht. Kommt aus den Sendungen
     selbst, nicht aus einer eigenen Liste — so kann es nicht auseinanderlaufen. */
  const coHostSlugs = new Set(
    shows.flatMap((show) => show.hostSlugs).filter((s) => s !== host.slug),
  );
  const coHosts = allHosts.filter((h) => coHostSlugs.has(h.slug));
  const otherHosts = allHosts.filter((h) => h.slug !== host.slug && !coHostSlugs.has(h.slug));

  const layout = host.profileLayout ?? "spotlight";

  // Each host carries their own accent hue, so their page is recognisably
  // theirs while still being built from the VoltFM tokens.
  const accentStyle = host.accentHue
    ? ({ "--host-accent": `oklch(0.58 0.17 ${host.accentHue})` } as React.CSSProperties)
    : undefined;

  return (
    <div className={styles.page} data-layout={layout} style={accentStyle}>
      {/* "stage" and "zine" bring their own headers, so the shared PageHeader
          is only used where it actually fits the composition. */}
      {(layout === "spotlight" || layout === "editorial") && (
        <PageHeader
          eyebrow={host.role}
          title={host.name}
          breadcrumbs={[
            { href: "/", label: "Start" },
            { href: "/moderatoren", label: "Moderatoren" },
            { href: `/moderatoren/${host.slug}`, label: host.name },
          ]}
        />
      )}

      {layout === "spotlight" && <Spotlight host={host} shows={shows} image={image} />}
      {layout === "editorial" && <Editorial host={host} shows={shows} image={image} />}
      {layout === "stage" && <Stage host={host} shows={shows} image={image} />}
      {layout === "zine" && <Zine host={host} shows={shows} image={image} />}

      {/* Faktenleiste, Zitat und Beitraege stehen unter jedem Layout — sie
          sind Inhalt, keine Komposition, und sollen nicht viermal existieren. */}
      <Facts host={host} shows={shows} articleCount={articleCount} />
      <AuthorArticles host={host} articles={articles} />
      <RelatedHosts title={`Zusammen mit ${host.name} auf Sendung`} hosts={coHosts} />
      <RelatedHosts title="Weitere Stimmen" hosts={otherHosts} />
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* Shared pieces                                                             */
/* ------------------------------------------------------------------------ */

/**
 * Zahlen und Angaben, die sich aus den Daten ergeben — nichts davon ist
 * erfunden: Sendungen und Sendezeit kommen aus dem Sendeplan, der Rest aus
 * dem Profil. Leere Angaben tauchen gar nicht erst auf.
 */
function Facts({
  host,
  shows,
  articleCount,
}: {
  host: HostDTO;
  shows: ShowDTO[];
  articleCount: number;
}) {
  const weeklyMinutes = shows.reduce((sum, show) => {
    const [sh, sm] = show.startTime.split(":").map(Number);
    const [eh, em] = show.endTime.split(":").map(Number);
    // Ueber Mitternacht laufende Sendungen ergeben sonst eine negative Dauer.
    const minutes = ((eh * 60 + em - (sh * 60 + sm)) + 1440) % 1440;
    return sum + minutes;
  }, 0);

  const facts: { label: string; value: string }[] = [];
  if (host.joinedAt) facts.push({ label: "Dabei seit", value: formatDate(host.joinedAt, "short") });
  if (shows.length > 0) {
    facts.push({ label: "Sendungen", value: String(shows.length) });
    facts.push({
      label: "Pro Woche",
      value: weeklyMinutes >= 60
        ? `${Math.round((weeklyMinutes / 60) * 10) / 10} Std.`
        : `${weeklyMinutes} Min.`,
    });
  }
  if (articleCount > 0) facts.push({ label: "Beiträge", value: String(articleCount) });
  if (host.location) facts.push({ label: "Sitzt in", value: host.location });
  // Frei im Admin gepflegte Angaben stehen hinter den abgeleiteten.
  for (const detail of host.details) facts.push(detail);

  if (facts.length === 0 && host.genres.length === 0 && !host.quote) return null;

  return (
    <section className="section shell">
      {host.quote && (
        <blockquote className={styles.quote}>
          <p>{host.quote}</p>
          <cite>{host.name}</cite>
        </blockquote>
      )}

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
          <h2 className={styles.sectionTitle}>Steht für</h2>
          <ul className={styles.genreList} role="list">
            {host.genres.map((genre) => (
              <li key={genre} className={styles.genre}>
                {genre}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

/**
 * Andere Moderatorinnen und Moderatoren — einmal die, mit denen diese Person
 * eine Sendung teilt, einmal der Rest des Teams.
 */
function RelatedHosts({ title, hosts }: { title: string; hosts: HostDTO[] }) {
  if (hosts.length === 0) return null;

  return (
    <section className="section shell">
      <h2 className={styles.sectionTitle}>{title}</h2>
      <ul className={styles.relatedList} role="list">
        {hosts.map((other) => (
          <li key={other.id}>
            <Link href={`/moderatoren/${other.slug}`} className={styles.relatedLink}>
              <span className={styles.relatedName}>{other.name}</span>
              <span className={styles.relatedRole}>{other.role}</span>
            </Link>
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
    <section className="section shell">
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

function Portrait({
  host,
  image,
  className,
  priority = false,
}: {
  host: HostDTO;
  image: string | null;
  className?: string;
  priority?: boolean;
}) {
  return (
    <div className={`${styles.portrait} ${className ?? ""}`}>
      {image ? (
        <Image
          src={image}
          alt={host.name}
          fill
          sizes="(max-width: 900px) 100vw, 420px"
          className={styles.portraitImage}
          priority={priority}
        />
      ) : (
        <ImagePlaceholder label={host.name} ratio="auto" className={styles.portraitFallback} />
      )}
    </div>
  );
}

function ShowList({ shows }: { shows: ShowDTO[] }) {
  if (shows.length === 0) return null;

  return (
    <section className={styles.shows} aria-labelledby="shows-title">
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

function Bio({ bio, className }: { bio: string; className?: string }) {
  return (
    <div className={className ?? styles.bio}>
      {bio.split("\n").map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* Layout 1 — Spotlight: sticky portrait on the right, copy leads            */
/* ------------------------------------------------------------------------ */

function Spotlight({ host, shows, image }: { host: HostDTO; shows: ShowDTO[]; image: string | null }) {
  return (
    <section className="section shell">
      <div className={styles.spotlight}>
        <div className={styles.spotlightMain}>
          <Bio bio={host.bio} />
          <ShowList shows={shows} />
        </div>
        <aside className={styles.spotlightSide}>
          <Portrait host={host} image={image} priority />
          <Socials host={host} />
          <ButtonLink href="/radio" variant="primary" mode="filled" size="md">
            Live hören
          </ButtonLink>
        </aside>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------------ */
/* Layout 2 — Editorial: wide pull-quote opening, single measured column     */
/* ------------------------------------------------------------------------ */

function Editorial({ host, shows, image }: { host: HostDTO; shows: ShowDTO[]; image: string | null }) {
  const [opening, ...rest] = host.bio.split(". ");

  return (
    <section className="section shell">
      <div className={styles.editorial}>
        <p className={styles.editorialLead}>{opening}.</p>

        <div className={styles.editorialBody}>
          <Portrait host={host} image={image} className={styles.editorialPortrait} priority />
          <div className={styles.editorialText}>
            <p>{rest.join(". ")}</p>
            <Socials host={host} />
          </div>
        </div>

        <ShowList shows={shows} />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------------ */
/* Layout 3 — Stage: full-bleed accent hero, built for the loud one          */
/* ------------------------------------------------------------------------ */

function Stage({ host, shows, image }: { host: HostDTO; shows: ShowDTO[]; image: string | null }) {
  return (
    <>
      <section className={styles.stageHero}>
        <div className="shell">
          <div className={styles.stageInner}>
            <Portrait host={host} image={image} className={styles.stagePortrait} priority />
            <div className={styles.stageText}>
              <Badge mode="filled" size="sm">
                {host.role}
              </Badge>
              <h1 className={styles.stageName}>{host.name}</h1>
              <p className={styles.stageTagline}>
                Muss um drei Uhr nachts das Potenzial haben, dass die Polizei
                klingelt.
              </p>
              <Socials host={host} />
            </div>
          </div>
        </div>
      </section>

      <section className="section shell">
        <div className={styles.stageBody}>
          <Bio bio={host.bio} className={styles.stageBio} />
          <ShowList shows={shows} />
        </div>
      </section>
    </>
  );
}

/* ------------------------------------------------------------------------ */
/* Layout 4 — Zine: asymmetric grid with an oversized name                   */
/* ------------------------------------------------------------------------ */

function Zine({ host, shows, image }: { host: HostDTO; shows: ShowDTO[]; image: string | null }) {
  return (
    <section className={styles.zine}>
      <div className="shell">
        <header className={styles.zineHead}>
          <h1 className={styles.zineName}>{host.name}</h1>
          <p className={styles.zineRole}>{host.role}</p>
        </header>

        <div className={styles.zineGrid}>
          <Portrait host={host} image={image} className={styles.zinePortrait} priority />
          <div className={styles.zineText}>
            <Bio bio={host.bio} />
            <Socials host={host} />
          </div>
        </div>

        <ShowList shows={shows} />
      </div>
    </section>
  );
}
