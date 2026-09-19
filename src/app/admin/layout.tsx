import Link from "next/link";
import { requireAdmin } from "@/lib/session";
import { Icon, DashboardIcon, NewsIcon, TagIcon, EventsIcon, MicIcon, CalendarIcon, ImageIcon, UserIcon, SettingsIcon, RadioIcon, ClockIcon } from "@/lib/icons";
import styles from "./layout.module.css";

const ADMIN_NAV = [
  { href: "/admin", label: "Übersicht", icon: DashboardIcon },
  { href: "/admin/news", label: "News", icon: NewsIcon },
  { href: "/admin/categories", label: "Kategorien", icon: TagIcon },
  { href: "/admin/events", label: "Events", icon: EventsIcon },
  { href: "/admin/moderatoren", label: "Moderatoren", icon: MicIcon },
  { href: "/admin/programm", label: "Programm", icon: CalendarIcon },
  { href: "/admin/radio", label: "Radio", icon: RadioIcon },
  { href: "/admin/timeline", label: "Zeitleiste", icon: ClockIcon },
  { href: "/admin/media", label: "Medien", icon: ImageIcon },
  { href: "/admin/users", label: "Benutzer", icon: UserIcon },
  { href: "/admin/settings", label: "Einstellungen", icon: SettingsIcon },
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

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHead}>
          <span className={styles.badge}>Admin</span>
          <span className={styles.who}>
            {profile.name || profile.username}
            <span className={styles.role}>{profile.role || "admin"}</span>
          </span>
        </div>

        <nav className={styles.nav} aria-label="Admin-Navigation">
          {ADMIN_NAV.map((item) => (
            <Link key={item.href} href={item.href} className={styles.navLink}>
              <Icon icon={item.icon} className={styles.navIcon} />
              {item.label}
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
