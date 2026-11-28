import type { Metadata } from "next";
import Link from "next/link";
import { operator, site } from "@/lib/site";
import { BotLegalLayout } from "../legal-layout";

export const metadata: Metadata = {
  title: "Nutzungsbedingungen · Discord-Bot VoltFM Radio",
  description: "Nutzungsbedingungen für den Discord-Bot „VoltFM Radio“.",
  alternates: { canonical: "/bot/nutzungsbedingungen" },
};

const SECTIONS = [
  { id: "geltung", label: "Geltung" },
  { id: "leistung", label: "Was der Bot bietet" },
  { id: "nutzung", label: "Erlaubte Nutzung" },
  { id: "inhalte", label: "Musik und Inhalte" },
  { id: "verfuegbarkeit", label: "Verfügbarkeit" },
  { id: "haftung", label: "Haftung" },
  { id: "sperre", label: "Sperre und Ende" },
  { id: "aenderungen", label: "Änderungen" },
  { id: "recht", label: "Anwendbares Recht und Kontakt" },
] as const;

export default function BotNutzungsbedingungenPage() {
  return (
    <BotLegalLayout
      title="Nutzungsbedingungen – Discord-Bot"
      description="Die Regeln für den Discord-Bot „VoltFM Radio“."
      href="/bot/nutzungsbedingungen"
      sections={SECTIONS}
      stand="28. November 2026"
    >
      <h2 id="geltung">Geltung</h2>
      <p>
        Diese Bedingungen gelten für die Nutzung des Discord-Bots „VoltFM Radio“ (im Folgenden „Bot“), angeboten von{" "}
        {operator.name}, {operator.street}, {operator.postalCode} {operator.city} (VoltFM). Wer den Bot zu einem Discord-Server
        hinzufügt oder seine Befehle nutzt, akzeptiert diese Bedingungen. Zusätzlich gelten die{" "}
        <a href="https://discord.com/terms" target="_blank" rel="noreferrer noopener">Nutzungsbedingungen</a> und{" "}
        <a href="https://discord.com/guidelines" target="_blank" rel="noreferrer noopener">Community-Richtlinien</a> von Discord.
      </p>

      <h2 id="leistung">Was der Bot bietet</h2>
      <p>
        Der Bot spielt den Livestream des Webradios VoltFM in einem Sprachkanal ab, zeigt den laufenden Song und die letzten Titel an
        und kann – je nach Einstellung – Songwechsel in einem Textkanal ansagen. Die Nutzung ist kostenlos. Es besteht kein Anspruch
        auf einen bestimmten Funktionsumfang; Funktionen können jederzeit hinzukommen, sich ändern oder wegfallen.
      </p>

      <h2 id="nutzung">Erlaubte Nutzung</h2>
      <ul>
        <li>Der Bot darf auf jedem Discord-Server genutzt werden, der sich an die Regeln von Discord hält.</li>
        <li>Nicht erlaubt ist, den Bot oder seine Befehle zu missbrauchen, etwa durch absichtliches Überlasten (Spam), Umgehen der Rechteprüfung oder Ausnutzen von Fehlern.</li>
        <li>Der Livestream darf über den Bot nur angehört werden. Mitschnitte, das Weiterverbreiten des Streams auf andere Plattformen oder eine gewerbliche Nutzung sind nicht erlaubt.</li>
        <li>Wer Einstellungen für einen Server vornimmt, braucht dort die nötigen Rechte und ist für die Auswahl der Kanäle und Rollen verantwortlich.</li>
      </ul>

      <h2 id="inhalte">Musik und Inhalte</h2>
      <p>
        Das Programm von VoltFM wird über laut.fm ausgestrahlt; die Musik gehört den jeweiligen Rechteinhabern. Titel, Cover und
        Sendungsinformationen werden automatisch übernommen und können unvollständig oder kurz verzögert sein. Für die Auswahl der
        gespielten Musik übernimmt VoltFM keine Gewähr, dass sie jedem gefällt oder für jedes Publikum geeignet ist.
      </p>

      <h2 id="verfuegbarkeit">Verfügbarkeit</h2>
      <p>
        VoltFM ist ein privates, nicht-kommerzielles Projekt. Wir bemühen uns um einen stabilen Betrieb, können aber keine ständige
        Verfügbarkeit zusagen. Wartung, Updates, Störungen bei Discord, laut.fm oder unserem Server können zu Unterbrechungen führen.
      </p>

      <h2 id="haftung">Haftung</h2>
      <p>
        Der Bot wird unentgeltlich bereitgestellt. VoltFM haftet unbeschränkt bei Vorsatz und grober Fahrlässigkeit sowie bei
        Verletzung von Leben, Körper oder Gesundheit. Im Übrigen ist die Haftung für leichte Fahrlässigkeit ausgeschlossen, soweit
        gesetzlich zulässig.
      </p>

      <h2 id="sperre">Sperre und Ende</h2>
      <p>
        Du kannst den Bot jederzeit vom Server entfernen; seine Einstellungen für den Server werden dann gelöscht. VoltFM kann den
        Bot für einzelne Server oder Personen sperren, wenn gegen diese Bedingungen oder die Regeln von Discord verstoßen wird, und
        den Bot insgesamt einstellen.
      </p>

      <h2 id="aenderungen">Änderungen</h2>
      <p>
        Wir können diese Bedingungen anpassen, etwa wenn neue Funktionen dazukommen. Die aktuelle Fassung steht immer auf dieser
        Seite. Wer den Bot nach einer Änderung weiter nutzt, akzeptiert die neue Fassung.
      </p>

      <h2 id="recht">Anwendbares Recht und Kontakt</h2>
      <p>
        Es gilt deutsches Recht. Zwingende Verbraucherschutzvorschriften des Landes, in dem du lebst, bleiben unberührt. Fragen
        gern an <a href={`mailto:${operator.email}`}>{operator.email}</a> oder im{" "}
        <a href={site.discordUrl} target="_blank" rel="noreferrer noopener">VoltFM-Discord</a>. Wie der Bot mit Daten umgeht, steht in
        der <Link href="/bot/datenschutz">Datenschutzerklärung des Bots</Link>.
      </p>
    </BotLegalLayout>
  );
}
