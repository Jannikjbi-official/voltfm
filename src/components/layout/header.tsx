"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/common/button-link";
import {
  Sheet,
  SheetBackdrop,
  SheetPopup,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { secondaryNav, type NavItem } from "@/lib/site";
import type { AccountAvatar } from "@/services/content/account";
import { Icon, MenuIcon, SearchIcon, ExternalLinkIcon } from "@/lib/icons";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { AccountMenu } from "./account-menu";
import styles from "./header.module.css";

/**
 * Die Navigation kommt als Prop vom Server.
 *
 * Sie haengt vom Zeitpunkt ab (`buildMainNav` filtert zeitweise Eintraege).
 * Wuerde dieser Client-Baustein selbst filtern, saehen Server und Browser
 * unterschiedliche Eintraege und das Hydrieren schluege fehl.
 */
export function Header({ nav, account }: { nav: NavItem[]; account: AccountAvatar }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  /** "/" matches exactly; every other entry also matches its sub-routes. */
  const isActive = (item: NavItem) =>
    !item.external && (item.href === "/" ? pathname === "/" : pathname.startsWith(item.href));

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Logo />

        <nav className={styles.nav} aria-label="Hauptnavigation">
          {nav.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={isActive(item)}
              className={styles.navLink}
            />
          ))}
        </nav>

        <div className={styles.actions}>
          <ButtonLink
            href="/suche"
            variant="neutral"
            mode="ghost"
            size="sm"
            asIcon
            aria-label="Suche öffnen"
          >
            <Icon icon={SearchIcon} />
          </ButtonLink>

          <ThemeToggle />

          <div className={styles.desktopOnly}>
            <AccountMenu account={account} />
          </div>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="neutral"
                  mode="ghost"
                  size="sm"
                  asIcon
                  className={styles.mobileOnly}
                  aria-label="Menü öffnen"
                >
                  <Icon icon={MenuIcon} />
                </Button>
              }
            />
            <SheetBackdrop />
            <SheetPopup className={styles.mobilePopup}>
              <SheetHeader>
                <SheetTitle className="visually-hidden">Navigation</SheetTitle>
              </SheetHeader>

              {/* Bewusst kein <SheetClose>: das setzt data-slot="sheet-close",
                  und diese Kennzeichnung ist in der Sheet-Komponente die
                  Gestaltung des X-Knopfes — position: absolute, oben rechts.
                  Jeder Link haette sich dort gestapelt. Das Sheet ist ohnehin
                  gesteuert, also schliesst der Klick es direkt. */}
              <div className={styles.mobileBody}>
                <nav aria-label="Mobile Navigation">
                  <ul className={styles.mobileNav} role="list">
                    {nav.map((item) => (
                      <li key={item.href}>
                        <NavLink
                          item={item}
                          active={isActive(item)}
                          className={styles.mobileLink}
                          onNavigate={() => setMobileOpen(false)}
                        />
                      </li>
                    ))}
                  </ul>
                </nav>

                {/* Die zweite Reihe steht auch im Footer. Auf dem Handy ist der
                    aber sehr weit weg, deshalb hier noch einmal, klein. */}
                <nav aria-label="Weitere Seiten" className={styles.mobileSecondary}>
                  <ul className={styles.mobileSecondaryList} role="list">
                    {secondaryNav.map((item) => (
                      <li key={item.href}>
                        <NavLink
                          item={item}
                          active={isActive(item)}
                          className={styles.mobileSecondaryLink}
                          onNavigate={() => setMobileOpen(false)}
                        />
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>

              <div className={styles.mobileFooter}>
                <AccountMenu account={account} />
              </div>
            </SheetPopup>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

/** Ein Eintrag — intern als Next-Link, Discord als normaler Link in einen neuen Tab. */
function NavLink({
  item,
  active,
  className,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  className: string;
  onNavigate?: () => void;
}) {
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
        <Icon icon={ExternalLinkIcon} className={styles.externalIcon} />
        <span className="visually-hidden"> (öffnet einen neuen Tab)</span>
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
