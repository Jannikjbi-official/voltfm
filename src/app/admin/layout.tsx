import Link from "next/link";
import { requireAdmin, can, effectiveRoleLabel, type Resource } from "@/lib/session";
import { features } from "@/lib/site";
import { Icon, DashboardIcon, NewsIcon, TagIcon, EventsIcon, MicIcon, CalendarIcon, ImageIcon, UserIcon, SettingsIcon, RadioIcon, ClockIcon } from "@/lib/icons";
import styles from "./layout.module.css";

/**
 * Jeder Bereich nennt die Faehigkeit, die er braucht. Fehlt sie, taucht der
 * Punkt gar nicht erst auf — und die Seite dahinter prueft es noch einmal
 * selbst, denn ein ausgeblendeter Link ist kein Schutz.
 */
const ADMIN_NAV: {
  href: string;
  label: string;
  icon: typeof DashboardIcon;
  needs?: { resource: Resource; actions: string[] };
  /** Zeigt an, dass der Bereich oeffentlich nicht sichtbar ist. */
  off?: boolean;
}[] = [
  { href: "/admin", label: "Übersicht", icon: DashboardIcon },
  { href: "/admin/news", label: "News", icon: NewsIcon, needs: { resource: "article", actions: ["update"] } },
  { href: "/admin/categories", label: "Kategorien", icon: TagIcon, needs: { resource: "category", actions: ["update"] } },
  { href: "/admin/events", label: "Events", icon: EventsIcon, needs: { resource: "event", actions: ["update"] } },
  { href: "/admin/moderatoren", label: "Moderatoren", icon: MicIcon, needs: { resource: "host", actions: ["update"] } },
  {
    href: "/admin/programm",
    label: "Programm",
    icon: CalendarIcon,
    needs: { resource: "show", actions: ["update"] },
    // Bleibt erreichbar, ist aber oeffentlich abgeschaltet.
    off: !features.schedule,
  },
  { href: "/admin/radio", label: "Radio", icon: RadioIcon, needs: { resource: "settings", actions: ["read"] } },
  { href: "/admin/timeline", label: "Zeitleiste", icon: ClockIcon, needs: { resource: "timeline", actions: ["update"] } },
  { href: "/admin/media", label: "Medien", icon: ImageIcon, needs: { resource: "media", actions: ["upload"] } },
  { href: "/admin/users", label: "Benutzer", icon: UserIcon, needs: { resource: "user", actions: ["list"] } },
  { href: "/admin/settings", label: "Einstellungen", icon: SettingsIcon, needs: { resource: "settings", actions: ["update"] } },
];

/**
 * The admin gate.
 *
 * This runs on the server for every request to any /admin route, including
 * nested ones. Hiding the admin link in the header is a convenience, never the
 * protection — this check is. Server actions and admin API routes re-check
 * independently, because a layout does not guard a POST.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  const profile = user as typeof user & { username?: string | null; role?: string | null };

  const nav = ADMIN_NAV.filter(
    (item) => !item.needs || can(user, item.needs.resource, item.needs.actions as never),
  );

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHead}>
          <span className={styles.badge}>Admin</span>
          <span className={styles.who}>
            {profile.name || profile.username}
            <span className={styles.role}>{effectiveRoleLabel(user)}</span>
          </span>
        </div>

        <nav className={styles.nav} aria-label="Admin-Navigation">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className={styles.navLink}>
              <Icon icon={item.icon} className={styles.navIcon} />
              {item.label}
              {item.off && <span className={styles.navOff}>aus</span>}
            </Link>
          ))}
        </nav>

        <Link href="/" className={styles.backLink}>
          ← Zur Website
        </Link>
      </aside>

      <main className={styles.content}>{children}</main>
    </div>
  );
}
