import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";

import { PageHeader } from "@/components/common/page-header";
import { ButtonLink } from "@/components/common/button-link";
import { Badge } from "@/components/ui/badge";
import { ImagePlaceholder } from "@/components/common/image-placeholder";
import { Icon, ExternalLinkIcon, ClockIcon } from "@/lib/icons";
import { getHostBySlug, getShowsBySlugs, listHosts, type HostDTO, type ShowDTO } from "@/services/content";
import { resolveHostImage } from "@/services/discord/avatar";
import { WEEKDAY_LABELS } from "@/services/radio/schedule";
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

  const [shows, image] = await Promise.all([
    getShowsBySlugs(host.showSlugs),
    resolveHostImage(host),
  ]);

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
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* Shared pieces                                                             */
/* ------------------------------------------------------------------------ */

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
