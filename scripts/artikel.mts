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
 *
 * Die Angaben zur vorigen Webseite stammen aus deren Quelltext (Seitenbaum,
 * package.json, Design-Regeln), nicht aus der Erinnerung.
 */

const DISCORD_URL = process.env.NEXT_PUBLIC_DISCORD_URL ?? "https://discord.gg/6JzSsUTWuh";
const APPLY_URL = "https://portal.voltfm.xyz/";

export interface SeedArticle {
  slug: string;
  /** Optional: ein Bild aus public/titelbilder/, samt Beschreibung. */
  coverImage?: string;
  coverAlt?: string;
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
  /* Der Titel nennt jetzt, worum es wirklich geht. Der Slug bleibt, damit
     bereits geteilte Links weiter funktionieren. */
  title: "RadioAid am 6. November — und warum unsere Station jannikjbi heißt",
  excerpt:
    "Die zwei Fragen, die uns am häufigsten erreichen: Warum bei laut.fm nicht VoltFM steht, sondern jannikjbi. Und was es mit RadioAid auf sich hat — 24 Stunden Radio für einen guten Zweck, dieses Jahr für Seelenpflaster e. V.",
  categorySlug: "in-eigener-sache",
  tags: ["Relaunch", "In eigener Sache", "laut.fm", "RadioAid"],
  authorName: "jannikjbi",
  featured: true,
  source: `<p class="vfm-lead">Zwei Fragen erreichen uns häufiger als alle anderen: Warum steht bei laut.fm eigentlich jannikjbi und nicht VoltFM? Und was ist dieses RadioAid, von dem hier überall die Rede ist? Beide sollen hier einmal ausführlich beantwortet werden — die zweite ist die wichtigere, denn am 6. November ist es wieder so weit.</p>

## Wo wir herkommen

Angefangen hat das im **Januar 2021** mit einer laut.fm-Station namens **jannikjbi**. Kein Konzept, kein Sendeplan, keine Hörer — jemand hat auf Play gedrückt und geschaut, was passiert. Mochiko war von der ersten Stunde an dabei.

Danach kam die Namenssuche. Aus jannikjbi wurde jannikjbiFM, dann ein anderer Name, und noch einer. Ausprobiert, verworfen, neu versucht — weil schlicht nicht klar war, was bei Hörern ankommt. Geblieben ist am Ende **VoltFM**.

## Warum unsere Station jannikjbi heißt

Die Frage kommt so oft, dass sie hier ausführlich beantwortet werden soll. Wenn du auf „Jetzt hören“ drückst, öffnet sich der Webplayer — und dort steht nicht VoltFM, sondern **jannikjbi**.

Der Grund ist schlicht Geschichte. Die Station gehört Jannik und wurde im Januar 2021 unter seinem Handle angelegt. Den Namen VoltFM gab es damals noch gar nicht; er ist erst Jahre später aus der Namenssuche hervorgegangen. Der Sender hat sich seitdem umbenannt, die Station nicht.

### Warum wir nicht einfach umgezogen sind

Naheliegende Frage: Dann legt doch eine neue Station namens „voltfm" an und gut. Dagegen spricht mehr, als man denkt.

- **Die Historie wäre weg.** Eine laut.fm-Station sammelt über Jahre, was sie gespielt hat. Das ist nicht übertragbar.
- **Die Einstellungen wären weg.** Playlisten, Regeln, Feinjustierung — alles, was seit 2021 gewachsen ist, müsste von vorn aufgebaut werden.
- **Die Hörerinnen und Hörer wären weg.** Wer die Station gespeichert hat, in einer Radio-App oder als Lesezeichen, landet danach im Leeren. Niemand zieht freiwillig um, nur weil ein Name sich ändert.
- **Gewonnen hätten wir: einen schöneren Namen in der Adresszeile.** Mehr nicht.

Also bleibt es beim alten Namen.

::: hinweis
**jannikjbi ist die Station, VoltFM ist das Programm.** Der Name bedeutet nicht, dass hier einer allein sendet — er ist die Kennung, unter der die Station 2021 angelegt wurde, und sonst nichts.
:::

Wenn wir irgendwann über einen eigenen Radioserver senden, stellt sich die Frage neu. Bis dahin: Nicht wundern, wenn beim Klicken auf „Jetzt hören“ ein anderer Name auftaucht. Es ist der richtige Stream.

## Warum der Stream bei laut.fm läuft und nicht hier

Noch etwas, das auffällt: Die Wiedergabe passiert nicht auf dieser Seite, sondern in einem neuen Fenster, im Webplayer von lautstation.de. Das ist kein Versehen und keine fehlende Funktion. Die Nutzungsbedingungen von laut.fm erlauben ausdrücklich das Verlinken, aber **nicht das Einbetten** des Streams auf fremden Seiten (§ 6 Abs. 9). Daran halten wir uns, auch wenn ein Player direkt auf der Seite bequemer wäre.

Dazu gehört eine zweite ehrliche Auskunft: **Über laut.fm läuft Werbung.** Wir schalten sie nicht, wir verdienen nichts daran, und abschalten können wir sie nicht.

Aus demselben Grund steht gerade **kein Sendeplan**: Solange wir über laut.fm senden, können wir keine Songwünsche annehmen und keine verlässlichen Sendezeiten zusagen. Ein Sendeplan, auf den kein Verlass ist, ist schlimmer als gar keiner. Wir haben im August einen eigenen Sendeweg getestet und ihn aus Kostengründen wieder aufgegeben; woran wir stattdessen arbeiten, steht [im Beitrag zur neuen Seite](/news/was-die-neue-seite-kann).

## RadioAid: 24 Stunden für einen guten Zweck

Am **6. November 2026** läuft wieder RadioAid. Wer davon noch nie gehört hat: Es lohnt sich, das zu wissen, denn es ist der Termin, auf den bei uns das ganze Jahr zuläuft.

**RadioAid bringt Webradios und Radiostationen für eine gemeinsame Charity-Aktion zusammen.** Über 24 Stunden entsteht ein einziges Programm, das alle teilnehmenden Sender gleichzeitig übertragen. Jeder einzelne Sender wäre für sich zu klein — zusammen entsteht Reichweite, und die geht an einen guten Zweck.

Für uns heißt das: **An diesem Tag läuft bei VoltFM nicht unser Programm.** Wir schalten auf RadioAid um, 24 Stunden lang. Das ist der Sinn der Sache.

### Der Ablauf 2026

| Wann | Was |
| --- | --- |
| 6.11., ab 17:00 Uhr | Warm-up zu RadioAid 2026 |
| 6.11., 18:00 Uhr | Start — ab hier läuft das gemeinsame Programm |
| 6.11. bis 7.11. | 24 Stunden durchgehend |
| 7.11., 18:00 Uhr | Ende |

### Wofür 2026 gesendet wird

In diesem Jahr gehen die Spenden an **Seelenpflaster e. V.** Der Verein verfolgt seit August 2021 ein Ziel, das man in einem Satz erklären kann: Kindern in besonders schweren Lebenssituationen mit persönlicher Post eine Freude machen. Ein kleines Überraschungsgeschenk, eine Grußkarte — adressiert an genau dieses Kind, mit seinem Namen darauf.

Es geht um Kinder, die unheilbar oder akut erkrankt sind, um Kinder mit schweren Beeinträchtigungen und um Kinder in psychisch belastenden Situationen. Das erklärte Ziel ist bewusst unbescheiden: ein breites Grinsen. Der Alltag dieser Kinder ist schwer genug.

### Worum es an dem Tag geht

Nicht um Reichweite für einen einzelnen Sender — sondern darum, möglichst viele Ohren zu erreichen. Die Hörerinnen und Hörer sollen erfahren, was der Verein macht, wie man ihn konkret unterstützen kann, und am Ende möglichst auch spenden.

Deshalb macht es auch nichts, dass an diesem Tag überall dasselbe läuft. Das ist der Punkt.

### Wie lange wir schon dabei sind

Länger, als es VoltFM gibt. Jannik hat unter verschiedenen Namen und mit verschiedenen Radioprojekten an RadioAid teilgenommen; unter dem Namen **VoltFM** wird die Geschichte seit 2025 weitergeführt. Die Zwecke der vergangenen Jahre reichen von den Tafeln Deutschland über die Deutsche Depressionshilfe und das Ambulante Kinderhospiz München bis zu den Hamburger Kinderwünschen.

Inzwischen ist es eine kleine Tradition — und der Tag im Jahr, an dem sich der ganze Aufwand am deutlichsten lohnt.

### Du hast selbst einen Sender?

Dann mach mit. Bei RadioAid kann jede Station teilnehmen, die Sendung wird **kostenfrei** zur Verfügung gestellt. Moderieren, übertragen oder einfach nur Werbung dafür machen — alles hilft. Die Anlaufstelle dafür ist [radioaid.de](https://radioaid.de/).

Und wenn du keinen Sender hast: Einschalten und weitersagen zählt genauso.

[Alles zu RadioAid, samt Countdown](/radioaid)

## Mitmachen

Wenn du Lust hast, selbst zu moderieren oder hinter den Kulissen zu helfen: Bewerbungen laufen über unser [Portal](${APPLY_URL}). Dort suchst du dir die Stelle aus, die zu dir passt — bei manchen gehört ein kleiner Test dazu.

Der schnellste Weg zu uns bleibt der [Discord](${DISCORD_URL}).

::: warnung
Unser Mailserver ist ausgefallen, und wir suchen nach etwas Neuem. Schreib uns in der Zwischenzeit bitte über Discord im Kanal **#ticket-erstellen** — dort geht nichts verloren.
:::

## Und sonst

Die Webseite ist neu — was sie kann und warum sie zwischendurch offline war, steht in einem [eigenen Beitrag](/news/was-die-neue-seite-kann).

Bleibt das Wichtigste: **6. November, 18 Uhr.** Schalt ein.`,
};

export const WEBSEITE_ARTICLE: SeedArticle = {
  slug: "was-die-neue-seite-kann",
  title: "16 Tage offline — und was danach dastand",
  excerpt:
    "Am 3. September ging voltfm.xyz vom Netz, am 19. September war die Seite zurück: komplett neu gebaut, keine Zeile übernommen. Der ausführliche Rundgang — was neu ist, was anders gelöst ist, was noch fehlt.",
  categorySlug: "hinter-den-kulissen",
  tags: ["Relaunch", "Hinter den Kulissen", "Technik"],
  authorName: "jannikjbi",
  featured: false,
  source: `<p class="vfm-lead">Am 3. September ging voltfm.xyz offline. Am 19. September war die Seite wieder da — und zwar eine andere. Wer dazwischen vorbeigeschaut hat, stand ohne Vorwarnung vor einer Seite, die es nicht mehr gab. Dafür eine Entschuldigung, und hier die Erklärung.</p>

## Warum die Seite offline war

Die Abschaltung hatte **private Gründe**. Mehr davon gehört nicht auf eine öffentliche Seite.

Ehrlich dazugehört aber etwas anderes: **Es stand ernsthaft zur Debatte, VoltFM ganz zu beenden.** Das war keine Trotzreaktion und kein Streit im Team — es war die nüchterne Frage, ob sich der Aufwand noch lohnt. Ein paar Tage lang sah es nach Schluss aus.

Wir haben uns dagegen entschieden. Und wenn man einmal so weit war, will man danach nicht dort weitermachen, wo man aufgehört hat.

::: hinweis
**Der Stream lief die ganze Zeit weiter.** Offline war nur die Webseite, nicht der Sender. Wer die Station direkt bei laut.fm oder in einer Radio-App gespeichert hatte, hat von alldem nichts gemerkt.
:::

Also die Gelegenheit genutzt: Die Seite war ohnehin vom Netz, ein Umbau bei laufendem Betrieb entfiel. **Sechzehn Tage später stand das hier.** Weil „wir haben die Seite neu gebaut" wenig darüber sagt, was sich tatsächlich ändert, hier der ausführliche Rundgang.

## Erst einmal: Es ist wirklich neu

Die alte Seite war keine Bastelei — auch sie war eine selbst gebaute Anwendung, und zwar keine kleine: rund **33.000 Zeilen in gut 220 Dateien**. Sie hatte Sendungsseiten, Podcasts, Partnerbereiche, einen Changelog und ein Bewerbungssystem.

Trotzdem ist von ihr **keine einzige Zeile** in die neue Seite übernommen worden. Nicht, weil die alte schlecht war, sondern weil im Fundament zu vieles anders sein sollte: eine andere Datenbank, ein anderes Gestaltungssystem, ein anderes Verständnis davon, wie Inhalte gepflegt werden. Wer das Fundament tauscht, baut das Haus neu.

Die neue Seite steht heute bei rund **32.000 Zeilen in knapp 300 Dateien** — in sechzehn Tagen geschrieben.

| | vorher | jetzt |
| --- | --- | --- |
| Datenbank | Postgres über Prisma | MongoDB |
| Gestaltung | Tailwind mit fertigen Bausteinen | CSS-Module mit eigenen Design-Tokens |
| Texte im Beitrag | Markdown-Bibliothek | eigener Konverter, beim Speichern bereinigt |
| Bilder | direkt vom Speicheranbieter | über voltfm.xyz ausgeliefert |
| Inhalte pflegen | teils im Code hinterlegt | vollständig im Adminbereich |

## Der Ton bleibt an

Das war die wichtigste Anforderung. Früher riss der Ton ab, sobald man irgendwo hinklickte — jeder Seitenwechsel bedeutete: neu starten, warten, wieder einsteigen. Inzwischen öffnet „Jetzt hören“ den Webplayer in einem eigenen Fenster. Dort läuft die Musik weiter, egal, wo du hier gerade klickst.

Unten am Rand siehst du immer, was gerade läuft: Titel, Interpret und das Cover, soweit wir eines finden.

## Was auf der Seite steht

### News

Jeder Beitrag hat eine Kategorie und Schlagwörter, über die sich zusammengehörige Themen finden lassen. Die Suche durchsucht die Beiträge tatsächlich im Volltext und sortiert nach Treffergüte — sie vergleicht nicht bloß Überschriften.

Beiträge können außerdem **geplant** werden: Datum setzen, Status auf „Geplant", und der Text erscheint von selbst, wenn es so weit ist. Für Ankündigungen, die um Mitternacht online gehen sollen, muss niemand mehr wach bleiben.

### Moderatorenprofile

Vorher: Bild, Name, zwei Zeilen. Jetzt: Werdegang, Motto, Genres, Ort, dabei seit wann, Links zu den eigenen Kanälen und beliebig viele weitere Angaben.

Dazu kommt etwas, das man sehen muss: Jedes Profil hat eine **eigene Akzentfarbe** und eine von vier **Gestaltungsvarianten**. Zwei Profile nebeneinander sehen deshalb nicht gleich aus — was bei Leuten, die im Radio ihre eigene Sendung haben, auch richtig so ist.

### Events und Zeitleiste

Events haben Datum, Ort und Beschreibung und wandern nach dem Termin von selbst ins Archiv. Niemand muss aufräumen, und es steht nie ein vergangener Termin als „demnächst" herum.

Die Zeitleiste auf „Über uns" erzählt, wo VoltFM herkommt — und ist genauso pflegbar wie alles andere.

### RadioAid

Eigene Seite mit eigenem Aussehen und einem Countdown, der auf den 6. November läuft. Nach der Sendung verschwindet der Eintrag von selbst aus dem Menü, statt bis zum nächsten Jahr auf einen vergangenen Termin zu zeigen.

### Das Menü

Mit den Seiten ist auch das Menü gewachsen. Damit daraus keine Bleiwüste wird, rutscht alles, was nicht in die erste Reihe passt, in ein Aufklappmenü unter **Mehr**. Auf dem Handy klappt die Navigation als eigene Fläche auf, statt als Liste unter der Kopfzeile zu kleben.

## Hell, dunkel, und was dein Gerät gerade will

Die Seite hat einen hellen und einen dunklen Modus. Von sich aus richtet sie sich danach, was dein Gerät eingestellt hat; über das Zahnrad oben kannst du es überschreiben. Die Wahl bleibt gespeichert — auf deinem Gerät, nicht bei uns.

Dass beide Modi funktionieren, ist kein Zufall: Jede Farbe auf der Seite ist ein benannter Wert, kein fest eingetragener Farbcode. Hell und dunkel sind zwei Sätze dieser Werte. Deshalb gibt es keine Ecke, die im hellen Modus plötzlich weiß auf weiß ist.

## Anmelden — auf drei Wegen

Ein Konto ist für nichts nötig, was man zum Hören braucht. Wer eines hat, kann sich auf drei Arten anmelden:

- **Mit Discord** — ein Klick, kein weiteres Passwort.
- **Mit Benutzername und Passwort** — für alle, die kein Discord wollen.
- **Mit Passkey** — Fingerabdruck, Gesicht oder Geräte-PIN, ganz ohne Passwort.

Wer mehrere Wege nutzen will, kann sie im Konto miteinander verknüpfen. Und weil Passwörter das schwächste Glied sind: Anmeldeversuche sind begrenzt, damit niemand sie einfach durchprobieren kann.

## Was wir bewusst nicht tun

Drei Dinge, die auf vielen Seiten selbstverständlich sind und bei uns nicht:

::: hinweis
**Kein Tracking.** Wir zählen nicht, wer wie lange wo war. Kein Analysewerkzeug, keine Zählpixel, keine Werbe-Cookies. Was wir speichern, steht in der Datenschutzerklärung — und das ist kurz.
:::

**Keine Verbindung zu Dritten, bevor du zustimmst.** Der Stream liegt bei laut.fm, der Webplayer bei lautstation.de. Sobald du auf Play drückst, wissen beide, dass jemand von deiner Adresse zuhört — daran führt kein Weg vorbei. Aber wir sagen es dir vorher, statt die Verbindung im Hintergrund schon einmal aufzubauen. Die Titelanzeige holt unser eigener Server; dafür braucht es nichts.

**Keine Bilder von fremden Servern.** Die Fotos in den Beiträgen liegen bei einem Speicheranbieter, ausgeliefert werden sie aber über voltfm.xyz. Dein Browser verbindet sich beim Betrachten eines Bildes also mit uns und mit niemandem sonst. Das war vorher anders.

**Und keine geschönten Zahlen.** Wenn irgendwo eine Zahl steht, ist es die echte — oder sie steht nicht da.

## Barrierefreiheit ist kein Extra

Jedes Bild braucht eine Beschreibung — nicht als Empfehlung, sondern als Bedingung: Ein Beitrag mit unbeschriebenem Bild lässt sich bei uns gar nicht speichern. Das ist unbequem, und genau deshalb funktioniert es.

Dazu kommt, was man nicht bemerkt, solange man es nicht braucht:

- **Saubere Überschriften-Ebenen**, damit Screenreader die Seite überspringen können, statt sie vorzulesen.
- **Sichtbare Fokusrahmen** — wer mit der Tastatur blättert, sieht immer, wo er gerade ist.
- **Ausreichende Kontraste** in beiden Farbmodi, nicht nur im dunklen.
- **Beschriftete Knöpfe**, auch wenn nur ein Symbol zu sehen ist.
- **Respekt vor „weniger Bewegung"**: Wer das im Betriebssystem eingestellt hat, bekommt keine Animationen.

## Hinter den Kulissen

Für uns selbst ist der größte Unterschied das Redaktionssystem. Früher hieß „wir schreiben mal was" oft auch: Jemand muss Code anfassen, testen und hochladen. Heute ist es ein Textfeld, ein Knopf, fertig.

### Schreiben

Geschrieben wird in Markdown — Überschriften mit Rauten, Fettes zwischen Sternchen, Listen mit Bindestrichen. Ein Bild zieht man einfach ins Textfeld oder fügt es aus der Zwischenablage ein; hochgeladen und eingesetzt wird es von selbst. Eine Vorschau zeigt vorher, wie der Beitrag aussehen wird — und zwar gerendert wie beim Speichern, nicht bloß ungefähr.

Wer nicht weiß, wie eine Tabelle oder ein Hinweiskasten geschrieben wird, findet im Adminbereich einen Spickzettel mit allen Möglichkeiten und einem Kopierknopf daneben.

### Wer was darf

Es gibt vier Rollen: **Hörer**, **Redaktion**, **Admin** und **Inhaber**. Die Redaktion schreibt Beiträge, kümmert sich aber nicht um Konten; Admins verwalten alles außer den Grundfesten. Entscheidend ist dabei: Die Rechte gelten auf dem Server. Einen Knopf auszublenden ist kein Schutz — jede Aktion prüft selbst nach, ob sie ausgeführt werden darf.

### Wenn doch etwas schiefgeht

Eine Seite, die es nicht gibt, zeigt eine richtige 404-Seite mit Wegen zurück — kein leeres Fenster. Und wenn wirklich einmal etwas abstürzt, erscheint eine Fehlerseite im Aussehen der Seite, mit einem Knopf zum erneuten Versuch und einer Kennung, die uns hilft, den Fall zuzuordnen. Was genau schiefging, steht bewusst nicht dort: Solche Meldungen enthalten oft Interna.

### Veröffentlichen

Technisch steht die Seite auf Next.js 16 und React 19, die Inhalte liegen in einer MongoDB, gehostet wird bei Vercel. Bei jeder Veröffentlichung laufen die nötigen Änderungen an der Datenbank automatisch mit — jede genau einmal. Das klingt nach Kleinkram, ist aber der Unterschied zwischen „läuft" und „läuft, bis jemand einen Schritt vergessen hat".

Seiten werden auf dem Server erzeugt und zwischengespeichert; nach jeder Änderung im Adminbereich wird gezielt nur das erneuert, was diese Änderung betrifft. Deshalb ist ein neuer Beitrag sofort da, ohne dass die ganze Seite neu gebaut werden muss.

## Der Versuch im August: eigener Server

Dass wir wieder über laut.fm senden, ist keine Bequemlichkeit. Wir hatten es anders versucht.

Im **August** haben wir eine eigene Infrastruktur mit **AzuraCast** aufgesetzt — gedacht als Test, um zu sehen, was ein eigener Sendeweg bringt. Gebracht hat er vor allem Klarheit darüber, was er kostet.

Drei Posten, die zusammen den Ausschlag gaben:

- **Der Server.** Ein Stream läuft rund um die Uhr. Das ist keine Website, die nachts schläft, und es schlägt jeden Monat zu Buche.
- **GEMA und GVL.** Der größte Brocken. Wer selbst sendet, muss die Musik auch selbst lizenzieren — bei laut.fm ist das abgedeckt, auf eigenen Füßen nicht. Für ein Projekt dieser Größe sind das Summen, die in keinem Verhältnis stehen.
- **Die Software.** Was man für einen ordentlichen Betrieb braucht, gibt es nicht umsonst.

Also sind wir zurück auf die laut.fm-Station, die es seit 2021 gibt — dieselbe, die deshalb bis heute **jannikjbi** heißt. Der Test war kein verlorener Monat: Er hat uns davor bewahrt, Kosten einzugehen, die wir auf Dauer nicht tragen können.

## Wie es weitergehen soll

Dazu muss man wissen, was heute läuft: **Wir nutzen den Musikpool von laut.fm.** Die Musik kommt also aus deren Bestand, und laut.fm spielt sie ab — wir stellen zusammen, was in welcher Richtung läuft, aber wir senden nicht selbst.

Ganz vom Tisch ist der eigene Weg trotzdem nicht. Inzwischen haben wir eine Software gefunden, mit der sich ein eigener Server betreiben lässt, der **von dort aus auf laut.fm sendet** — der laut.fm-Weg bleibt also, aber die Steuerung liegt bei uns. Statt eines Musikpools wären wir dann **rund um die Uhr live**. Damit wäre möglich, was heute nicht geht:

- eigene Musik statt des laut.fm-Pools, und Songs gezielt abspielen
- eigene Einspieler und Werbung
- die laut.fm-Nachrichten automatisch einbinden, stündlich oder alle zwei Stunden
- und damit auch: verlässliche Sendezeiten und Songwünsche

::: warnung
**Ein Haken bleibt.** Sobald eigene Werbung dazukommt, ist VoltFM nach unserem Verständnis kein reines Hobbyprojekt mehr, sondern ein kommerzielles Angebot — mit allem, was rechtlich daran hängt. Das will überlegt sein. **Ob und wann das kommt, ist deshalb offen.** Geplant ist es, versprochen ist nichts.
:::

## Was noch fehlt

Ehrlich bleiben gehört dazu. Einiges, was es auf der alten Seite gab, gibt es hier noch nicht:

| Fehlt noch | Warum | Wann |
| --- | --- | --- |
| Sendeplan | keine verlässlichen Zeiten über laut.fm | geplant, Zeitpunkt offen |
| Songwünsche | über laut.fm nicht möglich | geplant, Zeitpunkt offen |
| Player auf der Seite | laut.fm erlaubt nur Verlinken | nur wenn wir selbst senden |
| Kontaktformular | unser Mailserver ist ausgefallen | sobald Mail wieder läuft |
| Podcast- und Partnerbereich | kommt nach dem Wesentlichen | noch offen |

::: warnung
Solange die Mail nicht läuft, erreichst du uns über Discord im Kanal **#ticket-erstellen**. Dort geht nichts verloren.
:::

## Sag uns, was klemmt

Wenn dir etwas auffällt — ein Knopf, der nicht tut, eine Seite, die auf deinem Gerät komisch aussieht, ein Text, der falsch ist: Schreib es uns im [Discord](${DISCORD_URL}). Sechzehn Tage sind kurz, und eine neue Seite hat immer Ecken, die erst auffallen, wenn andere sie benutzen.

Danke an alle, die in den zwei Wochen einfach abgewartet haben. Wir sind zurück — diesmal auf einem Fundament, das hält.`,
};

/**
 * RadioAid 2026. Fakten von radioaid.de und /radioaid: Termin, Empfaenger,
 * Spendenlink, seit 2022 dabei, die Zwecke der Vorjahre. Die Gesamtsumme von
 * /radioaid steht bewusst nicht drin — sie liess sich nicht pruefen.
 *
 * featured, damit der Beitrag bis zur Sendung die News anfuehrt. Danach im
 * Admin wieder abwaehlen.
 */
export const RADIOAID_2026_ARTICLE: SeedArticle = {
  slug: "radioaid-2026",
  title: "RadioAid 2026: 24 Stunden für Seelenpflaster e. V.",
  excerpt:
    "Am 6. November um 18 Uhr startet RadioAid. 24 Stunden lang läuft bei uns die gemeinsame Charity-Sendung statt des Musikpools.",
  categorySlug: "events",
  tags: ["RadioAid", "Charity", "Seelenpflaster"],
  coverImage: "/titelbilder/radioaid-2026.png",
  coverAlt: "RadioAid 2026: 24 Stunden für Seelenpflaster e. V., 6. November ab 18 Uhr",
  authorName: "jannikjbi",
  featured: true,
  source: `Am **6. November um 18 Uhr** beginnt RadioAid 2026. Bis zum 7. November um 18 Uhr läuft bei VoltFM dann nicht der Musikpool, sondern die gemeinsame Charity-Sendung.

## Was RadioAid ist

RadioAid kommt aus der laut.fm-Community. Einmal im Jahr machen Radiostationen zusammen 24 Stunden Programm für einen guten Zweck. Inzwischen kann jede Station mitmachen und die Sendung kostenlos übertragen. Es geht nicht um Reichweite für einen Sender, sondern darum, dass möglichst viele zuhören und spenden.

## Für wen dieses Jahr gesammelt wird

Die Spenden gehen an **Seelenpflaster e. V.** Der Verein schickt seit August 2021 Kindern in schweren Lebenssituationen persönliche Post: ein kleines Überraschungsgeschenk und eine Grußkarte, adressiert an genau dieses Kind.

## Unser fünftes Mal

Wir übertragen RadioAid seit 2022. Bisher ging es um die Tafeln Deutschland, die Deutsche Depressionshilfe, das Ambulante Kinderhospiz München und die Hamburger Kinderwünsche.

## Was du tun kannst

Einschalten, weitersagen und, wenn du kannst, spenden: [spende.radioaid.de](https://spende.radioaid.de). Du hast selbst einen Sender? Dann mach mit, alles dazu steht auf [radioaid.de](https://radioaid.de/).

[Countdown und alle Infos](/radioaid)`,
};

/** Was mit dem Update im Oktober 2026 dazukam. Nur, was tatsaechlich live ist. */
export const UPDATE_OKTOBER_2026_ARTICLE: SeedArticle = {
  slug: "neues-logo-und-ehrlichere-texte",
  title: "Neues Logo, ehrlichere Texte: Was sich auf der Seite geändert hat",
  excerpt:
    "Ein neues Logo, eine Playlist der letzten Tage, ein Countdown für RadioAid und Texte, die nur noch versprechen, was es gibt.",
  categorySlug: "in-eigener-sache",
  tags: ["Webseite", "Update", "In eigener Sache"],
  coverImage: "/titelbilder/neues-logo-und-ehrlichere-texte.png",
  coverAlt: "Das neue VoltFM-Play-Logo mit Blitz, darunter: Neues Logo, ehrlichere Texte",
  authorName: "jannikjbi",
  featured: false,
  source: `Wer heute auf voltfm.xyz vorbeischaut, sieht als Erstes das neue Logo. Geändert hat sich aber mehr. Hier das Wichtigste.

## Das neue Logo

Das alte Logo mit Kopfhörer und Farbverlauf ist weg. Das neue ist ein Play-Zeichen mit Blitz, daneben steht VOLTFM. Du siehst es oben auf der Seite, im Browser-Tab und als Vorschaubild, wenn jemand einen Link zu uns teilt. Wer über uns schreiben will, findet auf der [Presseseite](/presse) alle Varianten zum Herunterladen.

## Texte, die stimmen

Auf der Startseite standen Dinge, die es so nicht gibt: feste Sendungen, eine Redaktion, Live-Chat während der Sendungen, Community-Abende. Das ist raus. Was stimmt: Wir sind zwei Leute, VoltFM gibt es seit 2021, und gerade läuft rund um die Uhr der Musikpool von laut.fm. Wir arbeiten an mehr, ein Datum nennen wir aber erst, wenn es steht.

## RadioAid auf der Startseite

Am 6. November ab 18 Uhr übertragen wir 24 Stunden RadioAid, dieses Jahr für Seelenpflaster e. V. Oben auf der Startseite zählt ein Countdown bis zum Start, und [beim Event](/events/radioaid-2026) steht alles dazu. Nach der Sendung verschwindet der Countdown von selbst.

## Was lief wann

Auf der [Radio-Seite](/radio) findest du jetzt die Playlist der letzten Tage: jeder Titel mit Uhrzeit, Tag für Tag. Die Liste kommt von lautstation.de. Weil sich dein Browser dafür mit einem anderen Anbieter verbindet, lädt sie erst, wenn du auf „Playlist laden“ klickst.

## Kleinigkeiten

- Neben den News steht jetzt das Discord-Profilbild des Autors statt zwei Buchstaben.
- Die Genres stimmen: Charts, Pop und Deutschrap statt Schlager, Rock und Pop.

## Was als Nächstes kommt

Als Nächstes passen wir die Farben der Seite an das neue Logo an. Wenn dir vorher schon etwas auffällt, das nicht stimmt, schreib es uns im [Discord](${DISCORD_URL}).`,
};

export const BEWERBUNGSPORTAL_ARTICLE: SeedArticle = {
  slug: "eigenes-bewerbungsportal",
  title: "Unser eigenes Bewerbungsportal ist online",
  excerpt:
    "Moderation, Playlists, Social Media oder eine eigene Sendung: Auf portal.voltfm.xyz bewirbst du dich mit deinem Discord-Konto und siehst jederzeit, wie es steht.",
  categorySlug: "in-eigener-sache",
  tags: ["Mitmachen", "Bewerbung", "In eigener Sache"],
  coverImage: "/titelbilder/eigenes-bewerbungsportal.png",
  coverAlt: "Das VoltFM-Logo, darunter: Unser eigenes Bewerbungsportal, bewerbung.voltfm.xyz",
  authorName: "jannikjbi",
  featured: true,
  source: `Bewerbungen bei VoltFM liefen bisher über ein fremdes Portal. Jetzt haben wir ein eigenes: [portal.voltfm.xyz](${APPLY_URL}).

## Zwei Wege rein

Entweder du bewirbst dich auf eine Rolle im Team: Moderation, Playlists, Social Media & Content, Event-Team oder Webentwicklung. Oder du schlägst eine eigene Sendung vor, mit Name, Idee, Wunschtermin und ein paar Songs als Beispiel. Passt es, probieren wir es mit einer Probesendung aus.

## In vier Schritten

1. Mit Discord anmelden. Wir sehen nur deinen Namen und dein Profilbild.
2. In Ruhe ausfüllen. Der Entwurf speichert sich von selbst.
3. Wir melden uns. Die Bestätigung kommt per Nachricht vom Bot, den Stand siehst du im Portal.
4. Kennenlernen. Passt es, quatschen wir kurz im Discord oder probieren eine Sendung aus.

## Was wir versprechen – und was nicht

VoltFM ist ehrenamtlich: kein Geld, keine Pflichtstunden, aber auch keine Garantie, dass jede Idee sofort läuft. Jede Bewerbung lesen und hören wir selbst. Eine KI hilft uns höchstens beim Sortieren, entscheiden tut sie nie.

Als Nächstes kommen im Portal das Einreichen von Musik, Wünsche und Grüße für Live-Events und Bewerbungen von Partnern, zum Beispiel für RadioAid.

Mitmachen kannst du ab 16.`,
};
