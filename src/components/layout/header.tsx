"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button, Drawer, cn } from "@heroui/react";
import { ButtonLink } from "@/components/common/button-link";
import { secondaryNav, type NavItem } from "@/lib/site";
import type { AccountAvatar } from "@/services/content/account";
import { Icon, MenuIcon, SearchIcon, ExternalLinkIcon } from "@/lib/icons";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { AccountMenu } from "./account-menu";

/**
 * Die Kopfzeile wie der Kopf einer Zeitung: Papier, darunter eine Linie aus
 * Tinte, der aktive Bereich als gelber Block. Sie klebt oben.
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
    <header className="sticky top-0 z-50 border-b-2 border-border bg-background">
      <div className="shell flex h-[var(--header-height)] items-center gap-6">
        <Logo />

        <nav aria-label="Hauptnavigation" className="hidden flex-1 items-center gap-0.5 lg:flex">
          {nav.map((item) => (
            <NavLink key={item.href} item={item} active={isActive(item)} variant="bar" />
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5 lg:ml-0">
          <ButtonLink
            href="/suche"
            variant="ghost"
            size="sm"
            isIconOnly
            aria-label="Suche öffnen"
          >
            <Icon icon={SearchIcon} />
          </ButtonLink>

          <ThemeToggle />

          <div className="ml-2 hidden lg:block">
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
        <Drawer.Content placement="right" className="w-[min(24rem,92vw)]">
          <Drawer.Dialog aria-label="Navigation">
            <Drawer.CloseTrigger aria-label="Menü schließen" />
            <Drawer.Header>
              <Drawer.Heading className="sr-only">Navigation</Drawer.Heading>
            </Drawer.Header>
            <Drawer.Body className="flex flex-col gap-8 pt-6">
              <nav aria-label="Mobile Navigation">
                <ul className="flex flex-col border-t-2 border-border">
                  {nav.map((item) => (
                    <li key={item.href} className="border-b-2 border-border">
                      <NavLink
                        item={item}
                        active={isActive(item)}
                        variant="large"
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
            <Drawer.Footer className="justify-start border-t-2 border-border pt-4">
              <AccountMenu account={account} onNavigate={() => setMobileOpen(false)} />
            </Drawer.Footer>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </header>
  );
}

/** Ein Eintrag — intern als Next-Link, Discord als normaler Link in einen neuen Tab. */
function NavLink({
  item,
  active,
  variant,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  variant: "bar" | "large" | "small";
  onNavigate?: () => void;
}) {
  const className = cn(
    "inline-flex items-center gap-1.5 transition-colors",
    variant === "bar" &&
      cn(
        "px-2.5 py-1.5 font-wide text-[0.95rem] font-bold",
        active
          ? "bg-volt text-ink"
          : "text-foreground underline-offset-[6px] decoration-2 hover:underline",
      ),
    variant === "large" &&
      cn(
        "w-full py-3 font-display text-[2.6rem] leading-none",
        active ? "text-foreground" : "text-foreground/70 hover:text-foreground",
      ),
    variant === "small" &&
      cn(
        "py-1 font-wide text-sm font-semibold",
        active ? "text-foreground underline decoration-2 underline-offset-4" : "text-muted hover:text-foreground",
      ),
  );

  if (item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noreferrer noopener"
        className={className}
        onClick={onNavigate}
      >
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
      {item.label}
    </Link>
  );
}
