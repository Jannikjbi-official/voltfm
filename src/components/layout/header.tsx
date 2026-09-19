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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { splitNav, site, type NavItem } from "@/lib/site";
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
export function Header({ nav }: { nav: NavItem[] }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { primary, overflow } = splitNav(nav);

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
              <DropdownMenuContent>
                {/* Nur die Beschriftung: Menueeintraege sind in der
                    Komponente auf eine Zeilenhoehe festgelegt, ein zweizeiliger
                    Eintrag wuerde sich mit dem naechsten ueberlagern. Den
                    Zusatztext gibt es im Schubfach, wo Platz dafuer ist. */}
                {overflow.map((item) => (
                  <DropdownMenuItem
                    key={item.href}
                    render={<Link href={item.href}>{item.label}</Link>}
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
            <AccountMenu />
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

                {/* Dieselbe Aufteilung wie auf dem Schirm: Hauptpunkte oben,
                    der Rest unter einer eigenen Ueberschrift. Ein aufklappbares
                    Menue waere hier ein Klick zu viel — im Schubfach ist Platz,
                    also stehen sie einfach darunter. */}
                {overflow.length > 0 && (
                  <>
                    <p className={styles.mobileGroupLabel}>Mehr</p>
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
                  </>
                )}
              </nav>

              <div className={styles.mobileFooter}>
                <AccountMenu />
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
