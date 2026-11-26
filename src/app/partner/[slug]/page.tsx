import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";

import Link from "next/link";
import { cn } from "@heroui/react";

import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { ButtonLink } from "@/components/common/button-link";
import { Icon, ExternalLinkIcon } from "@/lib/icons";
import { site } from "@/lib/site";
import { getPartnerBySlug } from "@/services/content/partners";
import { PartnerLogo } from "../partner-logo";

type Params = { slug: string };

/* Kein generateStaticParams — aus demselben Grund wie bei /events/[slug]:
   Das Root-Layout liest Cookies, jede Seite rendert ohnehin pro Anfrage. */

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const partner = await getPartnerBySlug(slug);
  if (!partner) return { title: "Partner nicht gefunden" };

  const image = partner.banner ?? partner.logo;
  return {
    title: partner.name,
    description: partner.kurz,
    alternates: { canonical: `/partner/${partner.slug}` },
    openGraph: {
      type: "profile",
      title: partner.name,
      description: partner.kurz,
      images: image ? [image] : undefined,
    },
  };
}

export const revalidate = 600;

export default async function PartnerDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const partner = await getPartnerBySlug(slug);
  if (!partner) notFound();

  return (
    <article>
      {/* --- Kopf: Banner im Fenster, darunter Logo und Name ---------------- */}
      <header className="shell pt-2">
        <div className="surface-card rounded-[var(--radius)] p-2">
          {partner.banner && (
            <div className="well relative mb-2 aspect-[16/7] overflow-hidden rounded-[3px] sm:aspect-[16/5]">
              <Image
                src={partner.banner}
                alt=""
                fill
                sizes="(max-width: 1400px) 100vw, 1330px"
                priority
                className="object-cover"
              />
            </div>
          )}

          <div className="px-3 pt-3 pb-5 sm:px-6 sm:pt-4 sm:pb-8">
            <Breadcrumbs
              items={[
                { href: "/", label: "Start" },
                { href: "/partner", label: "Partner" },
                { href: `/partner/${partner.slug}`, label: partner.name },
              ]}
            />

            <div className="mt-8 flex flex-col gap-6 sm:mt-10 sm:flex-row sm:items-end sm:gap-8">
              <div className="well w-fit shrink-0 rounded-[var(--radius)] p-2">
                <PartnerLogo
                  partner={partner}
                  size={160}
                  alt={`Logo von ${partner.name}`}
                  className="size-28 sm:size-40"
                />
              </div>
              <div className="min-w-0 max-w-3xl">
                <p className="font-meta text-muted">partner von {site.name}</p>
                <h1 className="mt-3 font-display text-[2.6rem] text-balance break-words hyphens-auto text-foreground sm:text-6xl lg:text-7xl">
                  {partner.name}
                </h1>
                {partner.kurz && (
                  <p className="mt-4 max-w-2xl text-lg leading-relaxed text-pretty text-muted">{partner.kurz}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="shell pt-2">
        <div
          className={cn(
            "grid gap-2",
            partner.content && partner.links.length > 0 && "lg:grid-cols-[minmax(0,1fr)_20rem]",
          )}
        >
          {partner.content && (
            <div className="surface-card min-w-0 rounded-[var(--radius)] px-5 py-8 sm:px-10 sm:py-10">
              <div className="vfm-prose max-w-[68ch]" dangerouslySetInnerHTML={{ __html: partner.content }} />
            </div>
          )}

          {partner.links.length > 0 && (
            <section
              aria-labelledby="partner-links"
              className="surface-card flex flex-col gap-3 self-start rounded-[var(--radius)] p-2 lg:sticky lg:top-[calc(var(--header-height)+1rem)]"
            >
              <h2 id="partner-links" className="px-2 pt-2 font-meta text-muted">
                {partner.name} im Netz
              </h2>
              <ul className="well flex flex-col gap-2 rounded-[var(--radius)] p-2">
                {partner.links.map((link) => (
                  <li key={`${link.label}-${link.url}`}>
                    {/* ButtonLink mit `external` setzt target="_blank" und
                        rel="noreferrer noopener". */}
                    <ButtonLink href={link.url} external variant="secondary" fullWidth className="justify-between">
                      {link.label}
                      <Icon icon={ExternalLinkIcon} className="text-[0.75em] opacity-70" />
                    </ButtonLink>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <div className="pt-12 sm:pt-16">
          <Link
            href="/partner"
            className="key inline-flex items-center rounded-[var(--radius)] bg-surface px-4 py-2 font-wide text-sm font-bold text-foreground ring-1 ring-border transition-colors hover:bg-volt hover:text-graphite"
          >
            Alle Partner
          </Link>
        </div>
      </div>
    </article>
  );
}
