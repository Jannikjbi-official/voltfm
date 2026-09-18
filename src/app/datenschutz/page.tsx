import type { Metadata } from "next";
import { PageHeader } from "@/components/common/page-header";
import { operator, site } from "@/lib/site";
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
          <h2>Verantwortlicher</h2>
          <p>
            Verantwortlich für die Datenverarbeitung auf dieser Website im Sinne
            der DSGVO ist:
          </p>
          <address className={styles.address}>
            {operator.name}
            <br />
            {operator.street}
            <br />
            {operator.postalCode} {operator.city}
            <br />
            {operator.country}
            <br />
            E-Mail: <a href={`mailto:${operator.email}`}>{operator.email}</a>
          </address>
          {site.mailOutage && (
            <p className={styles.note}>
              Bitte nutze für Datenschutzanliegen genau diese Adresse. Unsere
              Adressen auf voltfm.xyz und jannikjbi.de sind wegen eines
              Serverausfalls derzeit nicht erreichbar.
            </p>
          )}

          <h2>Hosting und Server-Logfiles</h2>
          <p>
            Diese Website wird bei einem Hosting-Dienstleister betrieben. Beim
            Aufruf verarbeitet dieser technisch notwendige Server-Logfiles:
            IP-Adresse, Datum und Uhrzeit, abgerufene Seite, übertragene
            Datenmenge, Referrer und Browserkennung. Rechtsgrundlage ist Art. 6
            Abs. 1 lit. f DSGVO — unser berechtigtes Interesse am sicheren und
            störungsfreien Betrieb. Die Daten werden nicht mit anderen Quellen
            zusammengeführt.
          </p>

          <h2>Livestream und Sendedaten (laut.fm)</h2>
          <p>
            Das Programm von VoltFM wird von der laut.fm GmbH ausgestrahlt. Auf
            dieser Website ist der Stream <strong>nicht eingebettet</strong> — wir
            verlinken auf laut.fm, und die Wiedergabe findet dort statt. Für den
            Datenschutz sind dabei zwei Vorgänge zu unterscheiden:
          </p>

          <h3>1. Titel- und Sendungsinformationen (Server-zu-Server)</h3>
          <p>
            Was gerade läuft, welche Sendung on air ist und die Titelhistorie
            holen wir über die öffentliche Schnittstelle von laut.fm ab. Diese
            Abfrage stellt <strong>unser Server</strong>, nicht dein Browser.
            laut.fm erfährt dabei nur, dass unser Server anfragt — nicht, dass
            du gerade auf unserer Seite bist. Es werden also{" "}
            <strong>keine personenbezogenen Daten von dir</strong> an laut.fm
            übermittelt, und es wird dabei nichts auf deinem Gerät gespeichert.
          </p>

          <h3>2. Der Klick auf &bdquo;hören&ldquo; (Weiterleitung)</h3>
          <p>
            Klickst du auf den Play-Button, verlässt du unsere Website und
            landest bei laut.fm. Erst dort baut dein Browser eine Verbindung auf
            und überträgt dabei deine IP-Adresse und Browserkennung an laut.fm —
            technisch geht das nicht ohne. Das passiert ausschließlich, weil du
            den Link bewusst anklickst; ohne diesen Klick wird nichts übertragen.
            Wir setzen den Link mit <code>rel=&quot;noreferrer&quot;</code>, laut.fm
            erfährt also nicht, von welcher Seite du kommst. Ab dem Klick gilt
            die{" "}
            <a href="https://laut.fm/pages/privacy" target="_blank" rel="noreferrer noopener">
              Datenschutzerklärung von laut.fm
            </a>
            , auf deren Inhalt wir keinen Einfluss haben.
          </p>
          <p>
            Sollte die Wiedergabe künftig direkt auf dieser Seite stattfinden,
            würde dein Browser die Verbindung schon beim Abspielen aufbauen. Dafür
            ist in der Website bereits ein Einwilligungsdialog vorgesehen: Ohne
            deine ausdrückliche Zustimmung (Art. 6 Abs. 1 lit. a DSGVO) wird keine
            Verbindung hergestellt, und du kannst sie im Player jederzeit wieder
            zurücknehmen.
          </p>

          <h2>Cookies und lokale Speicherung</h2>
          <p>
            VoltFM setzt keine Tracking-, Analyse- oder Werbe-Cookies. Verwendet
            werden ausschließlich:
          </p>
          <ul>
            <li>
              <strong>voltfm-theme</strong> — merkt sich, ob du das helle oder
              dunkle Design gewählt hast.
            </li>
            <li>
              <strong>voltfm-stream-consent</strong> — merkt sich, ob du der
              Verbindung zu laut.fm zugestimmt hast. Ohne diesen Eintrag müsstest
              du bei jedem Seitenaufruf erneut zustimmen.
            </li>
            <li>
              <strong>voltfm-volume</strong> — merkt sich die eingestellte
              Lautstärke.
            </li>
            <li>
              <strong>Sitzungs-Cookies</strong> — nur wenn du dich anmeldest, zur
              Aufrechterhaltung deiner Sitzung. Diese sind technisch notwendig
              (Art. 6 Abs. 1 lit. f DSGVO bzw. § 25 Abs. 2 Nr. 2 TDDDG).
            </li>
          </ul>

          <h2>Konto und Anmeldung</h2>
          <p>
            Wenn du ein Konto erstellst, speichern wir Benutzername,
            Anzeigename, E-Mail-Adresse und einen Passwort-Hash (Klartext-Passwörter
            werden nie gespeichert). Rechtsgrundlage ist Art. 6 Abs. 1 lit. b
            DSGVO. Die Daten liegen in einer MongoDB-Atlas-Datenbank innerhalb der
            EU.
          </p>
          <p>
            <strong>Anmeldung über Discord:</strong> Meldest du dich über Discord
            an, erhalten wir von Discord (Discord Netherlands B.V.) deine
            Discord-ID, deinen Benutzernamen, deine dort hinterlegte E-Mail-Adresse
            und dein Profilbild. Wir verwenden diese Daten ausschließlich, um dein
            VoltFM-Konto anzulegen bzw. zu verknüpfen. Beim <em>Anmelden</em> wird ein
            bestehendes Konto nur dann automatisch verknüpft, wenn die
            E-Mail-Adresse übereinstimmt. Verknüpfst du Discord selbst in deinem
            Konto, darf die Discord-Adresse davon abweichen — du bist dabei ja
            bereits angemeldet.
          </p>
          <p>
            <strong>Passkeys:</strong> Bei einem Passkey wird nur der öffentliche
            Schlüssel auf unserem Server gespeichert. Der private Schlüssel
            verlässt dein Gerät nie.
          </p>

          <h2>Kontaktformular</h2>
          <p>
            Die von dir eingegebenen Daten (Name, E-Mail-Adresse, Betreff,
            Nachricht) speichern wir zur Bearbeitung deiner Anfrage.
            Rechtsgrundlage ist Art. 6 Abs. 1 lit. b bzw. f DSGVO. Die Nachrichten
            werden gelöscht, sobald die Anfrage abschließend bearbeitet ist und
            keine gesetzlichen Aufbewahrungspflichten entgegenstehen.
          </p>

          <h2>Bilder und Uploads</h2>
          <p>
            Titel-, Cover- und Profilbilder werden über UploadThing ausgeliefert.
            Beim Laden eines solchen Bildes wird deine IP-Adresse an diesen Dienst
            übertragen. Hochladen können ausschließlich angemeldete Personen mit
            Redaktionsrechten.
          </p>

          <h2>Keine automatisierte Entscheidungsfindung</h2>
          <p>
            Es findet kein Profiling und keine automatisierte Entscheidungsfindung
            im Sinne von Art. 22 DSGVO statt.
          </p>

          <h2>Deine Rechte</h2>
          <p>
            Du hast das Recht auf Auskunft (Art. 15), Berichtigung (Art. 16),
            Löschung (Art. 17), Einschränkung der Verarbeitung (Art. 18),
            Datenübertragbarkeit (Art. 20) und Widerspruch (Art. 21). Erteilte
            Einwilligungen kannst du jederzeit mit Wirkung für die Zukunft
            widerrufen. Melde dich dafür unter{" "}
            <a href={`mailto:${operator.email}`}>{operator.email}</a> oder
            postalisch an die oben genannte Anschrift.
          </p>
          <p>
            Außerdem steht dir ein Beschwerderecht bei einer Aufsichtsbehörde zu,
            für uns ist das die Landesbeauftragte für den Datenschutz Niedersachsen.
          </p>

          <h2>Löschung deines Kontos</h2>
          <p>
            Du kannst dein Konto jederzeit unter <a href="/konto">Konto</a> löschen
            lassen oder uns eine formlose Nachricht schicken. Mit der Löschung
            entfernen wir alle zu deinem Konto gespeicherten Daten.
          </p>

          <h2>Stand und Hinweis</h2>
          <p className={styles.note}>
            Dieser Text beschreibt die tatsächliche Datenverarbeitung von{" "}
            {site.name} zum Stand dieser Fassung. Er ersetzt keine Rechtsberatung.
          </p>
        </div>
      </section>
    </>
  );
}
