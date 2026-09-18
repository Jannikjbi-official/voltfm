import type { Metadata } from "next";
import { PageHeader } from "@/components/common/page-header";
import { site } from "@/lib/site";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Datenschutz",
  description: "Wie VoltFM mit deinen Daten umgeht.",
  alternates: { canonical: "/datenschutz" },
};

export default function DatenschutzPage() {
  return (
    <>
      <PageHeader
        title="Datenschutzerklärung"
        description="Kurz gefasst: Wir sammeln so wenig wie möglich."
        breadcrumbs={[
          { href: "/", label: "Start" },
          { href: "/datenschutz", label: "Datenschutz" },
        ]}
      />

      <section className="section shell">
        <div className={styles.prose}>
          <h2>Verantwortlich</h2>
          <p>
            Verantwortlich für die Datenverarbeitung auf dieser Website ist der
            Betreiber von VoltFM. Kontakt:{" "}
            <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>.
          </p>

          <h2>Hosting</h2>
          <p>
            Diese Website wird bei einem Dienstleister gehostet, der technisch
            notwendige Server-Logfiles (IP-Adresse, Zeitpunkt, abgerufene Seite,
            Browsertyp) verarbeitet. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f
            DSGVO — unser berechtigtes Interesse am sicheren Betrieb.
          </p>

          <h2>Livestream</h2>
          <p>
            Beim Abspielen des Streams verbindet sich dein Browser direkt mit
            unserer Sendeplattform. Dabei wird deine IP-Adresse an diese
            Plattform übertragen, da eine Verbindung ohne sie technisch nicht
            möglich ist.
          </p>

          <h2>Cookies</h2>
          <p>
            VoltFM setzt keine Tracking- oder Werbe-Cookies. Gesetzt werden
            ausschließlich:
          </p>
          <ul>
            <li>
              <strong>voltfm-theme</strong> — merkt sich, ob du das helle oder
              dunkle Design gewählt hast.
            </li>
            <li>
              <strong>Sitzungs-Cookies</strong> — nur wenn du dich anmeldest, zur
              Aufrechterhaltung deiner Sitzung.
            </li>
          </ul>

          <h2>Konto und Anmeldung</h2>
          <p>
            Wenn du ein Konto erstellst, speichern wir Username, Anzeigename,
            E-Mail-Adresse und ein Passwort-Hash. Meldest du dich über Discord
            an, erhalten wir von Discord deine dortige Kennung, deinen
            Benutzernamen und dein Profilbild. Passkeys werden als öffentliche
            Schlüssel gespeichert — dein privater Schlüssel verlässt dein Gerät
            nie.
          </p>

          <h2>Kontaktformular</h2>
          <p>
            Die von dir eingegebenen Daten (Name, E-Mail, Betreff, Nachricht)
            speichern wir zur Bearbeitung deiner Anfrage. Rechtsgrundlage ist
            Art. 6 Abs. 1 lit. b bzw. f DSGVO.
          </p>

          <h2>Bilder</h2>
          <p>
            Titelbilder und Coverbilder werden teils über externe Dienste
            ausgeliefert. Dabei wird deine IP-Adresse an den jeweiligen Anbieter
            übertragen.
          </p>

          <h2>Deine Rechte</h2>
          <p>
            Du hast das Recht auf Auskunft, Berichtigung, Löschung,
            Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch.
            Melde dich dafür einfach unter{" "}
            <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>.
          </p>

          <h2>Hinweis</h2>
          <p>
            Dieser Text beschreibt die tatsächliche Datenverarbeitung dieser
            Anwendung, ersetzt aber keine Rechtsberatung. Vor dem öffentlichen
            Start sollte er juristisch geprüft werden.
          </p>
        </div>
      </section>
    </>
  );
}
