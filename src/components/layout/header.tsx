"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { splitNav, site, type NavItem } from "@/lib/site";
import type { AccountAvatar } from "@/services/content/account";
import { Icon, MenuIcon, SearchIcon, DiscordIcon, ChevronDownIcon } from "@/lib/icons";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { AccountMenu } from "./account-menu";
import styles from "./header.module.css";

/**
 * Die Navigation kommt als Prop vom Server.
 *
 * Sie haengt vom Zeitpunkt ab (RadioAid erscheint nur rund um die Sendung).
 * Wuerde dieser Client-Baustein selbst filtern, saehen Server und Browser
 * unterschiedliche Eintraege und das Hydrieren schluege fehl.
 */
export function Header({ nav, account }: { nav: NavItem[]; account: AccountAvatar }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { primary, overflow } = splitNav(nav);

  /* Eigener Zustand statt der Collapsible-Komponente: die misst ihre Hoehe
     beim Oeffnen und kam im Schubfach auf ein leeres Panel. Ein- und
     Ausblenden reicht hier voellig. Steht man auf einer Seite der Gruppe,
     ist sie von vornherein offen — sonst waere der aktive Punkt versteckt. */
  const moreRef = useRef<HTMLDivElement>(null);
  const [moreOpen, setMoreOpen] = useState(() =>
    overflow.some((item) =>
      item.href === "/" ? pathname === "/" : pathname.startsWith(item.href),
    ),
  );

  /* Die Gruppe sitzt am Ende einer scrollenden Liste. Ohne diesen Schubs
     klappt sie unterhalb des sichtbaren Ausschnitts auf und es sieht aus, als
     waere nichts passiert. */
  useEffect(() => {
    if (!moreOpen || !mobileOpen) return;
    moreRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [moreOpen, mobileOpen]);

  /** "/" matches exactly; every other entry also matches its sub-routes. */
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Logo />

        <nav className={styles.nav} aria-label="Hauptnavigation">
          {primary.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={styles.navLink}
              aria-current={isActive(item.href) ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}

          {/* Was nicht mehr in die Leiste passt, statt sie umbrechen zu lassen. */}
          {overflow.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button
                    type="button"
                    className={styles.navLink}
                    data-open-overflow
                    aria-current={
                      overflow.some((item) => isActive(item.href)) ? "page" : undefined
                    }
                  >
                    Mehr
                    <Icon icon={ChevronDownIcon} className={styles.navChevron} />
                  </button>
                }
              />
              {/* Wie im Schubfach auf dem Handy: Name und Zusatztext. OlyxUI legt
                  Menueeintraege auf eine Zeilenhoehe fest; .moreItem hebt das
                  auf, sonst ueberlagern sich zweizeilige Eintraege. */}
              <DropdownMenuContent className={styles.moreMenu} align="end">
                {overflow.map((item) => (
                  <DropdownMenuItem
                    key={item.href}
                    className={styles.moreItem}
                    render={
                      <Link
                        href={item.href}
                        aria-current={isActive(item.href) ? "page" : undefined}
                      >
                        <span className={styles.moreLabel}>{item.label}</span>
                        {item.hint && <span className={styles.moreHint}>{item.hint}</span>}
                      </Link>
                    }
                  />
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
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
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>

              {/* Bewusst kein <SheetClose>: das setzt data-slot="sheet-close",
                  und diese Kennzeichnung ist in der Sheet-Komponente die
                  Gestaltung des X-Knopfes — position: absolute, oben rechts.
                  Jeder Link haette sich dort gestapelt und die Navigation waere
                  auf ihre Innenabstaende zusammengefallen. Das Sheet ist
                  ohnehin gesteuert, also schliesst der Klick es direkt. */}
              <nav className={styles.mobileNav} aria-label="Mobile Navigation">
                {primary.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={styles.mobileLink}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    onClick={() => setMobileOpen(false)}
                  >
                    <span className={styles.mobileLinkLabel}>{item.label}</span>
                    {item.hint && <span className={styles.mobileLinkHint}>{item.hint}</span>}
                  </Link>
                ))}

                {/* Dieselbe Aufteilung wie auf dem Schirm, nur aufklappbar:
                    Die Hauptpunkte bleiben auf einen Blick sichtbar, der Rest
                    liegt darunter. Steht man gerade auf einer dieser Seiten,
                    ist die Gruppe von vornherein offen — sonst waere der
                    aktive Punkt versteckt. */}
                {overflow.length > 0 && (
                  <div className={styles.mobileGroup} ref={moreRef}>
                    <button
                      type="button"
                      className={styles.mobileGroupTrigger}
                      aria-expanded={moreOpen}
                      aria-controls="mobile-more"
                      onClick={() => setMoreOpen((open) => !open)}
                    >
                      <span>Mehr</span>
                      <Icon icon={ChevronDownIcon} className={styles.mobileGroupChevron} />
                    </button>

                    {moreOpen && (
                      <div id="mobile-more" className={styles.mobileGroupPanel}>
                        {overflow.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={styles.mobileLink}
                            aria-current={isActive(item.href) ? "page" : undefined}
                            onClick={() => setMobileOpen(false)}
                          >
                            <span className={styles.mobileLinkLabel}>{item.label}</span>
                            {item.hint && <span className={styles.mobileLinkHint}>{item.hint}</span>}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </nav>

              <div className={styles.mobileFooter}>
                <AccountMenu account={account} />
                <ButtonLink href={site.discordUrl} external variant="primary" mode="stroke" size="md">
                  <Icon icon={DiscordIcon} />
                  Discord beitreten
                </ButtonLink>
              </div>
            </SheetPopup>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
