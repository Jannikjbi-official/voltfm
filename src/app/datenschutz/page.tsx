import type { Metadata } from "next";
import { PageHeader } from "@/components/common/page-header";
import { operator, radio, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Datenschutz",
  description: "Wie VoltFM mit deinen Daten umgeht.",
  alternates: { canonical: "/datenschutz" },
};

const SECTIONS = [
  { id: "verantwortlicher", label: "Verantwortlicher" },
  { id: "hosting-vercel", label: "Hosting (Vercel)" },
  { id: "livestream-und-sendedaten-laut-fm", label: "Livestream und Sendedaten (laut.fm)" },
  { id: "playlist-der-letzten-tage-lautstation-de", label: "Playlist der letzten Tage (lautstation.de)" },
  { id: "cookies-und-lokale-speicherung", label: "Cookies und lokale Speicherung" },
  { id: "konto-und-anmeldung", label: "Konto und Anmeldung" },
  { id: "kontaktformular", label: "Kontaktformular" },
  { id: "vorschlaege-und-playlist-ideen", label: "Vorschläge und Playlist-Ideen" },
  { id: "bilder-und-uploads-uploadthing", label: "Bilder und Uploads (UploadThing)" },
  { id: "eingesetzte-dienste-auf-einen-blick", label: "Eingesetzte Dienste auf einen Blick" },
  { id: "keine-automatisierte-entscheidungsfindung", label: "Keine automatisierte Entscheidungsfindung" },
  { id: "deine-rechte", label: "Deine Rechte" },
  { id: "loeschung-deines-kontos", label: "Löschung deines Kontos" },
  { id: "stand-und-hinweis", label: "Stand und Hinweis" },
] as const;

/** Inhaltsverzeichnis am Rand: auf dem Desktop mitlaufend, am Handy ausgeblendet. */
function Contents({ sections }: { sections: readonly { id: string; label: string }[] }) {
  return (
    <nav
      aria-label="Auf dieser Seite"
      className="surface-card hidden rounded-3xl p-3 lg:sticky lg:top-[calc(var(--header-height)+1.75rem)] lg:col-span-4 lg:block xl:col-span-3"
    >
      <p className="px-3 pt-2 pb-2 text-sm font-semibold text-muted">Auf dieser Seite</p>
      <ul className="flex flex-col">
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className="block rounded-xl px-3 py-2 text-sm leading-snug text-foreground transition-colors hover:bg-default"
            >
              {section.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

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

      <section className="shell">
        <div className="grid items-start gap-3 lg:grid-cols-12">
          <Contents sections={SECTIONS} />

          <article className="surface-card min-w-0 rounded-[2rem] p-6 sm:p-12 lg:col-span-8 xl:col-span-9">
            <div className="vfm-prose max-w-[68ch] [&>h2:first-child]:mt-0 [&_h2]:scroll-mt-28">
              <h2 id="verantwortlicher">Verantwortlicher</h2>
              <p>
                Verantwortlich für die Datenverarbeitung auf dieser Website im Sinne
                der DSGVO ist:
              </p>
              <address className="rounded-2xl bg-surface-secondary px-5 py-4 not-italic leading-relaxed">
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
                <p className="rounded-2xl border border-warning/40 bg-warning-soft px-5 py-4 text-[0.9375rem] leading-relaxed">
                  Bitte nutze für Datenschutzanliegen genau diese Adresse. Unsere
                  Adressen auf voltfm.xyz und jannikjbi.de sind wegen eines
                  Serverausfalls derzeit nicht erreichbar.
                </p>
              )}

              <h2 id="hosting-vercel">Hosting (Vercel)</h2>
              <p>
                Diese Website wird von der <strong>Vercel Inc.</strong>, 440 N Barranca
                Ave #4133, Covina, CA 91723, USA gehostet. Beim Aufruf verarbeitet
                Vercel technisch notwendige Server-Logfiles: IP-Adresse, Datum und
                Uhrzeit, abgerufene Seite, übertragene Datenmenge, Referrer und
                Browserkennung. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO —
                unser berechtigtes Interesse am sicheren und störungsfreien Betrieb.
                Die Daten werden nicht mit anderen Quellen zusammengeführt.
              </p>
              <p>
                Vercel ist ein US-Unternehmen, es kann also zu einer Übermittlung in
                die USA kommen. Vercel ist unter dem EU–US Data Privacy Framework
                zertifiziert und schließt ergänzend die Standardvertragsklauseln der
                EU-Kommission ab. Wir haben mit Vercel einen Vertrag zur
                Auftragsverarbeitung nach Art. 28 DSGVO geschlossen. Es gilt die{" "}
                <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noreferrer noopener">
                  Datenschutzerklärung von Vercel
                </a>
                .
              </p>

              <h2 id="livestream-und-sendedaten-laut-fm">Livestream und Sendedaten (laut.fm)</h2>
              {/* Folgt dem Schalter radio.embedAllowed: Die Erklaerung muss
                  beschreiben, was die Seite gerade tatsaechlich tut. */}
              {radio.embedAllowed ? (
                <p>
                  Das Programm von VoltFM wird von der laut.fm GmbH ausgestrahlt.
                  Abgespielt wird es <strong>direkt auf dieser Website</strong>, in
                  einem Player, der beim Seitenwechsel weiterläuft. Für den
                  Datenschutz sind dabei zwei Vorgänge zu unterscheiden:
                </p>
              ) : (
                <p>
                  Das Programm von VoltFM wird von der laut.fm GmbH ausgestrahlt. Auf
                  dieser Website ist der Stream <strong>nicht eingebettet</strong> — wir
                  verlinken auf den Webplayer von lautstation.de, und die Wiedergabe
                  findet dort statt. Für den Datenschutz sind dabei zwei Vorgänge zu
                  unterscheiden:
                </p>
              )}

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
              <p>
                <strong>Cover:</strong> Die Bilder zu den Titeln sucht ebenfalls
                unser Server, über die öffentliche Suchschnittstelle von Apple
                (iTunes Search API), und holt sie dort ab. Dein Browser lädt sie über
                den Bildoptimierer unserer Website von voltfm.xyz, nicht von Apple.
                Apple erfährt dabei nicht, dass du die Seite besuchst.
              </p>

              {radio.embedAllowed ? (
                <>
                  <h3>2. Das Abspielen (Verbindung zu laut.fm)</h3>
                  <p>
                    Drückst du auf Play, verbindet sich dein Browser direkt mit dem
                    Streamserver von laut.fm und überträgt dabei deine IP-Adresse
                    und Browserkennung — ohne das geht ein Livestream technisch nicht.
                    Deshalb fragen wir beim ersten Abspielen ausdrücklich nach deiner
                    Einwilligung (Art. 6 Abs. 1 lit. a DSGVO). Ohne Zustimmung wird
                    keine Verbindung hergestellt. Du kannst sie im Player jederzeit
                    mit &bdquo;Verbindung trennen&ldquo; zurücknehmen, die Verbindung
                    endet dann sofort. Pausierst du, trennen wir sie spätestens nach
                    einer Minute. Für die Verarbeitung bei laut.fm gilt deren{" "}
                    <a href="https://laut.fm/pages/privacy" target="_blank" rel="noreferrer noopener">
                      Datenschutzerklärung
                    </a>
                    .
                  </p>
                  <p>
                    Titel, Interpret und Cover geben wir an die Mediensteuerung deines
                    Geräts weiter, damit sie auf dem Sperrbildschirm erscheinen. Das
                    passiert nur auf deinem Gerät, übertragen wird dabei nichts.
                  </p>
                  <p>
                    Der Link &bdquo;Auch im Webplayer von lautstation.de hören&ldquo;
                    öffnet lautstation.de in einem neuen Fenster, mit{" "}
                    <code>noreferrer</code>. Ab dem Klick gilt die{" "}
                    <a href="https://lautstation.de/?mode=datenschutz" target="_blank" rel="noreferrer noopener">
                      Datenschutzerklärung von lautstation.de
                    </a>
                    .
                  </p>
                </>
              ) : (
                <>
                  <h3>2. Der Klick auf &bdquo;hören&ldquo; (Weiterleitung)</h3>
                  <p>
                    Klickst du auf den Play-Button, verlässt du unsere Website, und in
                    einem neuen Fenster öffnet sich der Webplayer von lautstation.de,
                    einem privaten Verzeichnis für laut.fm-Stationen. Dein Browser lädt
                    dann die Seite von lautstation.de und den Stream von laut.fm und
                    überträgt dabei an beide deine IP-Adresse und Browserkennung —
                    technisch geht das nicht ohne. Das passiert ausschließlich, weil du
                    den Link bewusst anklickst; ohne diesen Klick wird nichts übertragen.
                    Wir öffnen den Link mit <code>noreferrer</code>, lautstation.de
                    erfährt also nicht, von welcher Seite du kommst. Ab dem Klick gelten
                    die Datenschutzerklärungen von{" "}
                    <a href="https://lautstation.de/?mode=datenschutz" target="_blank" rel="noreferrer noopener">
                      lautstation.de
                    </a>{" "}
                    und{" "}
                    <a href="https://laut.fm/pages/privacy" target="_blank" rel="noreferrer noopener">
                      laut.fm
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
                </>
              )}

              <h2 id="playlist-der-letzten-tage-lautstation-de">Playlist der letzten Tage (lautstation.de)</h2>
              <p>
                Auf der <a href="/radio">Radio-Seite</a> zeigen wir unter
                &bdquo;Was gerade lief&ldquo; alle Titel der letzten Tage. Die Liste stammt von lautstation.de, einem
                privaten Verzeichnis für laut.fm-Stationen, das weder zu VoltFM noch
                zu laut.fm gehört. Angezeigt wird sie über ein Widget von
                lautstation.de, und das lädt <strong>erst, wenn du auf
                &bdquo;Ganze Playlist laden&ldquo; klickst</strong>. Ab dann lädt dein
                Browser ein Skript und die Titelliste von cdn.lautstation.de und
                überträgt dabei deine IP-Adresse, die Browserkennung und den
                Zeitpunkt des Abrufs. Rechtsgrundlage ist deine Einwilligung (Art. 6
                Abs. 1 lit. a DSGVO), die du mit dem Klick erteilst. Ohne Klick wird
                keine Verbindung aufgebaut. Für die Verarbeitung bei lautstation.de
                gilt deren{" "}
                <a href="https://lautstation.de/?mode=datenschutz" target="_blank" rel="noreferrer noopener">
                  Datenschutzerklärung
                </a>
                .
              </p>

              <h2 id="cookies-und-lokale-speicherung">Cookies und lokale Speicherung</h2>
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
                  <strong>voltfm-volume</strong> und <strong>voltfm-muted</strong> —
                  merken sich die eingestellte Lautstärke und ob du stummgeschaltet
                  hast.
                </li>
                <li>
                  <strong>voltfm-stream-redirect-ack</strong> — nur wenn du im
                  Hinweis vor dem Webplayer von lautstation.de &bdquo;Nicht mehr
                  fragen&ldquo; anhakst.
                </li>
                <li>
                  <strong>voltfm-lautstation-consent</strong> — nur wenn du beim
                  Laden der Playlist &bdquo;Nicht jedes Mal fragen&ldquo; anhakst.
                  Unter der Playlist kannst du das jederzeit zurücknehmen.
                </li>
                <li>
                  <strong>Sitzungs-Cookies</strong> — nur wenn du dich anmeldest, zur
                  Aufrechterhaltung deiner Sitzung. Diese sind technisch notwendig
                  (Art. 6 Abs. 1 lit. f DSGVO bzw. § 25 Abs. 2 Nr. 2 TDDDG).
                </li>
              </ul>

              <h2 id="konto-und-anmeldung">Konto und Anmeldung</h2>
              <p>
                Wenn du ein Konto erstellst, speichern wir Benutzername,
                Anzeigename, E-Mail-Adresse und einen Passwort-Hash (Klartext-Passwörter
                werden nie gespeichert). Rechtsgrundlage ist Art. 6 Abs. 1 lit. b
                DSGVO. Gespeichert werden sie in einer von der MongoDB, Inc.
                betriebenen Atlas-Datenbank, mit der ebenfalls ein Vertrag zur
                Auftragsverarbeitung besteht.
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

              <h2 id="kontaktformular">Kontaktformular</h2>
              <p>
                Die von dir eingegebenen Daten (Name, E-Mail-Adresse, Betreff,
                Nachricht) speichern wir zur Bearbeitung deiner Anfrage.
                Rechtsgrundlage ist Art. 6 Abs. 1 lit. b bzw. f DSGVO. Die Nachrichten
                werden gelöscht, sobald die Anfrage abschließend bearbeitet ist und
                keine gesetzlichen Aufbewahrungspflichten entgegenstehen.
              </p>

              <h2 id="vorschlaege-und-playlist-ideen">Vorschläge und Playlist-Ideen</h2>
              <p>
                <strong>Formular auf /mitmachen:</strong> Was du dort eingibst (Name und
                Text), schickt unser Server als Nachricht in einen von zwei Kanälen
                unseres Discord-Servers (Discord Netherlands B.V.; Discord verarbeitet
                Daten auch in den USA). Dein Browser verbindet sich dabei nur mit
                voltfm.xyz, nicht mit Discord. Auf voltfm.xyz speichern wir die
                Einsendung nicht. Rechtsgrundlage ist deine Einwilligung (Art. 6 Abs. 1
                lit. a DSGVO), die du mit dem Häkchen gibst. Du kannst sie jederzeit
                widerrufen; dann löschen wir die Nachricht im Discord. Damit das
                Formular nicht missbraucht wird, zählt unser Server kurz im
                Arbeitsspeicher, wie oft von einer IP-Adresse gesendet wurde.
                Gespeichert wird die IP-Adresse dabei nicht.
              </p>
              <p>
                <strong>Nachrichten im Discord:</strong> Aus diesen beiden Kanälen liest
                unser Server Anzeigename, Text und Zeitpunkt der Nachrichten, damit das
                Team sie im Admin-Bereich sieht. Auf /mitmachen zeigen wir einzelne
                Einträge mit Anzeigename, Text und Datum, aber erst, wenn jemand aus
                dem Team sie freigegeben hat. Profilbilder laden wir dafür nicht, und
                wer in einer Nachricht nur erwähnt wird, erscheint nicht. Die Texte
                speichern wir nicht; gespeichert wird nur, welche Nachricht freigegeben
                ist. Löschst du deine Nachricht im Discord, verschwindet sie nach kurzer
                Zeit auch hier. Rechtsgrundlage ist unser berechtigtes Interesse, Ideen
                aus der Community zu zeigen (Art. 6 Abs. 1 lit. f DSGVO). Du kannst
                jederzeit widersprechen, am einfachsten über das Kontaktformular.
              </p>

              <h2 id="bilder-und-uploads-uploadthing">Bilder und Uploads (UploadThing)</h2>
              <p>
                Titel-, Cover- und Profilbilder liegen bei <strong>UploadThing</strong>
                (Ping Labs, Inc., USA). Ausgeliefert werden sie über unseren eigenen
                Server unter <code>/api/bilder/…</code>: Dein Browser verbindet sich
                beim Betrachten eines Bildes also mit voltfm.xyz, nicht mit
                UploadThing. Deine IP-Adresse wird dabei nicht an diesen Dienst
                übertragen. Hochladen können ausschließlich angemeldete Personen mit
                Redaktionsrechten.
              </p>
              <p>
                Ältere Bilder, die vor dieser Umstellung hochgeladen wurden, werden
                noch direkt von UploadThing geladen; dabei wird deine IP-Adresse an
                den Dienst übertragen. Rechtsgrundlage ist insoweit Art. 6 Abs. 1
                lit. f DSGVO.
              </p>

              <h2 id="eingesetzte-dienste-auf-einen-blick">Eingesetzte Dienste auf einen Blick</h2>
              <table className="vfm-table">
                <thead>
                  <tr>
                    <th>Dienst</th>
                    <th>Wofür</th>
                    <th>Sitz</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Vercel Inc.</td>
                    <td>Hosting der Website</td>
                    <td>USA</td>
                  </tr>
                  <tr>
                    <td>MongoDB, Inc. (Atlas)</td>
                    <td>Datenbank für Konten und Inhalte</td>
                    <td>USA / EU</td>
                  </tr>
                  <tr>
                    <td>Ping Labs, Inc. (UploadThing)</td>
                    <td>Speichern von Bildern (Auslieferung über unseren Server)</td>
                    <td>USA</td>
                  </tr>
                  <tr>
                    <td>Discord Netherlands B.V.</td>
                    <td>Anmeldung mit Discord, Profilbilder, Vorschläge und Playlist-Ideen</td>
                    <td>Niederlande</td>
                  </tr>
                  <tr>
                    <td>laut.fm GmbH</td>
                    <td>Ausstrahlung des Programms</td>
                    <td>Deutschland</td>
                  </tr>
                </tbody>
              </table>

              <h2 id="keine-automatisierte-entscheidungsfindung">Keine automatisierte Entscheidungsfindung</h2>
              <p>
                Es findet kein Profiling und keine automatisierte Entscheidungsfindung
                im Sinne von Art. 22 DSGVO statt.
              </p>

              <h2 id="deine-rechte">Deine Rechte</h2>
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

              <h2 id="loeschung-deines-kontos">Löschung deines Kontos</h2>
              <p>
                Du kannst dein Konto jederzeit unter <a href="/konto">Konto</a> löschen
                lassen oder uns eine formlose Nachricht schicken. Mit der Löschung
                entfernen wir alle zu deinem Konto gespeicherten Daten.
              </p>

              <h2 id="stand-und-hinweis">Stand und Hinweis</h2>
              <p className="rounded-2xl bg-surface-secondary px-5 py-4 text-[0.9375rem] leading-relaxed">
                Dieser Text beschreibt die tatsächliche Datenverarbeitung von{" "}
                {site.name} zum Stand dieser Fassung. Er ersetzt keine Rechtsberatung.
              </p>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
