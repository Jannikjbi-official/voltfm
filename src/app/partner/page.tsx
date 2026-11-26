import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { listPartners } from "@/services/content/partners";

export const metadata: Metadata = {
  title: "Partner",
  description: "Streamer und Projekte, mit denen VoltFM zusammenarbeitet.",
  alternates: { canonical: "/partner" },
};

export const revalidate = 3600;

/* Bewusst schlicht: Die Seite bekommt ihr Aussehen mit dem Redesign. */
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

      <section className="shell" aria-label="Alle Partner">
        {partners.length > 0 ? (
          <ul>
            {partners.map((partner) => (
              <li key={partner.id}>
                <article>
                  {partner.logo && (
                    <Image src={partner.logo} alt="" width={96} height={96} sizes="96px" />
                  )}
                  <h2>
                    <Link href={`/partner/${partner.slug}`}>{partner.name}</Link>
                  </h2>
                  <p>{partner.kurz}</p>
                </article>
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
