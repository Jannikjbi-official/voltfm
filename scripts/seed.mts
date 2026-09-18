/**
 * Seeds VoltFM with realistic German editorial content.
 *
 * Idempotent: every document is upserted by its slug, so re-running updates the
 * demo content instead of duplicating it. Radio data is never seeded — that
 * comes live from laut.fm at request time.
 *
 * Run with: npm run seed
 */
import { config } from "dotenv";
import { MongoClient } from "mongodb";

// Match Next.js env precedence: .env.local wins over .env.
config({ path: ".env.local" });
config({ path: ".env" });

const uri = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/voltfm";
const dbName = process.env.MONGODB_DB ?? "voltfm";

const client = new MongoClient(uri);
await client.connect();
const db = client.db(dbName);

const now = new Date();
const daysAgo = (n: number) => new Date(now.getTime() - n * 86_400_000);
const daysAhead = (n: number) => new Date(now.getTime() + n * 86_400_000);

/**
 * Deterministic placeholder photography.
 *
 * picsum.photos returns a real photo for a given seed, and always the same one,
 * so seeded content looks populated without shipping binaries. These are
 * placeholders, not curated art — the admin replaces them via UploadThing.
 */
const placeholderImage = (seed: string, w = 1200, h = 675) =>
  `https://picsum.photos/seed/voltfm-${seed}/${w}/${h}`;

/** Rough German reading speed, 200 wpm, minimum one minute. */
const readingTime = (html: string) =>
  Math.max(1, Math.round(html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length / 200));

/* --- Kategorien ---------------------------------------------------------- */

const categories = [
  { slug: "news", name: "News", description: "Alles Neue aus dem Sender.", hue: 0, order: 1 },
  { slug: "musik", name: "Musik", description: "Releases, Charts und Entdeckungen.", hue: 40, order: 2 },
  { slug: "radio", name: "Radio", description: "Technik, Sendungen und Blicke hinter die Kulissen.", hue: -30, order: 3 },
  { slug: "community", name: "Community", description: "Was in unserem Discord passiert.", hue: 80, order: 4 },
  { slug: "events", name: "Events", description: "Specials, Livestreams und Aktionen.", hue: 120, order: 5 },
  { slug: "entertainment", name: "Entertainment", description: "Popkultur, Film und Serien.", hue: 160, order: 6 },
  { slug: "gaming", name: "Gaming", description: "Spiele, Soundtracks und Streams.", hue: 200, order: 7 },
  { slug: "technik", name: "Technik", description: "Studio, Streaming und Ausrüstung.", hue: 240, order: 8 },
  { slug: "voltfm", name: "VoltFM", description: "In eigener Sache.", hue: 280, order: 9 },
];

/* --- Moderatoren --------------------------------------------------------- */

const hosts = [
  {
    slug: "jannikjbi",
    name: "jannikjbi",
    profileLayout: "spotlight",
    accentHue: 251,
    role: "Gründer & Programmchef",
    discordUserId: null,
    bio: "Jannik hat VoltFM 2021 in seinem Jugendzimmer in Oldenburg gestartet — mit einem geliehenen Mikrofon und der festen Überzeugung, dass Radio mehr sein kann als eine Playlist. Heute verantwortet er das Programm, kümmert sich um die Technik hinter dem Stream und steht dreimal pro Woche selbst am Mikrofon. Seine Sendungen leben von langen Musikstrecken und ehrlichen Zwischentönen.",
    showSlugs: ["volt-am-morgen", "volt-nacht"],
    socials: [
      { label: "Discord", url: "https://discord.gg/voltfm" },
    ],
    order: 1,
    active: true,
  },
  {
    slug: "mochikotv",
    name: "mochikotv",
    profileLayout: "stage",
    accentHue: 320,
    role: "Co-Gründerin & EDM",
    discordUserId: "513032712240627733",
    bio: "Mochiko ist die zweite Hälfte von VoltFM. Sie war von Anfang an dabei, als der Sender noch aus einem Laptop und zu viel Koffein bestand, und verantwortet heute alles, was in Richtung EDM geht: Playlists, Sets, Specials. Ihr Anspruch an einen Track ist unbestechlich einfach — er muss um drei Uhr nachts das Potenzial haben, dass die Polizei wegen Ruhestörung klingelt. Wer ihre Sendung kennt, weiß: das ist keine Übertreibung.",
    showSlugs: ["volt-selection", "wochenendstart"],
    socials: [{ label: "Discord", url: "https://discord.gg/voltfm" }],
    order: 2,
    active: true,
  },
  {
    slug: "mira",
    name: "Mira Hensel",
    profileLayout: "editorial",
    accentHue: 150,
    role: "Moderatorin — Community & Events",
    discordUserId: null,
    bio: "Mira moderiert die Community-Sendung und organisiert die VoltFM-Events. Sie sorgt dafür, dass aus Hörerinnen und Hörern Mitwirkende werden: Songwünsche, Grußbotschaften und die monatlichen Community-Abende laufen über ihren Tisch.",
    showSlugs: ["community-hour"],
    socials: [{ label: "Discord", url: "https://discord.gg/voltfm" }],
    order: 3,
    active: true,
  },
  {
    slug: "tobi",
    name: "Tobias Reimann",
    profileLayout: "zine",
    accentHue: 40,
    role: "Moderator — Gaming & Technik",
    discordUserId: null,
    bio: "Tobi verbindet zwei Leidenschaften: Spiele-Soundtracks und Studiotechnik. In seiner Sendung laufen Kompositionen aus Games neben Elektronik und Ambient, dazwischen erklärt er, warum ein Stream eigentlich klingt, wie er klingt.",
    showSlugs: ["pixel-und-pegel"],
    socials: [{ label: "Discord", url: "https://discord.gg/voltfm" }],
    order: 4,
    active: true,
  },
];

/* --- Sendungen ----------------------------------------------------------- */

const shows = [
  { slug: "volt-am-morgen", title: "Volt am Morgen", description: "Wach werden mit Musik, die nicht schreit. Nachrichten aus der Community, Wetter für Oldenburg und die drei Songs, die den Tag tragen.", hostSlugs: ["jannikjbi"], weekday: 1, startTime: "07:00", endTime: "10:00" },
  { slug: "volt-selection", title: "Volt Selection", description: "Mochiko öffnet die Musikredaktion: Neuerscheinungen, Wiederentdeckungen und die Songs, die es fast nicht in die Rotation geschafft hätten.", hostSlugs: ["mochikotv"], weekday: 3, startTime: "19:00", endTime: "21:00" },
  { slug: "community-hour", title: "Community Hour", description: "Eure Wünsche, eure Grüße, eure Playlist. Mira liest live aus dem Discord vor und spielt, was ihr schickt.", hostSlugs: ["mira"], weekday: 4, startTime: "18:00", endTime: "19:30" },
  { slug: "pixel-und-pegel", title: "Pixel & Pegel", description: "Game-Soundtracks, Elektronik und ein Blick auf die Technik dahinter. Tobi erklärt, was im Studio passiert.", hostSlugs: ["tobi"], weekday: 2, startTime: "20:00", endTime: "22:00" },
  { slug: "wochenendstart", title: "Wochenendstart", description: "Freitagabend, Lautstärke hoch. Zwei Stunden Musik zum Aufdrehen — und die Ansage, was am Wochenende bei VoltFM läuft.", hostSlugs: ["mochikotv"], weekday: 5, startTime: "20:00", endTime: "23:00" },
  { slug: "volt-nacht", title: "Volt Nacht", description: "Leise Musik für lange Nächte. Ambient, Slowcore und ruhige Elektronik ohne Werbeunterbrechung.", hostSlugs: ["jannikjbi"], weekday: 6, startTime: "23:00", endTime: "02:00" },
];

/* --- Artikel ------------------------------------------------------------- */

const articles = [
  {
    slug: "voltfm-sendeplan-herbst-2026",
    title: "Neuer Sendeplan: Das läuft ab Oktober bei VoltFM",
    excerpt:
      "Zwei neue Sendungen, ein verschobener Klassiker und mehr Platz für die Community — wir haben das Programm für den Herbst umgebaut.",
    categorySlug: "voltfm",
    tags: ["Sendeplan", "Programm", "Herbst"],
    authorName: "jannikjbi",
    featured: true,
    publishedAt: daysAgo(2),
    content: `<p>Seit dem Sommer haben wir in der Redaktion über einer Frage gebrütet: Wie bekommen wir mehr Community in ein Programm, das ohnehin schon 24 Stunden am Tag läuft? Die Antwort ist ein Sendeplan, der ab dem 1. Oktober an einigen Stellen deutlich anders aussieht.</p>
<h2>Community Hour wandert auf den Donnerstag</h2>
<p>Die <strong>Community Hour</strong> war bisher das bestgehütete Geheimnis im Programm — versteckt am Sonntagnachmittag, wo die wenigsten von euch Zeit hatten. Ab Oktober läuft sie donnerstags um 18 Uhr, direkt im Anschluss an den Feierabend. Mira liest weiterhin live aus dem Discord vor, neu ist die halbe Stunde Verlängerung.</p>
<h2>Pixel &amp; Pegel wird zur festen Größe</h2>
<p>Was als Experiment im Frühjahr begann, bekommt einen festen Sendeplatz: Tobi ist ab sofort jeden Dienstag von 20 bis 22 Uhr auf Sendung. Game-Soundtracks, Elektronik und ein ehrlicher Blick auf die Technik, die unseren Stream am Laufen hält.</p>
<blockquote>Radio funktioniert dann am besten, wenn man merkt, dass da wirklich jemand sitzt.</blockquote>
<h2>Was bleibt</h2>
<p>Volt am Morgen bleibt genau da, wo es ist. Die Nachtstrecke ebenfalls. Und die Musik läuft weiter rund um die Uhr — auch dann, wenn niemand von uns am Mikrofon sitzt.</p>`,
  },
  {
    slug: "mochiko-edm-rotation",
    title: "Mochikos Regel: Wenn es um drei Uhr nachts nicht die Polizei ruft, laeuft es nicht",
    excerpt:
      "Wie unsere Co-Founderin entscheidet, welcher EDM-Track in die Rotation kommt — und warum die meisten durchfallen.",
    categorySlug: "musik",
    tags: ["EDM", "Rotation", "Mochiko"],
    authorName: "Mochiko",
    featured: false,
    publishedAt: daysAgo(1),
    content: `<p>Ich werde ungefähr einmal pro Woche gefragt, nach welchen Kriterien ich einen Track in die EDM-Rotation nehme. Die ehrliche Antwort ist unangenehm simpel, und sie hat nichts mit BPM, Tonart oder Label zu tun.</p>
<h2>Der Test</h2>
<p>Ich stelle mir eine ganz konkrete Situation vor: drei Uhr nachts, Fenster offen, Anlage auf einer Lautstärke, die man niemandem empfehlen kann. Und dann frage ich mich, ob dieser Track das Potenzial hätte, dass jemand die Polizei ruft.</p>
<p>Das klingt nach einem Witz, ist aber der präziseste Filter, den ich kenne. Ein Track, der diesen Test besteht, hat drei Eigenschaften: Er hat einen Moment, auf den man wartet. Er hat genug Druck, dass man ihn im Bauch spürt. Und er ist so gebaut, dass man ihn nicht leiser drehen will.</p>
<h2>Warum die meisten durchfallen</h2>
<p>Der Großteil dessen, was uns erreicht, ist technisch einwandfrei und emotional komplett folgenlos. Sauber gemischt, korrekt arrangiert, und nach vier Minuten weiß niemand mehr, dass er lief. Das ist kein schlechter Track — das ist einfach kein Radiotrack.</p>
<blockquote>Ein Song, den man leiser dreht, hat im Nachtprogramm nichts verloren.</blockquote>
<h2>Und die Ausnahmen</h2>
<p>Es gibt sie: leise Tracks, die trotzdem durchkommen. Meistens, weil sie einen einzigen Moment haben, der alles trägt. Dann darf der Rest ruhig zurückhaltend sein.</p>
<p>Hört rein — <em>Volt Selection</em> mittwochs ab 19 Uhr, <em>Wochenendstart</em> freitags ab 20 Uhr.</p>`,
  },
  {
    slug: "voltfm-zieht-nach-hamburg",
    title: "VoltFM sendet jetzt aus Oldenburg",
    excerpt:
      "Neues Studio, neue Stadt, gleicher Sender: Warum wir umgezogen sind und was sich für euch ändert — nämlich fast nichts.",
    categorySlug: "voltfm",
    tags: ["Oldenburg", "Studio", "In eigener Sache"],
    authorName: "jannikjbi",
    featured: false,
    publishedAt: daysAgo(8),
    content: `<p>Es gibt Nachrichten, die klingen größer, als sie sind. Diese hier ist eine davon: VoltFM sendet ab sofort aus Oldenburg.</p>
<h2>Warum</h2>
<p>Der Umzug hatte wenig mit dem Sender und viel mit dem Leben zu tun. Als klar war, dass ich nach Oldenburg gehe, war die einzige ernsthafte Frage, wie wir das Studio mitnehmen. Die Antwort: in vier Kisten und einem Kofferraum.</p>
<h2>Was sich ändert</h2>
<p>Für euch: praktisch nichts. Der Stream läuft unter derselben Adresse, der Sendeplan bleibt, die Stimmen bleiben. Was sich ändert, ist die Akustik — der neue Raum ist kleiner und deutlich trockener, was dem Sound guttut.</p>
<h2>Was wir mitgenommen haben</h2>
<p>Das Mischpult aus zweiter Hand, die Absorber, das Mikrofon. Und die Erkenntnis aus dem letzten Studioumbau: erst der Raum, dann die Technik.</p>`,
  },
  {
    slug: "songwunsch-so-funktionierts",
    title: "So kommt dein Songwunsch tatsächlich ins Programm",
    excerpt:
      "Zwischen Discord-Nachricht und Rotation liegen ein paar Schritte. Hier steht, welche — und woran die meisten Wünsche scheitern.",
    categorySlug: "community",
    tags: ["Songwunsch", "Community", "Erklärt"],
    authorName: "Mira Hensel",
    featured: false,
    publishedAt: daysAgo(14),
    content: `<p>Pro Woche erreichen uns mehr Songwünsche, als wir spielen können. Trotzdem landet fast jeder irgendwann im Programm — nur nicht immer da, wo die Absender es erwarten.</p>
<h2>Schritt 1: Der Kanal</h2>
<p>Wünsche gehören in den Discord, nicht in die Direktnachricht. Klingt pedantisch, hat aber einen Grund: Im Kanal sehen alle, was schon gewünscht wurde, und wir müssen nicht dreimal denselben Track suchen.</p>
<h2>Schritt 2: Die Abendsendung</h2>
<p>Jeder Wunsch läuft mindestens einmal in einer Abendsendung. Das ist keine Gnade, sondern der Test: Wie reagiert der Kanal, während er läuft?</p>
<h2>Schritt 3: Die Rotation</h2>
<p>Was abends funktioniert hat und sich auch morgens um sieben nicht falsch anfühlt, kommt in die Rotation. Genau daran scheitern die meisten Wünsche — nicht an der Qualität, sondern an der Tageszeit.</p>
<h2>Der Tipp</h2>
<p>Schreib dazu, warum. Ein Wunsch mit zwei Sätzen Begründung wird bei uns bevorzugt behandelt, weil wir daraus eine Moderation bauen können.</p>`,
  },
  {
    slug: "playlist-herbst-nacht",
    title: "Zehn Tracks für lange Herbstnächte",
    excerpt:
      "Ambient, Slowcore und ruhige Elektronik: die Auswahl, die gerade regelmäßig durch die Volt Nacht läuft.",
    categorySlug: "musik",
    tags: ["Playlist", "Volt Nacht", "Ambient"],
    authorName: "jannikjbi",
    featured: false,
    publishedAt: daysAgo(21),
    content: `<p>Die Volt Nacht hat eine einfache Regel: nichts, was weckt. Was bleibt, ist ein überraschend großes Feld — hier zehn Stücke, die gerade besonders oft laufen.</p>
<h2>Was die Auswahl verbindet</h2>
<p>Alle zehn arbeiten mit Raum statt mit Dichte. Kein Track versucht, die erste Sekunde zu gewinnen. Für Radio ist das eigentlich ein Risiko — nachts ist es genau richtig.</p>
<h2>Der Aufbau einer Nacht</h2>
<p>Wir starten selten mit dem ruhigsten Stück. Die erste halbe Stunde darf noch Kontur haben, danach wird es schrittweise weniger. Gegen zwei Uhr ist fast nichts mehr übrig außer Fläche.</p>
<p>Die komplette Auswahl läuft samstags ab 23 Uhr.</p>`,
  },
  {
    slug: "technik-warum-kein-restream",
    title: "Warum wir den Stream nicht über eigene Server schicken",
    excerpt:
      "Eine technische Entscheidung mit spürbaren Folgen für Stabilität, Latenz und euer Datenvolumen.",
    categorySlug: "technik",
    tags: ["Streaming", "Technik", "Infrastruktur"],
    authorName: "Tobias Reimann",
    featured: false,
    publishedAt: daysAgo(28),
    content: `<p>Eine der häufigsten Fragen aus dem Discord: Warum betreibt VoltFM keinen eigenen Streaming-Server, über den alles läuft?</p>
<h2>Die kurze Antwort</h2>
<p>Weil jede zusätzliche Station auf dem Weg ein zusätzlicher Ort ist, an dem etwas kaputtgehen kann.</p>
<h2>Die längere</h2>
<p>Ein eigener Zwischenserver würde bedeuten: mehr Latenz, mehr Kosten, mehr Wartung — und im Zweifel ein Ausfall, den wir selbst verschuldet haben. Der einzige echte Gewinn wären Statistiken, die wir nicht brauchen.</p>
<h2>Was das für euch heißt</h2>
<p>Die Verbindung ist kürzer und damit stabiler, besonders auf dem Handy. Und wir sehen deutlich weniger über euch, als wir könnten.</p>`,
  },
  {
    slug: "ein-jahr-community-hour",
    title: "Ein Jahr Community Hour: Was wir gelernt haben",
    excerpt:
      "52 Sendungen, unzählige Songwünsche und ein paar Dinge, die wir beim ersten Mal gründlich falsch gemacht haben.",
    categorySlug: "community",
    tags: ["Community Hour", "Rückblick", "Sendung"],
    authorName: "Mira Hensel",
    featured: false,
    publishedAt: daysAgo(35),
    content: `<p>Vor einem Jahr lief die erste Community Hour. Der Plan war eine Stunde, es wurden zweieinhalb, und im Sprachkanal saßen am Ende mehr Leute als zu Beginn.</p>
<h2>Was von Anfang an funktioniert hat</h2>
<p>Die offene Wunschliste. Dass jeder eingereichte Track tatsächlich läuft, hat mehr Vertrauen aufgebaut als jede Ankündigung.</p>
<h2>Was wir geändert haben</h2>
<p>Den Sendeplatz — zweimal. Und die Moderation im Textkanal: allein ist das nicht zu schaffen, seitdem sind wir zu zweit.</p>
<h2>Was bleibt</h2>
<p>Die Erkenntnis, dass eine Sendung nicht daran scheitert, dass zu wenig passiert, sondern daran, dass niemand weiß, wann sie läuft.</p>`,
  },
  {
    slug: "hinter-den-kulissen-studio-umbau",
    title: "Hinter den Kulissen: Wie wir unser Studio neu gebaut haben",
    excerpt:
      "Ein Schreibtisch, zu viele Kabel und ein Mischpult aus zweiter Hand: Ein Werkstattbericht über den Umbau, der den Sound von VoltFM verändert hat.",
    categorySlug: "technik",
    tags: ["Studio", "Technik", "Hinter den Kulissen"],
    authorName: "Tobias Reimann",
    featured: false,
    publishedAt: daysAgo(6),
    content: `<p>Wer VoltFM in den ersten Monaten gehört hat, kennt das Problem: Je nach Sendung klang der Stream mal dumpf, mal zu spitz, und wenn jemand im Nebenzimmer die Tür zuschlug, hörte man das mit. Im August haben wir das Studio deshalb von Grund auf neu aufgebaut.</p>
<h2>Erst der Raum, dann die Technik</h2>
<p>Die wichtigste Erkenntnis vorweg: Das teuerste Mikrofon nützt nichts in einem Raum, der hallt. Wir haben zuerst Absorber an den Erstreflexionspunkten angebracht und den Arbeitsplatz von der Wand weggerückt. Allein das hat mehr gebracht als jedes Upgrade davor.</p>
<h2>Das Signal, Schritt für Schritt</h2>
<p>Unsere Kette ist bewusst schlicht geblieben: ein dynamisches Großmembranmikrofon, ein Mischpult aus zweiter Hand, ein Kompressor mit sehr moderaten Einstellungen. Der Rest passiert in der Software.</p>
<p>Am Ende zählt nicht, wie viele Geräte in einem Rack stecken, sondern ob ihr uns verstehen könnt, ohne die Lautstärke nachzuregeln.</p>`,
  },
  {
    slug: "community-abend-rueckblick",
    title: "500 Leute im Discord: Der Community-Abend in Zahlen",
    excerpt:
      "Songwünsche im Minutentakt, ein spontaner Hörspiel-Versuch und eine Sendung, die zwei Stunden länger lief als geplant.",
    categorySlug: "community",
    tags: ["Community", "Discord", "Rückblick"],
    authorName: "Mira Hensel",
    featured: false,
    publishedAt: daysAgo(11),
    content: `<p>Wir hatten mit einem ruhigen Abend gerechnet. Stattdessen war der Sprachkanal ab der ersten Minute voll, und die Songwünsche liefen schneller ein, als wir sie einsortieren konnten.</p>
<h2>Was funktioniert hat</h2>
<ul><li>Die offene Wunschliste — jede eingereichte Nummer lief tatsächlich.</li><li>Der spontane Hörspiel-Versuch, bei dem sieben Leute aus dem Kanal eine Szene improvisiert haben.</li><li>Die Verlängerung. Zwei Stunden über Plan, und niemand ist gegangen.</li></ul>
<h2>Was wir besser machen</h2>
<p>Die Moderation im Textkanal war zeitweise überfordert. Beim nächsten Mal sind wir zu zweit, und die Wunschliste bekommt ein Zeitfenster statt eines offenen Endes.</p>
<p>Der nächste Community-Abend steht schon im Kalender — Termin und Details findet ihr in unseren Events.</p>`,
  },
  {
    slug: "deutschpop-neuentdeckungen-herbst",
    title: "Fünf deutschsprachige Neuentdeckungen für den Herbst",
    excerpt:
      "Zwischen Deutschpop und Indie: Diese fünf Acts haben es in den letzten Wochen in unsere Rotation geschafft — und warum sie dort bleiben.",
    categorySlug: "musik",
    tags: ["Deutschpop", "Neuentdeckungen", "Rotation"],
    authorName: "Mochiko",
    featured: false,
    publishedAt: daysAgo(4),
    content: `<p>In der Musikredaktion landen pro Woche mehr Einsendungen, als wir spielen können. Fünf davon haben sich diesen Herbst durchgesetzt — nicht weil sie am lautesten waren, sondern weil sie beim dritten Hören noch funktioniert haben.</p>
<h2>Was die fünf verbindet</h2>
<p>Alle arbeiten mit viel Raum. Kein Song versucht, die erste Sekunde zu gewinnen. Das ist für Radio eigentlich ein Risiko — und genau deshalb interessant.</p>
<h2>Wie etwas in die Rotation kommt</h2>
<p>Jeder Vorschlag läuft mindestens einmal in einer Abendsendung, bevor wir über die Rotation entscheiden. Wenn die Reaktionen im Discord stimmen und der Song sich auch morgens um sieben nicht falsch anfühlt, bleibt er.</p>
<p>Ihr habt einen Tipp? Schickt ihn uns über den Discord oder das Kontaktformular.</p>`,
  },
  {
    slug: "warum-webradio-2026",
    title: "Warum wir 2026 immer noch Webradio machen",
    excerpt:
      "Playlists kennen euren Geschmack besser als wir. Trotzdem schalten jeden Tag Menschen ein. Ein Text darüber, was Radio kann, was Algorithmen nicht können.",
    categorySlug: "radio",
    tags: ["Meinung", "Radio", "Community"],
    authorName: "jannikjbi",
    featured: false,
    publishedAt: daysAgo(18),
    content: `<p>Es gibt ein Argument gegen Radio, das schwer zu widerlegen ist: Ein Algorithmus kennt euren Geschmack besser als jede Redaktion. Er weiß, welchen Song ihr übersprungen habt und welchen ihr dreimal hintereinander gehört habt.</p>
<h2>Der Unterschied ist die geteilte Zeit</h2>
<p>Was der Algorithmus nicht kann: dafür sorgen, dass tausend Menschen im selben Moment dasselbe hören. Genau daraus entsteht alles, was uns an VoltFM wichtig ist — die Reaktionen im Discord, das gemeinsame Aufregen über eine Songauswahl, das Gefühl, nicht allein in einer Playlist zu sitzen.</p>
<h2>Und die Fehler</h2>
<p>Dazu gehört auch, dass mal ein Song läuft, den ihr nicht mögt. Eine Redaktion, die sich nicht traut, danebenzuliegen, ist auch nur ein schlechterer Algorithmus.</p>`,
  },
  {
    slug: "voltfm-app-plaene",
    title: "In Arbeit: Was als Nächstes bei VoltFM passiert",
    excerpt:
      "Ein Blick auf die Roadmap: Favoriten, Benachrichtigungen zum Sendungsstart und ein Archiv zum Nachhören.",
    categorySlug: "voltfm",
    tags: ["Roadmap", "Entwicklung"],
    authorName: "jannikjbi",
    featured: false,
    publishedAt: daysAgo(25),
    content: `<p>Die neue Website ist erst der Anfang. Drei Dinge stehen als Nächstes an, und alle drei kommen aus eurem Feedback.</p>
<h2>Favoriten</h2>
<p>Songs, die euch im Stream begegnen, sollt ihr mit einem Klick merken können — inklusive Liste im Profil.</p>
<h2>Benachrichtigungen</h2>
<p>Wer die Community Hour nicht verpassen will, soll sich erinnern lassen können, ohne den Sendeplan im Kopf zu haben.</p>
<h2>Archiv</h2>
<p>Das Größte und Komplizierteste: ausgewählte Sendungen zum Nachhören. Hier klären wir gerade die rechtliche Seite, deshalb gibt es noch keinen Termin.</p>`,
  },
  {
    slug: "stream-technik-erklaert",
    title: "Wie unser Livestream eigentlich bei euch ankommt",
    excerpt:
      "Von der Playlist bis zum Lautsprecher: Der Weg eines Songs durch unseren Sender — verständlich erklärt.",
    categorySlug: "technik",
    tags: ["Streaming", "Erklärt", "Technik"],
    authorName: "Tobias Reimann",
    featured: false,
    publishedAt: daysAgo(31),
    content: `<p>Wenn ihr auf Play drückt, passiert erstaunlich viel in erstaunlich kurzer Zeit. Hier der Weg, Station für Station.</p>
<h2>1. Die Playlist</h2>
<p>Unser Sendeplan liegt bei laut.fm. Dort ist hinterlegt, welche Playlist zu welcher Uhrzeit läuft.</p>
<h2>2. Der Encoder</h2>
<p>Der Song wird in ein Format gepackt, das sich gut über das Netz schicken lässt. Dabei geht Information verloren — die Kunst besteht darin, dass ihr davon nichts merkt.</p>
<h2>3. Der Weg zu euch</h2>
<p>Euer Browser verbindet sich direkt mit dem Stream-Server. Wir schalten uns nicht dazwischen: Das ist schneller, stabiler und schont eure Daten.</p>
<h2>4. Die Metadaten</h2>
<p>Titel, Interpret und Sendung laufen über einen zweiten, unabhängigen Weg. Deshalb kann es passieren, dass die Musik läuft, während die Titelanzeige kurz hängt — und deshalb bricht die Musik nie ab, nur weil die Anzeige es tut.</p>`,
  },
  {
    slug: "gaming-soundtracks-die-bleiben",
    title: "Game-Soundtracks, die auch ohne Spiel funktionieren",
    excerpt:
      "Musik aus Spielen ist oft besser als ihr Ruf. Eine Auswahl an Kompositionen, die wir regelmäßig ins Nachtprogramm nehmen.",
    categorySlug: "gaming",
    tags: ["Gaming", "Soundtrack", "Nachtprogramm"],
    authorName: "Tobias Reimann",
    featured: false,
    publishedAt: daysAgo(40),
    content: `<p>Spielemusik hat eine undankbare Aufgabe: Sie soll wirken, ohne aufzufallen. Genau das macht sie fürs Nachtprogramm so brauchbar.</p>
<h2>Warum das im Radio funktioniert</h2>
<p>Stücke aus Spielen sind darauf ausgelegt, lange zu laufen und sich nicht abzunutzen. Das ist fast eine Definition von guter Nachtmusik.</p>
<h2>Wo es scheitert</h2>
<p>Alles, was an eine konkrete Szene gebunden ist, funktioniert ohne Bild nicht. Kampfmusik ohne Kampf ist einfach nur hektisch.</p>
<p>Hört rein: Die Auswahl läuft regelmäßig bei <em>Pixel &amp; Pegel</em> und in der Volt Nacht.</p>`,
  },
];

/* --- Events -------------------------------------------------------------- */

const events = [
  {
    slug: "community-abend-oktober",
    title: "VoltFM Community-Abend",
    description: "Offener Sprachkanal, offene Wunschliste: Der monatliche Abend, an dem ihr das Programm macht.",
    content: "<p>Ab 19 Uhr öffnen wir den Sprachkanal im Discord. Mira moderiert, eure Songwünsche laufen live, und gegen 21 Uhr entscheidet der Kanal, wie es weitergeht.</p><p>Keine Anmeldung nötig — kommt einfach dazu.</p>",
    startsAt: daysAhead(9),
    endsAt: daysAhead(9),
    location: "VoltFM Discord",
    category: "Community",
    status: "upcoming",
    url: "https://discord.gg/voltfm",
  },
  {
    slug: "volt-nacht-special",
    title: "Volt Nacht: Sechs Stunden Special",
    description: "Eine durchgehende Nachtstrecke ohne Unterbrechung — Ambient, Slowcore und ruhige Elektronik.",
    content: "<p>Einmal im Quartal verlängern wir die Nachtstrecke auf sechs Stunden. Jannik moderiert nur zum Anfang und zum Ende, dazwischen läuft die Musik.</p>",
    startsAt: daysAhead(23),
    endsAt: daysAhead(24),
    location: "Livestream",
    category: "Sendung",
    status: "upcoming",
  },
  {
    slug: "wunschkonzert-jahresende",
    title: "Das große Wunschkonzert",
    description: "Ihr schickt, wir spielen: Vier Stunden ausschließlich Hörerwünsche zum Jahresausklang.",
    content: "<p>Die Wunschliste öffnet zwei Wochen vorher im Discord. Jeder Wunsch mit Begründung wird bevorzugt behandelt.</p>",
    startsAt: daysAhead(52),
    endsAt: daysAhead(52),
    location: "Livestream & Discord",
    category: "Special",
    status: "upcoming",
  },
  {
    slug: "sommerfest-2026",
    title: "VoltFM Sommerfest",
    description: "Das erste Treffen außerhalb des Internets: Community-Abend in Oldenburg mit Live-Sendung vor Ort.",
    content: "<p>Rund vierzig Leute aus dem Discord kamen tatsächlich nach Oldenburg. Die Sendung lief drei Stunden live vom Gelände.</p>",
    startsAt: daysAgo(64),
    endsAt: daysAgo(64),
    location: "Oldenburg",
    category: "Community",
    status: "past",
  },
  {
    slug: "geburtstagssendung",
    title: "Fünf Jahre VoltFM",
    description: "Rückblick auf fünf Jahre Sender — mit Aufnahmen aus der allerersten Sendung.",
    content: "<p>Jannik hat das Archiv durchsucht und die ersten Minuten von 2021 ausgegraben. Es klang deutlich schlechter, als alle in Erinnerung hatten.</p>",
    startsAt: daysAgo(120),
    endsAt: daysAgo(120),
    location: "Livestream",
    category: "Special",
    status: "past",
  },
];

/* --- Upserts ------------------------------------------------------------- */

async function upsertAll<T extends { slug: string }>(
  name: string,
  docs: T[],
  decorate: (doc: T) => Record<string, unknown>,
) {
  const collection = db.collection(name);
  for (const doc of docs) {
    await collection.updateOne(
      { slug: doc.slug },
      { $set: { ...doc, ...decorate(doc), updatedAt: now }, $setOnInsert: { createdAt: now } },
      { upsert: true },
    );
  }
  console.log(`  ${name}: ${docs.length}`);
}

console.log("\nSeeding VoltFM ...");

await upsertAll("categories", categories, () => ({}));
/* Hosts deliberately get NO placeholder photo: a random stock portrait of a
   stranger is worse than an honest blank. They fall back to the Discord avatar
   (when a user ID is set) or the branded placeholder, and real portraits are
   uploaded through the admin. */
await upsertAll("hosts", hosts, () => ({ image: null }));
await upsertAll("shows", shows, () => ({ active: true }));
await upsertAll("articles", articles, (doc) => ({
  status: "published",
  readingTime: readingTime(doc.content),
  coverImage: placeholderImage(doc.slug),
  coverAlt: "",
  seoTitle: doc.title,
  seoDescription: doc.excerpt,
}));
await upsertAll("events", events, (doc) => ({ image: placeholderImage(`event-${doc.slug}`) }));

await db.collection("settings").updateOne(
  { key: "site" },
  {
    $set: {
      key: "site",
      streamUrl: process.env.NEXT_PUBLIC_RADIO_STREAM_URL ?? "https://stream.laut.fm/jannikjbi",
      discordUrl: process.env.NEXT_PUBLIC_DISCORD_URL ?? "https://discord.gg/voltfm",
      updatedAt: now,
    },
  },
  { upsert: true },
);

/* Indexes mirror src/db/collections.ts — created here so a fresh database is
   fully set up by a single `npm run seed`. */
await Promise.all([
  db.collection("articles").createIndex({ slug: 1 }, { unique: true }),
  db.collection("articles").createIndex({ status: 1, publishedAt: -1 }),
  db.collection("articles").createIndex({ categorySlug: 1, status: 1, publishedAt: -1 }),
  db.collection("articles").createIndex({ tags: 1 }),
  db.collection("articles").createIndex(
    { title: "text", excerpt: "text", tags: "text" },
    { name: "article_search", weights: { title: 10, excerpt: 4, tags: 2 } },
  ),
  db.collection("categories").createIndex({ slug: 1 }, { unique: true }),
  db.collection("hosts").createIndex({ slug: 1 }, { unique: true }),
  db.collection("shows").createIndex({ slug: 1 }, { unique: true }),
  db.collection("events").createIndex({ slug: 1 }, { unique: true }),
  db.collection("events").createIndex({ startsAt: -1 }),
]);

console.log("  Indexes angelegt.");
console.log("Fertig.\n");

await client.close();
