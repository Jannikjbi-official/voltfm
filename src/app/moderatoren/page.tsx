import type { Metadata } from "next";

import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { HostCard } from "@/components/common/host-card";
import { listHosts } from "@/services/content";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Moderatoren",
  description:
    "Die Stimmen hinter VoltFM: Wer bei uns moderiert, welche Sendungen sie machen und wofür sie stehen.",
  alternates: { canonical: "/moderatoren" },
};

export const revalidate = 3600;

export default async function ModeratorenPage() {
  const hosts = await listHosts();

  return (
    <>
      <PageHeader
        eyebrow="Das Team"
        title="Unsere Moderatorinnen und Moderatoren"
        description="Radio lebt davon, dass jemand da ist. Das hier sind die Menschen, die bei VoltFM am Mikrofon sitzen."
        breadcrumbs={[
          { href: "/", label: "Start" },
          { href: "/moderatoren", label: "Moderatoren" },
        ]}
        size="large"
      />

      <section className="section shell">
        {hosts.length > 0 ? (
          <div className={styles.grid}>
            {hosts.map((host) => (
              <HostCard key={host.id} host={host} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Noch keine Profile hinterlegt"
            description="Die Moderatorenprofile werden gerade eingepflegt."
          />
        )}
      </section>
    </>
  );
}
