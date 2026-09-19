import type { Metadata } from "next";

import { EmptyState } from "@/components/common/empty-state";
import { HostCard } from "@/components/common/host-card";
import { ButtonLink } from "@/components/common/button-link";
import { Icon, DiscordIcon, MicIcon } from "@/lib/icons";
import { listHosts, listShows } from "@/services/content";
import { site } from "@/lib/site";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Moderatoren",
  description:
    "Die Stimmen hinter VoltFM: Wer bei uns moderiert, welche Sendungen sie machen und wofür sie stehen.",
  alternates: { canonical: "/moderatoren" },
};

export const revalidate = 3600;

export default async function ModeratorenPage() {
  const [hosts, shows] = await Promise.all([listHosts(), listShows()]);

  /* Zahlen aus den Daten, nicht geschätzt: wie viele Leute, wie viele
     Sendungen, und welche Musikrichtungen überhaupt vertreten sind. */
  const genres = [...new Set(hosts.flatMap((host) => host.genres))];

  return (
    <div className={styles.page}>
      <header className={styles.masthead}>
        <div className="shell">
          <p className={styles.kicker}>
            <span className={styles.kickerIcon} aria-hidden="true">
              <Icon icon={MicIcon} />
            </span>
            Das Team
          </p>

          <h1 className={styles.title}>
            Die Stimmen
            <br />
            <span className={styles.titleAccent}>hinter VoltFM.</span>
          </h1>

          <p className={styles.lead}>
            Radio lebt davon, dass jemand da ist. Das hier sind die Menschen, die
            bei uns am Mikrofon sitzen — mit ihren Sendungen, ihrer Musik und
            ihren Eigenheiten.
          </p>

          {hosts.length > 0 && (
            <dl className={styles.stats}>
              <div className={styles.stat}>
                <dt>Am Mikrofon</dt>
                <dd>{hosts.length}</dd>
              </div>
              {shows.length > 0 && (
                <div className={styles.stat}>
                  <dt>Feste Sendungen</dt>
                  <dd>{shows.length}</dd>
                </div>
              )}
              {genres.length > 0 && (
                <div className={styles.stat}>
                  <dt>Musikrichtungen</dt>
                  <dd>{genres.length}</dd>
                </div>
              )}
            </dl>
          )}
        </div>
      </header>

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

      {/* --- Mitmachen ----------------------------------------------------- */}
      <section className="section shell">
        <div className={styles.join}>
          <div>
            <h2 className={styles.joinTitle}>Du willst selbst ans Mikrofon?</h2>
            <p className={styles.joinText}>
              Wir sind ein kleines Team und freuen uns über jede Stimme, die
              dazukommt. Vorerfahrung braucht es nicht — Lust auf Musik und
              Verlässlichkeit schon.
            </p>
          </div>
          <ButtonLink href={site.discordUrl} external variant="primary" mode="filled" size="lg">
            <Icon icon={DiscordIcon} />
            Im Discord melden
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}
