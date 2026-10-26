import { getRadioAidSchedule } from "@/lib/radioaid";

/**
 * Static station identity + navigation. Everything that is not editable in the
 * CMS and not secret lives here so pages never hardcode strings.
 */

/**
 * Die eine Adresse, die erreichbar ist. Bewusst ausserhalb der eigenen Domain,
 * weil deren Mailserver ausgefallen ist.
 */
const operatorEmail = "Jannikjbi@proton.me";

export const site = {
  name: "VoltFM",
  tagline: "Dein Sound. Deine Community. Dein Radio.",
  description:
    "VoltFM ist ein kleines Webradio aus Hamburg. Seit 2021 rund um die Uhr Charts, Pop und Deutschrap über laut.fm, dazu News, Events und ein Discord.",
  /**
   * Was tatsaechlich laeuft. Steht bewusst hier und nicht aus der laut.fm-API:
   * Deren Genreliste ist fest vorgegeben, und was dort hinterlegt ist, hat mit
   * dem Programm schon einmal nicht uebereingestimmt (Schlager, Rock, Pop).
   */
  genres: ["Charts", "Pop", "Deutschrap"],
  /** Seit wann es die Station gibt — damals noch unter dem Namen jannikjbi. */
  foundedYear: 2021,
  locale: "de_DE",
  lang: "de",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  /**
   * The public domain, independent of the environment.
   *
   * `url` above points at whatever host the app currently runs on — localhost
   * in development, a preview host on Vercel. The Impressum has to name the
   * actual online offering, so it uses this instead.
   */
  canonicalUrl: "https://voltfm.xyz",
  discordUrl: process.env.NEXT_PUBLIC_DISCORD_URL ?? "https://discord.gg/6JzSsUTWuh",
  /** Nur verlinkt, nichts eingebettet — es laedt also nichts von Meta. */
  instagramUrl: "https://www.instagram.com/voltfm_radio/",
  streamUrl:
    process.env.NEXT_PUBLIC_RADIO_STREAM_URL ?? "https://stream.laut.fm/jannikjbi",
  /**
   * Die erreichbare Kontaktadresse. § 5 DDG verlangt die Angabe einer
   * E-Mail-Adresse, und sie muss tatsaechlich funktionieren — deshalb steht
   * hier die Proton-Adresse und nicht eine auf der eigenen Domain.
   */
  contactEmail: operatorEmail,
  /**
   * Die Adressen auf der eigenen Domain. Der Mailserver dahinter ist komplett
   * ausgefallen, keine davon empfaengt derzeit Nachrichten.
   */
  stationEmail: "Kontakt@voltfm.xyz",
  legacyEmail: "admin@jannikjbi.de",
  /**
   * Solange das true ist, darf keine Stelle im UI eine @voltfm.xyz- oder
   * @jannikjbi.de-Adresse als funktionierenden Weg anbieten. Erreichbar sind
   * `contactEmail` und der Discord.
   */
  mailOutage: true,
  /**
   * Ist das Kontaktformular aktiv?
   *
   * Nein: Anfragen laufen ueber ein Ticket im Discord. Dort sieht sie das
   * ganze Team, es kann direkt jemand antworten, und es geht nichts unter,
   * weil niemand in die Datenbank schaut. Die Server Action lehnt Einsendungen
   * ebenfalls ab, solange das hier false ist — ein ausgeblendetes Formular
   * haelt einen direkten POST nicht auf.
   */
  contactFormEnabled: false,
  /** Wo im Discord das Ticket aufgemacht wird. */
  supportChannelHint: "Kanal #ticket-erstellen",
  /** Bewerbungsportal: dort werden offene Stellen ausgeschrieben. */
  applyUrl: "https://dash.pwr.lol/website/1549922141003190324",
  /** laut.fm station slug — drives every metadata endpoint. */
  station: process.env.NEXT_PUBLIC_RADIO_STATION ?? "jannikjbi",
} as const;

const station = process.env.NEXT_PUBLIC_RADIO_STATION ?? "jannikjbi";

/**
 * How VoltFM is allowed to play its own stream.
 *
 * laut.fm's Nutzungsbedingungen § 6 Abs. 9 forbid embedding their audio streams
 * on third-party sites and explicitly allow linking, provided the click leads
 * away to laut.fm or opens it in a separate window. So on-site playback stays
 * OFF and the play button is a link-out.
 *
 * The embedded player is not deleted, it is switched off: as soon as VoltFM
 * streams from a provider whose licence covers on-site playback, set
 * NEXT_PUBLIC_RADIO_EMBED=true and NEXT_PUBLIC_RADIO_STREAM_URL, and the full
 * player (including the consent gate) comes back.
 */
/**
 * Funktionen, die bewusst abgeschaltet sind.
 *
 * Der Sendeplan liegt still, bis VoltFM einen eigenen Sendeserver hat. Erst
 * dann lassen sich Sendeplaetze verlaesslich zusagen und Dinge wie Songwuensche
 * anbieten — solange das Programm bei laut.fm als eine durchlaufende Playlist
 * liegt, waere ein Sendeplan ein Versprechen, das der Sender nicht halten kann.
 *
 * Zum Wiedereinschalten: hier auf true setzen. Die Seite, der Menuepunkt und
 * die Verweise darauf kommen dann von selbst zurueck.
 */
export const features = {
  schedule: false,
} as const;

export const radio = {
  embedAllowed: process.env.NEXT_PUBLIC_RADIO_EMBED === "true",
  /**
   * Wohin "hören" fuehrt, solange nicht eingebettet wird: der Webplayer von
   * lautstation.de, in einem neuen Fenster. Entscheidung des Betreibers vom
   * 25.10.2026 — vorher war es laut.fm selbst. Eingebettet wird weiterhin
   * nichts; der Player laeuft auf lautstation.de, nicht auf voltfm.xyz.
   */
  externalUrl: `https://lautstation.de/?webplayer=${station}`,
  /** Wer die Seite hinter `externalUrl` betreibt — fuer Hinweis und Datenschutz. */
  externalName: "lautstation.de",
  externalPrivacyUrl: "https://lautstation.de/?mode=datenschutz",
  /** Von dort kommt der Stream selbst. */
  providerName: "laut.fm",
  providerTermsUrl: "https://laut.fm/pages/terms_and_conditions",
  providerPrivacyUrl: "https://laut.fm/pages/privacy",
} as const;

/**
 * Anbieterkennzeichnung. § 5 DDG requires a name and a deliverable postal
 * address, and § 18 Abs. 2 MStV a person responsible for editorial content —
 * so this is legally required data, not decoration.
 */
export const operator = {
  name: "Jannik Bolting",
  street: "Burenkamp 16",
  postalCode: "26127",
  city: "Oldenburg (Oldb)",
  country: "Deutschland",
  email: operatorEmail,
} as const;

export type NavItem = {
  href: string;
  label: string;
  /** Short description used in the mobile drawer and the mega menu. */
  hint?: string;
  /**
   * Nur zeitweise sichtbar. Wer das setzt, wird von `buildMainNav()` gefiltert
   * — der Eintrag darf also nie ungefiltert gerendert werden.
   */
  seasonal?: boolean;
  /** Haengt an einem Schalter aus `features`. */
  feature?: keyof typeof features;
};

/**
 * Wie viele Eintraege in der Desktop-Leiste direkt stehen. Alles darueber
 * wandert in ein Menue "Mehr", damit die Leiste nicht umbricht.
 */
export const MAX_VISIBLE_NAV_ITEMS = 7;

export const mainNav: NavItem[] = [
  { href: "/", label: "Start" },
  { href: "/radio", label: "Radio", hint: "Live hören, Now Playing und Stream-Infos" },
  { href: "/programm", label: "Programm", hint: "Sendeplan für heute und die ganze Woche", feature: "schedule" },
  { href: "/moderatoren", label: "Moderatoren", hint: "Die Stimmen hinter VoltFM" },
  { href: "/news", label: "News", hint: "Aktuelles aus Musik, Radio und Community" },
  { href: "/events", label: "Events", hint: "Livestreams, Specials und Community-Termine" },
  /* Wird nur rund um die Sendung eingeblendet — siehe buildMainNav(). */
  { href: "/radioaid", label: "RadioAid", hint: "24 Stunden Charity-Radio", seasonal: true },
  { href: "/community", label: "Community", hint: "Discord, Social Media und Mitmachen" },
  { href: "/ueber-uns", label: "Über VoltFM", hint: "Geschichte, Team und Mission" },
  { href: "/mitmachen", label: "Mitmachen", hint: "Moderieren, schreiben oder einfach dabei sein" },
  { href: "/faq", label: "Häufige Fragen", hint: "Antworten auf das, was am meisten gefragt wird" },
  { href: "/presse", label: "Presse", hint: "Kurzprofil, Zahlen und Logo" },
];

export const footerNav: { title: string; items: NavItem[] }[] = [
  {
    title: "Hören",
    items: [
      { href: "/radio", label: "Livestream" },
      ...(features.schedule ? [{ href: "/programm", label: "Sendeplan" }] : []),
      { href: "/moderatoren", label: "Moderatoren" },
    ],
  },
  {
    title: "Entdecken",
    items: [
      { href: "/news", label: "News" },
      { href: "/events", label: "Events" },
      { href: "/radioaid", label: "RadioAid" },
      { href: "/suche", label: "Suche" },
    ],
  },
  {
    title: "VoltFM",
    items: [
      { href: "/ueber-uns", label: "Über uns" },
      { href: "/mitmachen", label: "Mitmachen" },
      { href: "/faq", label: "Häufige Fragen" },
      { href: "/community", label: "Community" },
      { href: "/presse", label: "Presse" },
      { href: "/kontakt", label: "Kontakt" },
    ],
  },
];

/**
 * Die Hauptnavigation fuer den aktuellen Zeitpunkt.
 *
 * Zeitabhaengige Eintraege (`seasonal`) werden hier herausgefiltert. Der
 * Aufruf gehoert in eine Server-Komponente: Wuerde der Browser filtern, haetten
 * Server- und Client-Markup unterschiedliche Eintraege und das Hydrieren
 * schluege fehl.
 */
export function buildMainNav(now: Date = new Date()): NavItem[] {
  return mainNav.filter((item) => {
    if (item.feature && !features[item.feature]) return false;
    if (!item.seasonal) return true;
    if (item.href === "/radioaid") return getRadioAidSchedule(now).showInNav;
    return true;
  });
}

/**
 * Teilt die Navigation in die sichtbare Leiste und das Menue "Mehr".
 *
 * Das Menue lohnt sich erst ab zwei ausgelagerten Eintraegen. Bliebe nur einer
 * uebrig, waere "Mehr" genauso breit wie der Eintrag selbst — man klickt dann
 * auf einen Knopf, um genau einen Punkt zu sehen. In dem Fall passt alles in
 * die Leiste.
 */
export function splitNav(items: NavItem[]): { primary: NavItem[]; overflow: NavItem[] } {
  const overflow = items.slice(MAX_VISIBLE_NAV_ITEMS);
  if (overflow.length < 2) return { primary: items, overflow: [] };
  return { primary: items.slice(0, MAX_VISIBLE_NAV_ITEMS), overflow };
}
