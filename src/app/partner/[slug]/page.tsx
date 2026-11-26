import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";

import { PageHeader } from "@/components/common/page-header";
import { ButtonLink } from "@/components/common/button-link";
import { getPartnerBySlug } from "@/services/content/partners";

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

/* Bewusst schlicht: Die Seite bekommt ihr Aussehen mit dem Redesign. */
export default async function PartnerDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const partner = await getPartnerBySlug(slug);
  if (!partner) notFound();

  return (
    <article>
      {partner.banner && (
        <Image src={partner.banner} alt="" width={1600} height={500} sizes="100vw" priority />
      )}

      <PageHeader
        title={partner.name}
        description={partner.kurz}
        breadcrumbs={[
          { href: "/", label: "Start" },
          { href: "/partner", label: "Partner" },
          { href: `/partner/${partner.slug}`, label: partner.name },
        ]}
        aside={
          partner.logo ? (
            <Image src={partner.logo} alt={`Logo von ${partner.name}`} width={160} height={160} sizes="160px" />
          ) : undefined
        }
      />

      <div className="shell">
        {partner.content && (
          <div className="vfm-prose" dangerouslySetInnerHTML={{ __html: partner.content }} />
        )}

        {partner.links.length > 0 && (
          <section aria-label={`${partner.name} im Netz`}>
            <h2>{partner.name} im Netz</h2>
            <ul>
              {partner.links.map((link) => (
                <li key={`${link.label}-${link.url}`}>
                  {/* ButtonLink mit `external` setzt target="_blank" und
                      rel="noreferrer noopener". */}
                  <ButtonLink href={link.url} external variant="secondary">
                    {link.label}
                  </ButtonLink>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </article>
  );
}
