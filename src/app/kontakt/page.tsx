import type { Metadata } from "next";

import { PageHeader } from "@/components/common/page-header";
import { ButtonLink } from "@/components/common/button-link";
import { Icon, DiscordIcon } from "@/lib/icons";
import { site } from "@/lib/site";
import { ContactForm } from "./contact-form";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Kontakt",
  description:
    "Feedback, Kooperationen oder Presseanfragen: So erreichst du die VoltFM Redaktion.",
  alternates: { canonical: "/kontakt" },
};

export default function KontaktPage() {
  return (
    <>
      <PageHeader
        eyebrow="Kontakt"
        title="Schreib uns"
        description="Feedback, Songvorschläge, Kooperationen oder eine Presseanfrage — hier landet alles direkt bei der Redaktion."
        breadcrumbs={[
          { href: "/", label: "Start" },
          { href: "/kontakt", label: "Kontakt" },
        ]}
      />

      <section className="section shell">
        <div className={styles.layout}>
          <div className={styles.formColumn}>
            <ContactForm />
          </div>

          <aside className={styles.side}>
            <div className={styles.sideBlock}>
              <h2 className={styles.sideTitle}>Schneller geht es im Discord</h2>
              <p className={styles.sideText}>
                Für Songwünsche und alles Kurzfristige ist der Discord der
                direktere Weg — dort ist meistens jemand von uns online.
              </p>
              <ButtonLink
                href={site.discordUrl}
                external
                variant="primary"
                mode="stroke"
                size="sm"
              >
                <Icon icon={DiscordIcon} />
                Discord öffnen
              </ButtonLink>
            </div>

            <div className={styles.sideBlock}>
              <h2 className={styles.sideTitle}>Wie lange dauert es?</h2>
              <p className={styles.sideText}>
                Wir sind ein kleines Team und machen VoltFM neben Schule, Studium
                und Job. Rechne mit ein paar Tagen — aber wir antworten wirklich.
              </p>
            </div>

            <div className={styles.sideBlock}>
              <h2 className={styles.sideTitle}>Presse</h2>
              <p className={styles.sideText}>
                Für Interviews und Pressematerial schreib uns über das Formular
                mit dem Betreff &bdquo;Presse&ldquo;. Wir melden uns mit allem, was du
                brauchst.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
