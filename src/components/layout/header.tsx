"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Drawer, cn } from "@heroui/react";
import { ButtonLink } from "@/components/common/button-link";
import { secondaryNav, type NavItem } from "@/lib/site";
import type { AccountAvatar } from "@/services/content/account";
import { Icon, MenuIcon, SearchIcon, ExternalLinkIcon } from "@/lib/icons";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { AccountMenu } from "./account-menu";

/**
 * Die Kopfzeile ist die Oberseite des Geraets: eine durchgehende Platte mit
 * Logo, einer Tastenreihe fuer die Bereiche (der aktive ist die gelbe,
 * gedrueckte Taste) und rechts einem kleinen Display mit der Uhrzeit.
 *
 * Die Navigation kommt als Prop vom Server. Sie haengt vom Zeitpunkt ab
 * (`buildMainNav` filtert zeitweise Eintraege). Wuerde dieser Client-Baustein
 * selbst filtern, saehen Server und Browser unterschiedliche Eintraege und das
 * Hydrieren schluege fehl.
 *
 * Am Handy oeffnet der Menue-Knopf einen HeroUI-Drawer von rechts.
 */
export function Header({ nav, account }: { nav: NavItem[]; account: AccountAvatar }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  /** "/" passt nur genau, alles andere auch auf Unterseiten. */
  const isActive = (item: NavItem) =>
    !item.external && (item.href === "/" ? pathname === "/" : pathname.startsWith(item.href));

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface shadow-[var(--surface-shadow)]">
      <div className="shell flex h-[var(--header-height)] items-center gap-4 lg:gap-6">
        <Logo />

        <nav aria-label="Hauptnavigation" className="hidden lg:block">
          {/* Die Tastenreihe sitzt in einer Mulde. */}
          <ul className="well flex items-center gap-1 rounded-[var(--radius)] p-1">
            {nav.map((item) => (
              <li key={item.href}>
                <NavLink item={item} active={isActive(item)} variant="bar" />
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <HeaderClock />

          <ButtonLink href="/suche" variant="ghost" size="sm" isIconOnly aria-label="Suche öffnen">
            <Icon icon={SearchIcon} />
          </ButtonLink>

          <ThemeToggle />

          <div className="ml-1.5 hidden lg:block">
            <AccountMenu account={account} />
          </div>

          <Button
            variant="ghost"
            size="sm"
            isIconOnly
            className="lg:hidden"
            aria-label="Menü öffnen"
            aria-expanded={mobileOpen}
            onPress={() => setMobileOpen(true)}
          >
            <Icon icon={MenuIcon} />
          </Button>
        </div>
      </div>

      <Drawer.Backdrop isOpen={mobileOpen} onOpenChange={setMobileOpen}>
        <Drawer.Content placement="right">
          <Drawer.Dialog aria-label="Navigation" className="w-[min(24rem,92vw)]">
            <Drawer.CloseTrigger aria-label="Menü schließen" />
            <Drawer.Header>
              <Drawer.Heading className="font-meta text-muted">navigation</Drawer.Heading>
            </Drawer.Header>
            <Drawer.Body className="flex flex-col gap-8 pt-4">
              <nav aria-label="Mobile Navigation">
                <ul className="flex flex-col gap-1.5">
                  {nav.map((item, index) => (
                    <li key={item.href}>
                      <NavLink
                        item={item}
                        active={isActive(item)}
                        variant="large"
                        index={index}
                        onNavigate={() => setMobileOpen(false)}
                      />
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Die zweite Reihe steht auch im Footer. Am Handy ist der aber
                  sehr weit weg, deshalb hier noch einmal, kleiner. */}
              <nav aria-label="Weitere Seiten">
                <ul className="flex flex-wrap gap-x-5 gap-y-2">
                  {secondaryNav.map((item) => (
                    <li key={item.href}>
                      <NavLink
                        item={item}
                        active={isActive(item)}
                        variant="small"
                        onNavigate={() => setMobileOpen(false)}
                      />
                    </li>
                  ))}
                </ul>
              </nav>
            </Drawer.Body>
            <Drawer.Footer className="justify-start border-t border-separator pt-4">
              <AccountMenu account={account} onNavigate={() => setMobileOpen(false)} />
            </Drawer.Footer>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </header>
  );
}

/**
 * Kleines Display mit der Senderzeit. Die Uhr kennt nur der Browser — bis zum
 * Hydrieren steht dort "--:--", damit Server und Browser dasselbe zeigen.
 */
function HeaderClock() {
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
      className="display-panel mr-1.5 hidden h-9 items-center gap-2 rounded-[var(--radius)] px-3 sm:inline-flex"
      aria-hidden="true"
    >
      <span className="led" />
      <span className="font-dot text-[1.05rem] leading-none text-volt">{time ?? "--:--"}</span>
    </span>
  );
}

/** Ein Eintrag — intern als Next-Link, Discord als normaler Link in einen neuen Tab. */
function NavLink({
  item,
  active,
  variant,
  index,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  variant: "bar" | "large" | "small";
  index?: number;
  onNavigate?: () => void;
}) {
  const className = cn(
    "inline-flex items-center gap-1.5 transition-colors",
    variant === "bar" &&
      cn(
        "rounded-[calc(var(--radius)-2px)] px-3 py-1.5 font-wide text-[0.92rem] font-semibold",
        active ? "key bg-volt text-graphite" : "text-muted hover:bg-surface hover:text-foreground",
      ),
    variant === "large" &&
      cn(
        "w-full items-baseline gap-3 rounded-[var(--radius)] border px-4 py-3 font-display text-[2rem]",
        active ? "border-transparent bg-volt text-graphite" : "border-border bg-surface text-foreground",
      ),
    variant === "small" &&
      cn("py-1 text-sm font-medium", active ? "text-foreground" : "text-muted hover:text-foreground"),
  );

  const number =
    variant === "large" && index !== undefined ? (
      <span aria-hidden="true" className="font-dot text-base opacity-60">
        {String(index + 1).padStart(2, "0")}
      </span>
    ) : null;

  if (item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noreferrer noopener"
        className={className}
        onClick={onNavigate}
      >
        {number}
        {item.label}
        <Icon icon={ExternalLinkIcon} className="text-[0.7em] opacity-60" />
        <span className="sr-only"> (öffnet einen neuen Tab)</span>
      </a>
    );
  }

  return (
    <Link
      href={item.href}
      className={className}
      aria-current={active ? "page" : undefined}
      onClick={onNavigate}
    >
      {number}
      {item.label}
    </Link>
  );
}
