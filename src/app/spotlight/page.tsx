import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { ButtonLink } from "@/components/common/button-link";
import { listSpotlights, type SpotlightDTO } from "@/services/content/spotlights";
import { SPOTLIGHT_ARTEN, formatMonat } from "@/lib/spotlight";

export const metadata: Metadata = {
  title: "Im Fokus",
  description: "Kurze Porträts von Leuten aus dem VoltFM-Team und aus der Hörerschaft.",
  alternates: { canonical: "/spotlight" },
};

export const revalidate = 3600;

export default async function SpotlightPage() {
  const items = await listSpotlights();
  const [current, ...archive] = items;

  return (
    <>
      <PageHeader
        size="large"
        title="Im Fokus"
        description="Kurze Porträts von Leuten aus dem VoltFM-Team und aus der Hörerschaft."
        breadcrumbs={[
          { href: "/", label: "Start" },
          { href: "/spotlight", label: "Im Fokus" },
        ]}
      />

      <section className="shell pt-2" aria-label="Aktuell im Fokus">
        {current ? (
          <CurrentSpotlight item={current} />
        ) : (
          <EmptyState
            title="Noch niemand im Fokus"
            description="Hier stellen wir bald Leute aus dem Team und aus der Hörerschaft vor."
          />
        )}
      </section>

      {archive.length > 0 && (
        <section className="shell pt-12 sm:pt-16" aria-labelledby="archiv-title">
          <div className="mb-6 flex items-end justify-between gap-4 border-b border-border pb-5">
            <h2 id="archiv-title" className="font-display text-[2.1rem] text-balance text-foreground sm:text-5xl">
              Bisher im Fokus
            </h2>
            <span className="display-panel shrink-0 rounded-[3px] px-2.5 py-1 font-dot text-sm text-volt">
              {archive.length}
            </span>
          </div>
          <ul className="well grid gap-2 rounded-[var(--radius)] p-2 sm:grid-cols-2 lg:grid-cols-3">
            {archive.map((item) => (
              <li key={item.id}>
                <SpotlightCard item={item} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

/** Das aktuelle Porträt groß: Bild im Fenster, daneben Monat als Display und Text. */
function CurrentSpotlight({ item }: { item: SpotlightDTO }) {
  return (
    <article className="group surface-card relative grid gap-2 rounded-[var(--radius)] p-2 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <div className="well relative aspect-[4/3] overflow-hidden rounded-[3px] md:aspect-auto md:min-h-[22rem]">
        {item.bild ? (
          <Image
            src={item.bild}
            alt=""
            fill
            priority
            sizes="(max-width: 768px) 100vw, 40vw"
            className="object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="absolute inset-0 grid place-items-center font-display text-8xl text-muted"
          >
            {item.name.trim().slice(0, 1).toUpperCase()}
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-col gap-5 px-3 py-4 sm:px-6 sm:py-6">
        <div className="display-panel display-dots flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius)] px-4 py-3">
          <span className="flex items-center gap-2 font-meta text-display-muted">
            <span className="led" aria-hidden="true" />
            gerade im fokus
          </span>
          <span className="font-dot text-base text-volt">{formatMonat(item.monat)}</span>
        </div>

        <p className="font-meta text-muted">{SPOTLIGHT_ARTEN[item.art]?.toLowerCase()}</p>
        <h2 className="-mt-2 font-display text-[2.4rem] text-balance break-words hyphens-auto text-foreground sm:text-6xl">
          <Link
            href={`/spotlight/${item.slug}`}
            className="transition-colors after:absolute after:inset-0 group-hover:text-accent-text"
          >
            {item.name}
          </Link>
        </h2>
        <p className="max-w-2xl text-lg leading-relaxed text-pretty text-muted">{item.kurz}</p>

        <div className="relative mt-auto pt-2">
          <ButtonLink href={`/spotlight/${item.slug}`} variant="primary">
            Porträt lesen
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}

/** Ein früheres Porträt als Modul im Archiv. */
function SpotlightCard({ item }: { item: SpotlightDTO }) {
  return (
    <article className="group surface-card hover-lift relative flex h-full flex-col gap-2 rounded-[var(--radius)] p-2">
      <div className="well relative aspect-[16/10] overflow-hidden rounded-[3px]">
        {item.bild ? (
          <Image
            src={item.bild}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <span aria-hidden="true" className="absolute inset-0 grid place-items-center font-display text-6xl text-muted">
            {item.name.trim().slice(0, 1).toUpperCase()}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 px-3 pt-2 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-[3px] bg-default px-2 py-0.5 font-mono text-[0.7rem] font-semibold lowercase text-foreground">
            {SPOTLIGHT_ARTEN[item.art]}
          </span>
          <span className="font-mono text-xs text-muted">{formatMonat(item.monat)}</span>
        </div>
        <h3 className="font-wide text-xl font-bold break-words text-foreground">
          <Link
            href={`/spotlight/${item.slug}`}
            className="transition-colors after:absolute after:inset-0 group-hover:text-accent-text"
          >
            {item.name}
          </Link>
        </h3>
        <p className="line-clamp-3 text-sm leading-relaxed text-pretty text-muted">{item.kurz}</p>
      </div>
    </article>
  );
}
