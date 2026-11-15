import type { Resource } from "@/lib/session";
import {
  DashboardIcon,
  NewsIcon,
  TagIcon,
  EventsIcon,
  MicIcon,
  CalendarIcon,
  ImageIcon,
  UserIcon,
  SettingsIcon,
  RadioIcon,
  ClockIcon,
  EditIcon,
  type IconDefinition,
} from "@/lib/icons";

type Needs = { resource: Resource; actions: string[] };

export interface AdminNavEntry {
  href: string;
  label: string;
  icon: IconDefinition;
  needs?: Needs;
  /** Bereich ist oeffentlich abgeschaltet, bleibt aber bearbeitbar. */
  off?: boolean;
}

export interface AdminNavGroup {
  label: string;
  items: AdminNavEntry[];
}

/**
 * Die Navigation des Admin, in Gruppen.
 *
 * Jeder Bereich nennt die Faehigkeit, die er braucht. Fehlt sie, taucht der
 * Punkt gar nicht erst auf — und die Seite dahinter prueft es noch einmal
 * selbst, denn ein ausgeblendeter Link ist kein Schutz.
 */
export function adminNav(scheduleOn: boolean): AdminNavGroup[] {
  return [
    {
      label: "Redaktion",
      items: [
        { href: "/admin/news", label: "News", icon: NewsIcon, needs: { resource: "article", actions: ["update"] } },
        { href: "/admin/categories", label: "Kategorien", icon: TagIcon, needs: { resource: "category", actions: ["update"] } },
        { href: "/admin/events", label: "Events", icon: EventsIcon, needs: { resource: "event", actions: ["update"] } },
        { href: "/admin/timeline", label: "Zeitleiste", icon: ClockIcon, needs: { resource: "timeline", actions: ["update"] } },
        { href: "/admin/media", label: "Medien", icon: ImageIcon, needs: { resource: "media", actions: ["upload"] } },
        { href: "/admin/markdown", label: "Textformat", icon: EditIcon, needs: { resource: "article", actions: ["update"] } },
      ],
    },
    {
      label: "Sender",
      items: [
        { href: "/admin/moderatoren", label: "Moderatoren", icon: MicIcon, needs: { resource: "host", actions: ["update"] } },
        {
          href: "/admin/programm",
          label: "Programm",
          icon: CalendarIcon,
          needs: { resource: "show", actions: ["update"] },
          off: !scheduleOn,
        },
        { href: "/admin/radio", label: "Radio", icon: RadioIcon, needs: { resource: "settings", actions: ["read"] } },
      ],
    },
    {
      label: "Verwaltung",
      items: [
        { href: "/admin/users", label: "Benutzer", icon: UserIcon, needs: { resource: "user", actions: ["list"] } },
        { href: "/admin/settings", label: "Einstellungen", icon: SettingsIcon, needs: { resource: "settings", actions: ["update"] } },
      ],
    },
  ];
}

export const OVERVIEW: AdminNavEntry = { href: "/admin", label: "Übersicht", icon: DashboardIcon };

/** Schnell anlegen — oben rechts und in der Befehlspalette. */
export const QUICK_CREATE: (AdminNavEntry & { needs: Needs })[] = [
  { href: "/admin/news/new", label: "Neuer Artikel", icon: NewsIcon, needs: { resource: "article", actions: ["update"] } },
  { href: "/admin/events?neu=1", label: "Event anlegen", icon: EventsIcon, needs: { resource: "event", actions: ["update"] } },
  { href: "/admin/categories?neu=1", label: "Kategorie anlegen", icon: TagIcon, needs: { resource: "category", actions: ["update"] } },
  { href: "/admin/moderatoren?neu=1", label: "Moderator anlegen", icon: MicIcon, needs: { resource: "host", actions: ["update"] } },
  { href: "/admin/timeline?neu=1", label: "Eintrag anlegen", icon: ClockIcon, needs: { resource: "timeline", actions: ["update"] } },
];
