"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Avatar, Breadcrumbs, Button, Drawer, Dropdown, Label, cn } from "@heroui/react";
import { LogoIcon } from "@/components/layout/logo";
import { useTheme } from "@/components/layout/theme-provider";
import { authClient } from "@/lib/auth-client";
import {
  Icon,
  MenuIcon,
  SearchIcon,
  PlusIcon,
  HomeIcon,
  SunIcon,
  MoonIcon,
  LogoutIcon,
  SettingsIcon,
  ChevronDownIcon,
  type IconDefinition,
} from "@/lib/icons";
import { CommandPalette, type PaletteEntry } from "./command-palette";

export interface ShellEntry {
  href: string;
  label: string;
  icon: IconDefinition;
  off?: boolean;
}

export interface ShellGroup {
  label: string;
  items: ShellEntry[];
}

/** "/admin" passt nur genau, alles andere auch auf Unterseiten. */
function isActive(pathname: string, href: string): boolean {
  const path = href.split("?")[0];
  return path === "/admin" ? pathname === "/admin" : pathname === path || pathname.startsWith(`${path}/`);
}

/**
 * Das Admin als eigene App.
 *
 * Ein Arbeitsplatz am Geraet: links eine feste Seitenleiste als Platte, die
 * Bereiche als Tastenreihen in Mulden (die aktive Taste ist gelb), oben ein
 * schmaler Streifen mit Brotkrumen, Uhr-Display und "Neu". Am Handy oeffnet sich die
 * Seitenleiste als Drawer. Strg+K bzw. ⌘K oeffnet die Befehlspalette.
 *
 * Was hier angezeigt wird, hat der Server schon nach Rechten gefiltert —
 * und jede Seite und jede Action prueft noch einmal selbst.
 */
export function AdminShell({
  overview,
  groups,
  quick,
  user,
  children,
}: {
  overview: ShellEntry;
  groups: ShellGroup[];
  quick: ShellEntry[];
  user: { name: string; role: string; image?: string | null };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  /* Strg+K / ⌘K von ueberall. */
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function signOut() {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  const all = useMemo(() => [overview, ...groups.flatMap((group) => group.items)], [overview, groups]);
  const current = all.filter((entry) => isActive(pathname, entry.href)).sort((a, b) => b.href.length - a.href.length)[0];

  /* Brotkrumen: Admin › Bereich › Unterseite. */
  const crumbs: { label: string; href?: string }[] = [{ label: "Admin", href: "/admin" }];
  if (current && current.href !== "/admin") crumbs.push({ label: current.label, href: current.href });
  if (pathname === "/admin/news/new") crumbs.push({ label: "Neuer Artikel" });
  else if (/^\/admin\/news\/[^/]+$/.test(pathname)) crumbs.push({ label: "Bearbeiten" });

  const paletteEntries: PaletteEntry[] = [
    ...all.map((entry) => ({ id: `nav-${entry.href}`, label: entry.label, group: "Bereiche", icon: entry.icon, href: entry.href })),
    ...quick.map((entry) => ({ id: `new-${entry.href}`, label: entry.label, group: "Anlegen", icon: entry.icon, href: entry.href, keywords: "neu anlegen" })),
    { id: "site", label: "Zur Website", group: "Allgemein", icon: HomeIcon, href: "/" },
    { id: "konto", label: "Kontoeinstellungen", group: "Allgemein", icon: SettingsIcon, href: "/konto" },
    {
      id: "theme",
      label: theme === "dark" ? "Helles Design" : "Dunkles Design",
      group: "Allgemein",
      icon: theme === "dark" ? SunIcon : MoonIcon,
      run: toggleTheme,
      keywords: "design theme hell dunkel",
    },
  ];

  const sidebar = (onNavigate?: () => void) => (
    <div className="flex h-full flex-col">
      <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-separator px-4">
        <Link
          href="/admin"
          onClick={onNavigate}
          className="flex items-center gap-2 rounded-[var(--radius)]"
          aria-label="Admin-Übersicht"
        >
          <LogoIcon className="h-6 w-auto" />
          <span className="font-wide text-[1.05rem] font-extrabold text-foreground">VoltFM</span>
        </Link>
        <span className="rounded-[3px] bg-volt px-1.5 py-0.5 font-mono text-[0.68rem] font-semibold text-graphite lowercase">
          Admin
        </span>
      </div>

      {/* Die Suche ist ein kleines Display: Strg+K bzw. ⌘K oeffnet die Palette. */}
      <div className="px-3 pt-3">
        <button
          type="button"
          onClick={() => {
            onNavigate?.();
            setPaletteOpen(true);
          }}
          className="display-panel group flex h-10 w-full items-center gap-2.5 rounded-[var(--radius)] px-3 text-sm text-display-muted transition-colors hover:text-display-foreground"
        >
          <Icon icon={SearchIcon} className="text-xs text-volt" />
          <span className="flex-1 text-left font-mono text-[0.8rem] lowercase">Suchen</span>
          <kbd className="rounded-[3px] border border-display-muted/40 px-1.5 py-px font-mono text-[0.65rem] text-display-muted">
            ⌘K
          </kbd>
        </button>
      </div>

      <nav aria-label="Admin" className="mt-3 flex-1 overflow-y-auto px-3 pb-4">
        {/* Jede Gruppe ist eine Tastenreihe in einer Mulde; die aktive Taste ist gelb. */}
        <div className="well rounded-[var(--radius)] p-1 pb-1.5">
          <NavItem entry={overview} active={isActive(pathname, overview.href)} onNavigate={onNavigate} />
        </div>
        {groups.map((group) => (
          <div key={group.label} className="mt-3">
            <p className="px-1 pb-1.5 font-meta text-muted">{group.label}</p>
            <ul className="well flex flex-col gap-0.5 rounded-[var(--radius)] p-1 pb-1.5">
              {group.items.map((entry) => (
                <li key={entry.href}>
                  <NavItem entry={entry} active={isActive(pathname, entry.href)} onNavigate={onNavigate} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-separator p-2">
        <Link
          href="/"
          onClick={onNavigate}
          className="mb-1 flex h-9 items-center gap-3 rounded-[var(--radius)] px-3 text-sm text-muted transition-colors hover:bg-surface-secondary hover:text-foreground"
        >
          <Icon icon={HomeIcon} className="w-4 text-xs" />
          Zur Website
        </Link>
        <UserMenu user={user} theme={theme} onToggleTheme={toggleTheme} onSignOut={signOut} />
      </div>
    </div>
  );

  return (
    <div data-admin-shell className="min-h-dvh bg-background lg:grid lg:grid-cols-[16.5rem_minmax(0,1fr)]">
      {/* Die Seitenleiste ist eine eigene Platte im Gehaeuse, mit einer Fuge rundum. */}
      <aside className="sticky top-0 hidden h-dvh py-2 pl-2 lg:block">
        <div className="surface-card h-full overflow-hidden rounded-[var(--radius)]">{sidebar()}</div>
      </aside>

      <div className="flex min-w-0 flex-col">
        {/* Die Kopfleiste: ein schmaler Streifen ueber dem Arbeitsbereich. */}
        <div className="sticky top-0 z-30 bg-background px-2 pt-2">
          <header className="surface-card flex h-14 items-center gap-2 rounded-[var(--radius)] px-2 sm:gap-3 sm:px-3">
            <Button
              variant="ghost"
              size="sm"
              isIconOnly
              className="lg:hidden"
              aria-label="Navigation öffnen"
              onPress={() => setDrawerOpen(true)}
            >
              <Icon icon={MenuIcon} />
            </Button>

            <Breadcrumbs aria-label="Brotkrumen" className="min-w-0 flex-1 text-sm">
              {crumbs.map((crumb, index) => (
                <Breadcrumbs.Item
                  key={`${crumb.label}-${index}`}
                  href={index === crumbs.length - 1 ? undefined : crumb.href}
                  className={
                    index === crumbs.length - 1 ? "min-w-0 truncate font-wide font-bold text-foreground" : "font-meta"
                  }
                >
                  {crumb.label}
                </Breadcrumbs.Item>
              ))}
            </Breadcrumbs>

            <StationClock />

            <Button
              variant="ghost"
              size="sm"
              isIconOnly
              className="sm:hidden"
              aria-label="Suchen"
              onPress={() => setPaletteOpen(true)}
            >
              <Icon icon={SearchIcon} />
            </Button>

            {quick.length > 0 && (
              <Dropdown>
                <Button size="sm" variant="primary" aria-label="Neu anlegen">
                  <Icon icon={PlusIcon} />
                  <span className="hidden sm:inline">Neu</span>
                </Button>
                <Dropdown.Popover placement="bottom end" className="min-w-52">
                  <Dropdown.Menu aria-label="Neu anlegen">
                    {quick.map((entry) => (
                      <Dropdown.Item key={entry.href} id={entry.href} href={entry.href} textValue={entry.label}>
                        <Icon icon={entry.icon} className="w-4 text-xs text-muted" />
                        <Label>{entry.label}</Label>
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown.Popover>
              </Dropdown>
            )}
          </header>
        </div>

        <main id="main" className="flex-1 px-3 pt-6 pb-16 sm:px-5 lg:px-8 lg:pt-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>

      <Drawer.Backdrop isOpen={drawerOpen} onOpenChange={setDrawerOpen}>
        <Drawer.Content placement="left">
          <Drawer.Dialog
            aria-label="Admin-Navigation"
            className="h-full w-[min(18rem,86vw)] bg-surface p-0 sm:w-[min(18rem,86vw)]"
          >
            <Drawer.CloseTrigger aria-label="Navigation schließen" className="top-2.5 right-2.5" />
            {sidebar(() => setDrawerOpen(false))}
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} entries={paletteEntries} />
    </div>
  );
}

/**
 * Kleines Display mit der Senderzeit, wie in der Kopfzeile der Website. Die
 * Uhr kennt nur der Browser — bis zum Hydrieren steht dort "--:--".
 */
function StationClock() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const format = () =>
      new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Berlin" });
    // Erst nach dem Hydrieren stellen — und nicht synchron im Effekt.
    const first = setTimeout(() => setTime(format()), 0);
    const timer = setInterval(() => setTime(format()), 15_000);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, []);

  return (
    <span
      className="display-panel hidden h-9 items-center gap-2 rounded-[var(--radius)] px-3 sm:inline-flex"
      aria-hidden="true"
    >
      <span className="led" />
      <span className="font-dot text-[1.05rem] leading-none text-volt">{time ?? "--:--"}</span>
    </span>
  );
}

function NavItem({
  entry,
  active,
  onNavigate,
}: {
  entry: ShellEntry;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={entry.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex h-8 items-center gap-3 rounded-[calc(var(--radius)-2px)] px-2.5 font-wide text-[0.9rem] font-semibold transition-colors",
        active ? "key bg-volt text-graphite" : "text-muted hover:bg-surface hover:text-foreground",
      )}
    >
      <Icon
        icon={entry.icon}
        className={cn("w-4 text-xs", active ? "text-graphite" : "text-muted group-hover:text-foreground")}
      />
      <span className="flex-1 truncate">{entry.label}</span>
      {entry.off && (
        <span
          className={cn(
            "rounded-[3px] px-1.5 py-px font-mono text-[0.65rem] font-medium lowercase",
            active ? "bg-graphite/15 text-graphite" : "bg-default text-muted",
          )}
        >
          aus
        </span>
      )}
    </Link>
  );
}

function UserMenu({
  user,
  theme,
  onToggleTheme,
  onSignOut,
}: {
  user: { name: string; role: string; image?: string | null };
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onSignOut: () => void;
}) {
  return (
    <Dropdown>
      <Button
        variant="ghost"
        className="h-auto w-full justify-start gap-3 rounded-[var(--radius)] px-2 py-2 text-left shadow-none"
        aria-label="Konto-Menü öffnen"
      >
        <Avatar size="sm" className="size-8 shrink-0">
          {user.image && <Avatar.Image src={user.image} alt="" />}
          <Avatar.Fallback className="bg-volt font-mono text-xs font-bold text-graphite">
            {user.name.slice(0, 2).toUpperCase()}
          </Avatar.Fallback>
        </Avatar>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-foreground">{user.name}</span>
          <span className="block truncate font-meta font-normal text-muted">{user.role}</span>
        </span>
        <Icon icon={ChevronDownIcon} className="text-[0.65rem] text-muted" />
      </Button>
      <Dropdown.Popover placement="top start" className="min-w-56">
        <Dropdown.Menu
          aria-label="Konto"
          onAction={(key) => {
            if (key === "theme") onToggleTheme();
            if (key === "logout") onSignOut();
          }}
        >
          <Dropdown.Item id="konto" href="/konto" textValue="Kontoeinstellungen">
            <Icon icon={SettingsIcon} className="w-4 text-xs text-muted" />
            <Label>Kontoeinstellungen</Label>
          </Dropdown.Item>
          <Dropdown.Item id="theme" textValue="Design wechseln">
            <Icon icon={theme === "dark" ? SunIcon : MoonIcon} className="w-4 text-xs text-muted" />
            <Label>{theme === "dark" ? "Helles Design" : "Dunkles Design"}</Label>
          </Dropdown.Item>
          <Dropdown.Item id="logout" textValue="Abmelden" variant="danger">
            <Icon icon={LogoutIcon} className="w-4 text-xs" />
            <Label>Abmelden</Label>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
