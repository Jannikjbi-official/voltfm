import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { getSpotlightBySlug } from "@/services/content/spotlights";
import { SPOTLIGHT_ARTEN, formatMonat } from "@/lib/spotlight";

type Params = { slug: string };

/* Kein generateStaticParams — aus demselben Grund wie bei /events/[slug]. */

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = await getSpotlightBySlug(slug);
  if (!item) return { title: "Porträt nicht gefunden" };

  return {
    title: `Im Fokus: ${item.name}`,
    description: item.kurz,
    alternates: { canonical: `/spotlight/${item.slug}` },
    openGraph: {
      type: "article",
      title: `Im Fokus: ${item.name}`,
      description: item.kurz,
      images: item.bild ? [item.bild] : undefined,
    },
  };
}

export const revalidate = 600;

export default async function SpotlightDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const item = await getSpotlightBySlug(slug);
  if (!item) notFound();

  return (
    <article>
      <header className="shell pt-2">
        <div className="surface-card grid gap-2 rounded-[var(--radius)] p-2 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <div className="flex min-w-0 flex-col px-3 pt-3 pb-5 sm:px-6 sm:pt-4 sm:pb-8">
            <Breadcrumbs
              items={[
                { href: "/", label: "Start" },
                { href: "/spotlight", label: "Im Fokus" },
                { href: `/spotlight/${item.slug}`, label: item.name },
              ]}
            />
            <div className="mt-8 flex flex-wrap items-center gap-2 sm:mt-12">
              <span className="rounded-[3px] bg-volt px-2 py-0.5 font-mono text-[0.7rem] font-semibold lowercase text-graphite">
                {SPOTLIGHT_ARTEN[item.art]}
              </span>
              <span className="display-panel rounded-[3px] px-2 py-0.5 font-dot text-xs text-display-foreground">
                {formatMonat(item.monat)}
              </span>
            </div>
            <h1 className="mt-6 font-display text-[2.4rem] text-balance break-words hyphens-auto text-foreground sm:text-6xl lg:text-7xl">
              {item.name}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-pretty text-muted sm:text-xl">{item.kurz}</p>
          </div>

          {item.bild && (
            <div className="well relative aspect-[4/3] overflow-hidden rounded-[3px] md:aspect-auto md:min-h-[20rem]">
              <Image
                src={item.bild}
                alt=""
                fill
                priority
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover"
              />
            </div>
          )}
        </div>
      </header>

      <div className="shell pt-2">
        {item.content && (
          <div className="surface-card min-w-0 rounded-[var(--radius)] px-5 py-8 sm:px-10 sm:py-10">
            <div className="vfm-prose max-w-[68ch]" dangerouslySetInnerHTML={{ __html: item.content }} />
          </div>
        )}

        <div className="pt-12 sm:pt-16">
          <Link
            href="/spotlight"
            className="key inline-flex items-center rounded-[var(--radius)] bg-surface px-4 py-2 font-wide text-sm font-bold text-foreground ring-1 ring-border transition-colors hover:bg-volt hover:text-graphite"
          >
            Alle Porträts
          </Link>
        </div>
      </div>
    </article>
  );
}
