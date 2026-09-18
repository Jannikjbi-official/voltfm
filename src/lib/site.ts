/**
 * Static station identity + navigation. Everything that is not editable in the
 * CMS and not secret lives here so pages never hardcode strings.
 */

export const site = {
  name: "VoltFM",
  tagline: "Dein Sound. Deine Community. Dein Radio.",
  description:
    "VoltFM ist ein unabhängiges Webradio mit eigener Community: 24/7 Musik, feste Sendungen, Moderatorinnen und Moderatoren zum Anfassen, News und Events.",
  locale: "de_DE",
  lang: "de",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  discordUrl: process.env.NEXT_PUBLIC_DISCORD_URL ?? "https://discord.gg/voltfm",
  streamUrl:
    process.env.NEXT_PUBLIC_RADIO_STREAM_URL ?? "https://stream.laut.fm/jannikjbi",
  contactEmail: "Kontakt@voltfm.xyz",
  /** laut.fm station slug — drives every metadata endpoint. */
  station: process.env.NEXT_PUBLIC_RADIO_STATION ?? "jannikjbi",
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
