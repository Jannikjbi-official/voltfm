"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Avatar, Button, Drawer, cn } from "@heroui/react";
import type { IconDefinition } from "@/lib/icons";
import { Icon, ListIcon } from "@/lib/icons";

export interface AdminNavItem {
  href: string;
  label: string;
  icon: IconDefinition;
  /** Bereich ist oeffentlich abgeschaltet, bleibt aber bearbeitbar. */
  off?: boolean;
}

/** "/admin" passt nur genau, alles andere auch auf Unterseiten. */
function isActive(pathname: string, href: string): boolean {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

/** Wer angemeldet ist — oben in der Seitenleiste und im Drawer. */
function Who({ name, role }: { name: string; role: string }) {
  return (
    <div className="flex items-center gap-3">
      <Avatar size="sm" className="size-9 shrink-0">
        <Avatar.Fallback className="bg-volt text-xs font-bold text-ink">
          {name.slice(0, 2).toUpperCase()}
        </Avatar.Fallback>
      </Avatar>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">{name}</p>
        <p className="truncate text-xs text-muted">{role}</p>
      </div>
    </div>
  );
}

function NavList({
  items,
  pathname,
  onNavigate,
}: {
  items: AdminNavItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <ul className="flex flex-col gap-0.5">
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-default text-foreground"
                  : "text-muted hover:bg-default/60 hover:text-foreground",
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "grid size-7 shrink-0 place-items-center rounded-lg text-[0.8rem]",
                  active ? "bg-volt text-ink" : "bg-surface-secondary text-muted",
                )}
              >
                <Icon icon={item.icon} />
              </span>
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              {item.off && (
                <span className="rounded-full bg-surface-secondary px-2 py-0.5 text-[0.7rem] font-semibold text-muted">
                  aus
                </span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Die Navigation des Admins: am Desktop eine feste Seitenleiste, am Handy
 * eine Leiste mit dem aktuellen Bereich und ein Drawer mit allen Bereichen.
 *
 * Nur Darstellung — welche Punkte es gibt, entscheidet das Admin-Layout auf
 * dem Server anhand der Rechte, und jede Seite prueft sie noch einmal selbst.
 */
export function AdminNav({
  items,
  name,
  role,
}: {
  items: AdminNavItem[];
  name: string;
  role: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const current = items.find((item) => isActive(pathname, item.href));

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:block">
        <div className="sticky top-[calc(var(--header-height)+1.5rem)] flex flex-col gap-6">
          <div className="rounded-2xl border border-border bg-surface p-4">
            <Who name={name} role={role} />
          </div>
          <nav aria-label="Admin-Navigation">
            <NavList items={items} pathname={pathname} />
          </nav>
          <Link
            href="/"
            className="rounded-sm px-3 text-sm text-muted underline-offset-4 hover:text-foreground hover:underline"
          >
            Zur Website
          </Link>
        </div>
      </aside>

      {/* Handy und Tablet */}
      <div className="mb-6 flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-2 pl-4 lg:hidden">
        <div className="min-w-0">
          <p className="text-xs text-muted">Admin</p>
          <p className="truncate text-sm font-semibold text-foreground">
            {current?.label ?? "Übersicht"}
          </p>
        </div>
        <Button variant="secondary" size="sm" onPress={() => setOpen(true)} aria-expanded={open}>
          <Icon icon={ListIcon} />
          Bereiche
        </Button>
      </div>

      <Drawer.Backdrop isOpen={open} onOpenChange={setOpen}>
        <Drawer.Content placement="left" className="w-[min(20rem,88vw)]">
          <Drawer.Dialog aria-label="Admin-Navigation">
            <Drawer.CloseTrigger aria-label="Navigation schließen" />
            <Drawer.Header>
              <Drawer.Heading className="font-wide text-base font-bold">Admin</Drawer.Heading>
            </Drawer.Header>
            <Drawer.Body className="flex flex-col gap-6">
              <Who name={name} role={role} />
              <nav aria-label="Admin-Bereiche">
                <NavList items={items} pathname={pathname} onNavigate={() => setOpen(false)} />
              </nav>
            </Drawer.Body>
            <Drawer.Footer className="justify-start border-t border-separator pt-4">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="rounded-sm text-sm text-muted hover:text-foreground"
              >
                Zur Website
              </Link>
            </Drawer.Footer>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </>
  );
}
