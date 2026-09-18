import type { Metadata } from "next";
import { PageHeader } from "@/components/common/page-header";
import { site } from "@/lib/site";
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
            VoltFM ist ein nicht-kommerzielles Webradio-Projekt.
            <br />
            Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV.
          </p>

          <h2>Kontakt</h2>
          <p>
            E-Mail: <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>
            <br />
            Web: <a href={site.url}>{site.url}</a>
          </p>

          <h2>Hinweis</h2>
          <p>
            Die vollständige Anbieterkennzeichnung (Name und ladungsfähige
            Anschrift der verantwortlichen Person) ist gesetzlich
            vorgeschrieben und muss hier vor dem öffentlichen Start ergänzt
            werden.
          </p>

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

          <h2>Musikrechte</h2>
          <p>
            Die Ausstrahlung der Musik erfolgt über unsere Sendeplattform, die
            die erforderlichen Lizenzen mit den Verwertungsgesellschaften hält.
          </p>
        </div>
      </section>
    </>
  );
}
