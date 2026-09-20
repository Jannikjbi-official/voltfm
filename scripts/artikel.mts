/**
 * Die Beitraege, die beim Deploy angelegt werden.
 *
 * Getrennt von `migrate.mts`, weil das Migrationsskript sonst zur Haelfte aus
 * Fliesstext bestuende. Geschrieben ist alles in Markdown, wie im Editor auch
 * — `renderRichText` macht daraus das HTML, das gespeichert wird.
 *
 * Absaetze stehen bewusst in einer einzigen langen Zeile: Ein Zeilenumbruch im
 * Quelltext ist im Textfeld ein echter Umbruch, und mitten im Satz will den
 * niemand.
 */

const DISCORD_URL = process.env.NEXT_PUBLIC_DISCORD_URL ?? "https://discord.gg/6JzSsUTWuh";
const APPLY_URL = "https://dash.pwr.lol/website/1549922141003190324";

export interface SeedArticle {
  slug: string;
  title: string;
  excerpt: string;
  categorySlug: string;
  tags: string[];
  authorName: string;
  featured: boolean;
  /** Markdown. Wird beim Anlegen zu HTML gerendert. */
  source: string;
}

export const RELAUNCH_ARTICLE: SeedArticle = {
  slug: "voltfm-geht-weiter-neue-webseite",
  title: "VoltFM geht weiter — mit neuer Webseite",
  excerpt:
    "Der Sender bleibt, die Seite ist neu gebaut. Dazu die Fragen, die am häufigsten kommen: Warum die Station jannikjbi heißt, warum der Stream bei laut.fm läuft und warum gerade kein Sendeplan steht.",
  categorySlug: "in-eigener-sache",
  tags: ["Relaunch", "In eigener Sache", "laut.fm", "RadioAid"],
  authorName: "jannikjbi",
  featured: true,
  source: `<p class="vfm-lead">Kurz und deutlich vorweg: Es geht weiter mit VoltFM. Es war eine Zeit lang still, und wer zwischendurch vorbeigeschaut hat, konnte den Eindruck bekommen, hier passiert nichts mehr. Der Eindruck war falsch — wir haben in der Zwischenzeit die komplette Webseite neu gebaut. Das ist sie.</p>

Weil in der stillen Zeit einige Fragen liegen geblieben sind, beantworten wir sie hier alle auf einmal: warum die Station anders heißt als der Sender, warum der Stream bei laut.fm läuft und nicht hier, warum gerade kein Sendeplan steht und was als Nächstes kommt.

## Wo wir herkommen

Angefangen hat das im **Januar 2021** mit einer laut.fm-Station, die damals noch **jannikjbiFM** hieß. Kein Konzept, kein Sendeplan, keine Hörer — jemand hat auf Play gedrückt und geschaut, was passiert. Mochiko war von der ersten Stunde an dabei.

Danach kam die Namenssuche. Aus jannikjbiFM wurde ein anderer Name, und noch einer, und noch einer. Ausprobiert, verworfen, neu versucht — weil schlicht nicht klar war, was bei Hörern ankommt. Geblieben ist am Ende **VoltFM**.

Seit **2022** übertragen wir außerdem jedes Jahr RadioAid, die 24-stündige Charity-Sendung der laut.fm-Community: erst für die Tafeln Deutschland, dann für die Deutsche Depressionshilfe, das Ambulante Kinderhospiz München und die Hamburger Kinderwünsche.

## Warum die Seite komplett neu ist

Die alte Seite lief auf einem System, das wir nicht selbst gebaut hatten. Das ging eine Weile gut und hörte dann auf, gut zu gehen: Jede neue Funktion war irgendwo drangeklebt, Inhalte zu pflegen war eine Zumutung, und an dem, was uns wirklich gestört hat, ließ sich nichts ändern — es war ja nicht unser System. Auf dem Handy war die Seite ehrlich gesagt nie richtig gut.

Also haben wir bei null angefangen. Nicht umgezogen, nicht umgebaut: neu gebaut, Zeile für Zeile. Herausgekommen sind rund **32.000 Zeilen in fast 300 Dateien** — Oberfläche, Redaktionssystem, Anmeldung, Radio-Anbindung, alles selbst.

Was jetzt da ist:

- **Ein Player, der beim Seitenwechsel nicht abbricht.** Du kannst durch die Seite klicken, ohne dass der Ton stoppt.
- **Moderatorenprofile**, die mehr sind als ein Bild und zwei Zeilen.
- **News und Events**, die wir selbst pflegen — ohne dass jemand im Code herumschrauben muss.
- **Eine Seite, die auf dem Handy funktioniert.** Nicht „geht auch", sondern dafür gebaut.

Was dahinter steckt, steht ausführlich in einem [eigenen Beitrag](/news/was-die-neue-seite-kann).

## Warum unsere Station jannikjbi heißt

Die Frage kommt so oft, dass sie hier stehen soll. Wenn du unseren Stream öffnest, landest du bei laut.fm auf einer Station namens **jannikjbi** — und nicht auf einer, die VoltFM heißt.

::: hinweis
Der Grund ist schlicht Geschichte: Die Station gehört Jannik, dem Gründer von VoltFM, und läuft seit den allerersten Tagen unter seinem Handle. Damals gab es den Namen VoltFM noch gar nicht.
:::

Wir hätten eine neue Station anlegen können. Dagegen sprach einiges: Eine bestehende laut.fm-Station bringt ihre Historie mit, ihre Einstellungen, ihre Hörerinnen und Hörer. Bei einem Neuanfang wäre all das weg gewesen — für einen rein kosmetischen Gewinn. Also bleibt es beim alten Namen. Das Programm, das darüber läuft, ist VoltFM, und das ist der Teil, auf den es ankommt.

## Warum der Stream bei laut.fm läuft und nicht hier

Wenn du auf „hören" klickst, öffnet sich laut.fm in einem neuen Fenster. Das ist kein Versehen und keine fehlende Funktion: Die Nutzungsbedingungen von laut.fm erlauben ausdrücklich das Verlinken, aber **nicht das Einbetten** des Streams auf fremden Seiten (§ 6 Abs. 9). Daran halten wir uns, auch wenn ein Player direkt auf der Seite bequemer wäre.

Dazu gehört eine zweite ehrliche Auskunft: **Über laut.fm läuft Werbung.** Wir schalten sie nicht, wir verdienen nichts daran, und abschalten können wir sie nicht.

## Warum gerade kein Sendeplan steht

Der Sendeplan ist vorübergehend abgeschaltet — bewusst, nicht aus Versehen. Solange wir über laut.fm senden, können wir keine Songwünsche annehmen und keine verlässlichen Sendezeiten zusagen. Ein Sendeplan, auf den kein Verlass ist, ist schlimmer als gar keiner.

::: hinweis
Wir arbeiten an einem eigenen Radioserver. Damit kommen feste Sendezeiten zurück — und Songwünsche, die tatsächlich ankommen. Sobald das steht, ist der Sendeplan wieder da.
:::

## Als Nächstes: RadioAid am 6. November

Am **6. November 2026 ab 18 Uhr** läuft wieder RadioAid — 24 Stunden Programm, das nicht uns gehört, sondern einem guten Zweck. In diesem Jahr für **Seelenpflaster e. V.**

Alles dazu, samt Countdown, steht auf [der RadioAid-Seite](/radioaid).

## Mitmachen

Wenn du Lust hast, selbst zu moderieren oder hinter den Kulissen zu helfen: Bewerbungen laufen über unser [Portal](${APPLY_URL}). Dort suchst du dir die Stelle aus, die zu dir passt — bei manchen gehört ein kleiner Test dazu.

Der schnellste Weg zu uns bleibt der [Discord](${DISCORD_URL}).

::: warnung
Unser Mailserver ist ausgefallen, und wir suchen nach etwas Neuem. Schreib uns in der Zwischenzeit bitte über Discord im Kanal **#ticket-erstellen** — dort geht nichts verloren.
:::

## Danke

An alle, die in der stillen Zeit drangeblieben sind: Danke. Wir sind zurück.`,
};

export const WEBSEITE_ARTICLE: SeedArticle = {
  slug: "was-die-neue-seite-kann",
  title: "Was die neue Seite kann — und was bewusst fehlt",
  excerpt:
    "Ein Rundgang durch die neue Webseite: der Player, der beim Klicken nicht abbricht, die Profile, die Suche — und warum es kein Tracking, keine fremden Bilder und vorerst keinen Sendeplan gibt.",
  categorySlug: "hinter-den-kulissen",
  tags: ["Relaunch", "Hinter den Kulissen", "Technik"],
  authorName: "jannikjbi",
  featured: false,
  source: `<p class="vfm-lead">Die neue Seite ist online. Weil „wir haben die Seite neu gebaut" wenig darüber sagt, was sich für dich ändert, hier der ausführliche Rundgang — und ein Blick darauf, warum ein paar Dinge bewusst anders gelöst sind, als man es gewohnt ist.</p>

## Der Player bleibt an

Das war die wichtigste Anforderung. Auf der alten Seite riss der Ton ab, sobald man irgendwo hinklickte — jeder Seitenwechsel bedeutete: neu starten, warten, wieder einsteigen. Jetzt liegt der Player über der ganzen Seite. Du kannst durch die News blättern, ein Profil ansehen, die Zeitleiste lesen, und es läuft weiter.

Unten am Rand siehst du immer, was gerade läuft: Titel, Interpret und das Cover, soweit wir eines finden. Auf dem Handy ist die Leiste schmaler und ohne Lautstärkeregler — mit dem Daumen trifft man die Tasten des Geräts ohnehin schneller.

## Alles an einem Ort statt auf fünf Seiten

Der Bereich, in dem du gerade liest, ist neu aufgebaut:

- **News** mit Kategorien, Schlagwörtern und einer Suche, die tatsächlich sucht.
- **Moderatorenprofile** mit Werdegang, Genres, Lieblingssendungen und Links — statt Name und Bild.
- **Events** mit Datum, Ort und Beschreibung, die nach dem Termin von selbst ins Archiv wandern.
- **Eine Zeitleiste** auf „Über uns", die zeigt, wo VoltFM herkommt.
- **RadioAid** mit eigenem Countdown, der nach der Sendung wieder verschwindet.

Das Menü ist mitgewachsen. Damit es keine Bleiwüste wird, rutscht alles, was nicht in die erste Reihe passt, in ein Aufklappmenü unter **Mehr**.

## Hell, dunkel, und was dein Gerät gerade will

Die Seite hat einen hellen und einen dunklen Modus. Von sich aus richtet sie sich danach, was dein Gerät eingestellt hat; über das Zahnrad oben kannst du es überschreiben. Die Wahl bleibt gespeichert — auf deinem Gerät, nicht bei uns.

## Was wir bewusst nicht tun

Drei Dinge, die auf vielen Seiten selbstverständlich sind und bei uns nicht:

::: hinweis
**Kein Tracking.** Wir zählen nicht, wer wie lange wo war. Kein Analysewerkzeug, keine Zählpixel, keine Werbe-Cookies. Was wir speichern, steht in der Datenschutzerklärung — und das ist kurz.
:::

**Keine Verbindung zu Dritten, bevor du zustimmst.** Der Stream liegt bei laut.fm. Sobald du auf Play drückst, weiß laut.fm, dass jemand von deiner Adresse zuhört — daran führt kein Weg vorbei. Aber wir fragen vorher, statt die Verbindung im Hintergrund schon einmal aufzubauen. Die Titelanzeige holt unser eigener Server; dafür braucht es nichts.

**Keine Bilder von fremden Servern.** Die Fotos in den Beiträgen liegen bei einem Speicheranbieter, ausgeliefert werden sie aber über voltfm.xyz. Dein Browser verbindet sich beim Betrachten eines Bildes also mit uns und mit niemandem sonst.

## Barrierefreiheit ist kein Extra

Jedes Bild braucht eine Beschreibung — nicht als Empfehlung, sondern als Bedingung: Ein Beitrag mit unbeschriebenem Bild lässt sich bei uns gar nicht speichern. Dazu kommt, was man nicht bemerkt, solange man es nicht braucht: saubere Überschriften-Ebenen, sichtbare Fokusrahmen beim Blättern mit der Tastatur, ausreichende Kontraste in beiden Farbmodi.

## Hinter den Kulissen

Für uns selbst ist der größte Unterschied das Redaktionssystem. Früher hieß „wir schreiben mal was" auch: Jemand muss Code anfassen, testen und hochladen. Heute ist es ein Textfeld, ein Knopf, fertig.

Geschrieben wird in Markdown — Überschriften mit Rauten, Fettes zwischen Sternchen, Listen mit Bindestrichen. Bilder zieht man ins Textfeld, den Rest erledigt die Seite.

Technisch steht die Seite auf Next.js 16 und React 19, die Inhalte liegen in einer MongoDB, gehostet wird bei Vercel. Änderungen an der Datenbank laufen bei jeder Veröffentlichung automatisch mit, damit niemand von Hand nachziehen muss — und es vergisst.

Gekauft oder zusammengeklickt ist davon nichts. Die vorige Seite lief auf einem fertigen System, bei dem wir nehmen mussten, was es gab. Diesmal ist alles selbst geschrieben: **rund 32.000 Zeilen in fast 300 Dateien.** Das ist kein Selbstzweck — es ist der Grund, warum wir den Player über die ganze Seite legen konnten, warum es kein Tracking gibt und warum eine Änderung heute Abend online ist statt irgendwann.

## Was noch fehlt

Ehrlich bleiben gehört dazu:

| Fehlt noch | Warum | Wann |
| --- | --- | --- |
| Sendeplan | keine verlässlichen Zeiten über laut.fm | mit eigenem Radioserver |
| Songwünsche | über laut.fm nicht möglich | mit eigenem Radioserver |
| Player auf der Seite | laut.fm erlaubt nur Verlinken | wenn wir selbst senden |
| Kontaktformular | unser Mailserver ist ausgefallen | sobald Mail wieder läuft |

::: warnung
Solange die Mail nicht läuft, erreichst du uns über Discord im Kanal **#ticket-erstellen**. Dort geht nichts verloren.
:::

## Sag uns, was klemmt

Wenn dir etwas auffällt — ein Knopf, der nicht tut, eine Seite, die auf deinem Gerät komisch aussieht, ein Text, der falsch ist: Schreib es uns im [Discord](${DISCORD_URL}). Eine neue Seite hat immer Ecken, die erst auffallen, wenn andere sie benutzen.`,
};
