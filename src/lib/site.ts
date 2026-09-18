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
    "VoltFM ist ein unabhängiges Webradio mit eigener Community: 24/7 Musik, feste Sendungen, Moderatorinnen und Moderatoren zum Anfassen, News und Events.",
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
export const radio = {
  embedAllowed: process.env.NEXT_PUBLIC_RADIO_EMBED === "true",
  /** Where "hören" sends listeners while embedding is off. */
  externalUrl: `https://laut.fm/${station}`,
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
};

export const mainNav: NavItem[] = [
  { href: "/", label: "Start" },
  { href: "/radio", label: "Radio", hint: "Live hören, Now Playing und Stream-Infos" },
  { href: "/programm", label: "Programm", hint: "Sendeplan für heute und die ganze Woche" },
  { href: "/moderatoren", label: "Moderatoren", hint: "Die Stimmen hinter VoltFM" },
  { href: "/news", label: "News", hint: "Aktuelles aus Musik, Radio und Community" },
  { href: "/events", label: "Events", hint: "Livestreams, Specials und Community-Termine" },
  { href: "/community", label: "Community", hint: "Discord, Social Media und Mitmachen" },
  { href: "/ueber-uns", label: "Über VoltFM", hint: "Geschichte, Team und Mission" },
];

export const footerNav: { title: string; items: NavItem[] }[] = [
  {
    title: "Hören",
    items: [
      { href: "/radio", label: "Livestream" },
      { href: "/programm", label: "Sendeplan" },
      { href: "/moderatoren", label: "Moderatoren" },
    ],
  },
  {
    title: "Entdecken",
    items: [
      { href: "/news", label: "News" },
      { href: "/events", label: "Events" },
      { href: "/suche", label: "Suche" },
    ],
  },
  {
    title: "VoltFM",
    items: [
      { href: "/ueber-uns", label: "Über uns" },
      { href: "/community", label: "Community" },
      { href: "/kontakt", label: "Kontakt" },
    ],
  },
];
