import type { Metadata } from "next";
import Link from "next/link";
import { operator, site } from "@/lib/site";
import { BotLegalLayout } from "../legal-layout";

export const metadata: Metadata = {
  title: "Datenschutz · Discord-Bot VoltFM Radio",
  description: "Welche Daten der Discord-Bot „VoltFM Radio“ verarbeitet, wofür und wie lange.",
  alternates: { canonical: "/bot/datenschutz" },
};

const SECTIONS = [
  { id: "verantwortlich", label: "Verantwortlich" },
  { id: "kurz-gesagt", label: "Kurz gesagt" },
  { id: "welche-daten", label: "Welche Daten der Bot verarbeitet" },
  { id: "was-nicht", label: "Was der Bot nicht tut" },
  { id: "zweck-und-rechtsgrundlage", label: "Zweck und Rechtsgrundlage" },
  { id: "speicherdauer", label: "Speicherdauer und Löschung" },
  { id: "empfaenger", label: "Empfänger und Dienstleister" },
  { id: "drittland", label: "Übermittlung in Drittländer" },
  { id: "deine-rechte", label: "Deine Rechte" },
] as const;

export default function BotDatenschutzPage() {
  return (
    <BotLegalLayout
      title="Datenschutz – Discord-Bot"
      description="Datenschutzerklärung für den Discord-Bot „VoltFM Radio“."
      href="/bot/datenschutz"
      sections={SECTIONS}
      stand="28. November 2026"
    >
      <h2 id="verantwortlich">Verantwortlich</h2>
      <p>Verantwortlich für die Datenverarbeitung durch den Discord-Bot „VoltFM Radio“ (im Folgenden „Bot“) ist:</p>
      <address className="well rounded-[var(--radius)] px-5 py-4 font-mono text-sm not-italic leading-relaxed">
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
      <p>
        Für die Website voltfm.xyz gilt die allgemeine <Link href="/datenschutz">Datenschutzerklärung</Link>.
      </p>

      <h2 id="kurz-gesagt">Kurz gesagt</h2>
      <ul>
        <li>Der Bot spielt den VoltFM-Livestream in einem Sprachkanal ab und zeigt, welcher Song läuft.</li>
        <li>Er liest <strong>keine Nachrichten</strong> mit, hört <strong>nicht</strong> zu und nimmt nichts auf.</li>
        <li>Gespeichert werden nur die Einstellungen eines Servers (IDs von Server, Kanälen und Rollen). Daten über einzelne Personen speichern wir nur, wenn jemand wegen Missbrauchs gesperrt wird.</li>
        <li>Entfernst du den Bot vom Server, löscht er dessen Einstellungen.</li>
      </ul>

      <h2 id="welche-daten">Welche Daten der Bot verarbeitet</h2>
      <p>
        <strong>Daten des Servers</strong> (dauerhaft gespeichert, solange der Bot auf dem Server ist):
      </p>
      <ul>
        <li>die ID des Discord-Servers,</li>
        <li>die ID des Sprachkanals, in dem das Radio läuft oder zuletzt lief,</li>
        <li>die Einstellungen aus <code>/einstellungen</code>: 24/7-Modus, Zeit bis zum automatischen Verlassen, ID des Textkanals für Song-Ansagen und die Art der Ansage, ID der dort angelegten Ansage-Nachricht, ID einer DJ-Rolle, ob der Kanalstatus gesetzt wird.</li>
      </ul>
      <p>
        <strong>Daten von Nutzerinnen und Nutzern</strong> (nur im Moment der Verarbeitung, nicht gespeichert):
      </p>
      <ul>
        <li>
          Wenn du einen Befehl nutzt oder einen Knopf drückst, schickt Discord dem Bot deine Nutzer-ID, deine Rollen und
          Berechtigungen auf dem Server und den Befehl. Damit prüft der Bot, ob du das Radio steuern oder Einstellungen ändern darfst,
          und antwortet dir.
        </li>
        <li>
          Discord teilt dem Bot mit, wer sich in welchem Sprachkanal befindet (Sprachstatus). Der Bot nutzt das nur, um zu erkennen,
          ob du im selben Sprachkanal bist und ob noch jemand zuhört; ist niemand mehr da, verlässt er den Kanal.
        </li>
      </ul>
      <p>
        <strong>Sperrliste:</strong> Wird der Bot missbraucht, können wir einen Server oder eine Person sperren. Dann speichern wir
        die ID des Servers bzw. die Discord-Nutzer-ID mit dem damaligen Namen, Zeitpunkt, einem kurzen Grund und wer gesperrt hat.
        Gesperrte Personen können den Bot nicht mehr steuern, ein gesperrter Server kann ihn nicht mehr nutzen.
      </p>
      <p>
        <strong>Protokolle:</strong> Der Bot schreibt technische Protokolle (zum Beispiel „Server X: Kanal Y beigetreten“, Fehlermeldungen).
        Darin können Namen von Servern und Kanälen stehen, aber keine Nachrichten und keine Daten einzelner Personen.
      </p>

      <h2 id="was-nicht">Was der Bot nicht tut</h2>
      <ul>
        <li>Er liest keine Nachrichteninhalte (er hat dafür keine Berechtigung bei Discord).</li>
        <li>Er empfängt kein Audio aus dem Sprachkanal; er ist dort taub geschaltet und nimmt nichts auf.</li>
        <li>Er legt keine Profile an, verkauft keine Daten und zeigt keine Werbung.</li>
        <li>Er schreibt Nachrichten nur in einen Kanal, den eine berechtigte Person in den Einstellungen ausgewählt hat, und erwähnt dabei niemanden.</li>
      </ul>

      <h2 id="zweck-und-rechtsgrundlage">Zweck und Rechtsgrundlage</h2>
      <p>
        Die Daten werden ausschließlich verarbeitet, um den Bot bereitzustellen: das Radio abzuspielen, Befehle auszuführen, die
        Einstellungen eines Servers zu behalten und den laufenden Song anzuzeigen. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO
        (Bereitstellung des genutzten Dienstes) und Art. 6 Abs. 1 lit. f DSGVO (unser berechtigtes Interesse an einem sicheren und
        funktionierenden Betrieb, dazu gehört auch die Sperrliste zum Schutz vor Missbrauch).
      </p>

      <h2 id="speicherdauer">Speicherdauer und Löschung</h2>
      <ul>
        <li>Die Einstellungen eines Servers bleiben gespeichert, bis der Bot vom Server entfernt wird; dann werden sie gelöscht. Mit „Zurücksetzen“ in <code>/einstellungen</code> lassen sie sich jederzeit auf den Standard zurücksetzen.</li>
        <li>Wird das Radio mit <code>/radio stop</code> gestoppt, wird der gespeicherte Sprachkanal gelöscht.</li>
        <li>Einträge auf der Sperrliste bleiben bestehen, bis die Sperre aufgehoben wird; auf Anfrage prüfen wir eine Sperre jederzeit.</li>
        <li>Technische Protokolle werden automatisch überschrieben, sobald sie eine feste Größe erreichen, in der Regel nach wenigen Tagen.</li>
        <li>Löschung auf Wunsch: Schreib an <a href={`mailto:${operator.email}`}>{operator.email}</a> mit der ID deines Servers.</li>
      </ul>

      <h2 id="empfaenger">Empfänger und Dienstleister</h2>
      <ul>
        <li>
          <strong>Discord</strong> (Discord Netherlands B.V. und Discord Inc., USA): Der Bot läuft über Discord. Was Discord selbst
          verarbeitet, steht in der{" "}
          <a href="https://discord.com/privacy" target="_blank" rel="noreferrer noopener">Datenschutzerklärung von Discord</a>.
        </li>
        <li>
          <strong>GHOSTnet GmbH</strong>, Bad Soden am Taunus (Deutschland): Hier steht der Server, auf dem der Bot läuft.
        </li>
        <li>
          <strong>laut.fm</strong>: Der Livestream und die Titelinformationen kommen von laut.fm. Die Anfragen stellt unser Server,
          nicht dein Gerät; laut.fm erhält dabei keine Daten von dir.
        </li>
      </ul>
      <p>Darüber hinaus geben wir keine Daten weiter.</p>

      <h2 id="drittland">Übermittlung in Drittländer</h2>
      <p>
        Discord verarbeitet Daten auch in den USA. Discord Inc. ist nach dem EU-US Data Privacy Framework zertifiziert; damit besteht
        ein Angemessenheitsbeschluss der EU-Kommission (Art. 45 DSGVO). Wir selbst übermitteln keine Daten in Drittländer.
      </p>

      <h2 id="deine-rechte">Deine Rechte</h2>
      <p>
        Du hast das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung der Verarbeitung
        (Art. 18), Datenübertragbarkeit (Art. 20) und Widerspruch gegen Verarbeitungen auf Grundlage berechtigter Interessen (Art. 21).
        Schreib dafür an <a href={`mailto:${operator.email}`}>{operator.email}</a> oder im{" "}
        <a href={site.discordUrl} target="_blank" rel="noreferrer noopener">VoltFM-Discord</a>.
      </p>
      <p>
        Du kannst dich außerdem bei einer Datenschutz-Aufsichtsbehörde beschweren, zum Beispiel bei der für uns zuständigen
        Landesbeauftragten für den Datenschutz Niedersachsen.
      </p>
    </BotLegalLayout>
  );
}
