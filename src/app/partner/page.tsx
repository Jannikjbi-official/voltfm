import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { listPartners, type PartnerDTO } from "@/services/content/partners";
import { PartnerLogo } from "./partner-logo";

export const metadata: Metadata = {
  title: "Partner",
  description: "Streamer und Projekte, mit denen VoltFM zusammenarbeitet.",
  alternates: { canonical: "/partner" },
};

export const revalidate = 3600;

export default async function PartnerPage() {
  const partners = await listPartners();

  return (
    <>
      <PageHeader
        size="large"
        title="Partner"
        description="Streamer und Projekte, mit denen VoltFM zusammenarbeitet."
        breadcrumbs={[
          { href: "/", label: "Start" },
          { href: "/partner", label: "Partner" },
        ]}
      />

      <section className="shell pt-2" aria-label="Alle Partner">
        {partners.length > 0 ? (
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {partners.map((partner) => (
              <li key={partner.id}>
                <PartnerCard partner={partner} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="Noch keine Partner eingetragen"
            description="Hier stehen bald die Streamer und Projekte, mit denen wir zusammenarbeiten."
          />
        )}
      </section>
    </>
  );
}

/**
 * Ein Partner als Modul: oben das Logo in seinem Fenster, darunter Name und
 * Kurzbeschreibung, unten die Kanaele als Beschriftung. Die ganze Karte ist
 * ueber den Namen klickbar.
 */
function PartnerCard({ partner }: { partner: PartnerDTO }) {
  return (
    <article className="group surface-card hover-lift relative flex h-full flex-col gap-2 rounded-[var(--radius)] p-2">
      <div className="well relative grid aspect-[16/10] place-items-center overflow-hidden rounded-[3px]">
        {/* Gibt es ein Banner, liegt es im Fenster hinter dem Logo. */}
        {partner.banner && (
          <Image
            src={partner.banner}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        )}
        <PartnerLogo partner={partner} size={112} className="relative size-28" />
      </div>

      <div className="flex flex-1 flex-col gap-2 px-3 pt-3 pb-3">
        <h2 className="font-display text-[1.9rem] break-words text-foreground">
          <Link
            href={`/partner/${partner.slug}`}
            className="transition-colors after:absolute after:inset-0 group-hover:text-accent-text"
          >
            {partner.name}
          </Link>
        </h2>
        {partner.kurz && (
          <p className="line-clamp-3 text-sm leading-relaxed text-pretty text-muted">{partner.kurz}</p>
        )}

        {partner.links.length > 0 && (
          <ul className="mt-auto flex flex-wrap gap-1.5 pt-3" aria-label="Kanäle">
            {partner.links.map((link) => (
              <li
                key={`${link.label}-${link.url}`}
                className="rounded-[3px] bg-default px-2 py-0.5 font-mono text-[0.7rem] font-semibold lowercase text-foreground"
              >
                {link.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
