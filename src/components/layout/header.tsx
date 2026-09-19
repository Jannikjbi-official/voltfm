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
import { mainNav, site } from "@/lib/site";
import { Icon, MenuIcon, SearchIcon, DiscordIcon } from "@/lib/icons";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { AccountMenu } from "./account-menu";
import styles from "./header.module.css";

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  /** "/" matches exactly; every other entry also matches its sub-routes. */
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Logo />

        <nav className={styles.nav} aria-label="Hauptnavigation">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={styles.navLink}
              aria-current={isActive(item.href) ? "page" : undefined}
            >
              {item.label}
            </Link>
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
            <SheetPopup>
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
                {mainNav.map((item) => (
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
