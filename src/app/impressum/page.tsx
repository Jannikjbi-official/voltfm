import type { Metadata } from "next";
import { PageHeader } from "@/components/common/page-header";
import { operator, site } from "@/lib/site";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Impressum",
  description: "Anbieterkennzeichnung nach § 5 DDG.",
  alternates: { canonical: "/impressum" },
};

export default function ImpressumPage() {
  return (
    <>
      <PageHeader
        title="Impressum"
        breadcrumbs={[
          { href: "/", label: "Start" },
          { href: "/impressum", label: "Impressum" },
        ]}
      />

      <section className="section shell">
        <div className={styles.prose}>
          <h2>Angaben gemäß § 5 DDG</h2>
          <p>
            VoltFM ist ein nicht-kommerzielles, privates Webradio-Projekt.
            <br />
            Es wird betrieben von:
          </p>
          <address className={styles.address}>
            {operator.name}
            <br />
            {operator.street}
            <br />
            {operator.postalCode} {operator.city}
            <br />
            {operator.country}
          </address>

          <h2>Kontakt</h2>
          <p>
            E-Mail: <a href={`mailto:${operator.email}`}>{operator.email}</a>
            <br />
            Web: <a href={site.canonicalUrl}>voltfm.xyz</a>
            <br />
            Discord: <a href={site.discordUrl}>{site.discordUrl}</a>
          </p>
          {site.mailOutage && (
            <p className={styles.note}>
              <strong>Hinweis zur Erreichbarkeit:</strong> Unser Mailserver für die
              Adressen auf den Domains voltfm.xyz und jannikjbi.de ist derzeit
              ausgefallen. Nachrichten an {site.stationEmail} oder{" "}
              {site.legacyEmail} kommen nicht an. Die oben genannte Adresse{" "}
              {operator.email} funktioniert und ist der verbindliche Weg für
              rechtliche Anliegen.
            </p>
          )}

          <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
          <address className={styles.address}>
            {operator.name}
            <br />
            {operator.street}
            <br />
            {operator.postalCode} {operator.city}
          </address>

          <h2>Haftung für Inhalte</h2>
          <p>
            Als Diensteanbieter sind wir für eigene Inhalte auf diesen Seiten
            nach den allgemeinen Gesetzen verantwortlich. Wir sind jedoch nicht
            verpflichtet, übermittelte oder gespeicherte fremde Informationen zu
            überwachen.
          </p>

          <h2>Haftung für Links</h2>
          <p>
            Unser Angebot enthält Links zu externen Websites Dritter, auf deren
            Inhalte wir keinen Einfluss haben. Für die Inhalte der verlinkten
            Seiten ist stets der jeweilige Anbieter verantwortlich.
          </p>

          <h2>Musik und Livestream</h2>
          <p>
            Das Programm von VoltFM wird über laut.fm ausgestrahlt. laut.fm hält
            die erforderlichen Lizenzen mit GEMA und GVL und trägt die
            Streamingkosten. Die Wiedergabe findet deshalb auf laut.fm statt und
            wird auf dieser Website nicht eingebettet, sondern verlinkt.
          </p>

          <h2>Urheberrecht</h2>
          <p>
            Die auf dieser Website erstellten Inhalte und Werke unterliegen dem
            deutschen Urheberrecht. Beiträge Dritter sind als solche
            gekennzeichnet.
          </p>

          <h2>Streitschlichtung</h2>
          <p>
            Wir sind nicht bereit und nicht verpflichtet, an
            Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
            teilzunehmen.
          </p>
        </div>
      </section>
    </>
  );
}
