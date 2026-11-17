import Link from "next/link";
import Image from "next/image";
import { footerNav, site } from "@/lib/site";
import { Icon, DiscordIcon, InstagramIcon, ExternalLinkIcon } from "@/lib/icons";
import { LogoWordmark } from "./logo";

/** Wer die Seite gebaut hat — unten als kleine Abzeichen. */
const CREDITS = [
  { name: "Something Dev", href: "https://something-dev.com/", image: "/credits/something-dev.png" },
  { name: "Jannikjbi", href: "https://www.jannikjbi.de/", image: "/credits/jannikjbi.png" },
] as const;

const SOCIAL = [
  { label: "Discord", href: site.discordUrl, icon: DiscordIcon },
  { label: "Instagram", href: site.instagramUrl, icon: InstagramIcon },
] as const;

/**
 * Der Footer als dunkle Flaeche mit runden Ecken — immer dunkel, auch im
 * Hellmodus. Er traegt die zweite Reihe der Navigation (Über uns, FAQ,
 * Presse, Mitmachen, Kontakt); die Kopfzeile hat nur fuenf Punkte.
 *
 * Unten haelt er Abstand fuer die schwebende Player-Leiste, damit sie nie
 * etwas verdeckt — auch ueber dem iPhone-Balken.
 */
export function Footer() {
  return (
    <footer className="mt-24 px-3 pb-[calc(var(--player-height)+1.5rem+env(safe-area-inset-bottom,0px))]">
      <div data-theme="dark" className="dark rounded-[2rem] border border-border bg-surface text-foreground">
        <div className="shell pt-14 pb-10">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
            <div>
              <Link href="/" aria-label="VoltFM — zur Startseite" className="inline-block">
                <LogoWordmark className="h-10 w-auto sm:h-12" />
              </Link>
              <p className="mt-6 max-w-sm text-sm leading-relaxed text-paper/75">{site.description}</p>
              <ul className="mt-6 flex flex-wrap gap-2">
                {SOCIAL.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-2 rounded-full bg-default px-3.5 py-1.5 text-sm font-semibold text-paper transition-colors hover:bg-volt hover:text-ink"
                    >
                      <Icon icon={item.icon} />
                      {item.label}
                      <Icon icon={ExternalLinkIcon} className="text-[0.65em] opacity-60" />
                      <span className="sr-only"> (öffnet einen neuen Tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <nav aria-label="Footer-Navigation" className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3">
              {footerNav.map((column) => (
                <div key={column.title}>
                  <h2 className="text-sm font-bold text-paper">{column.title}</h2>
                  <ul className="mt-4 flex flex-col gap-2">
                    {column.items.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className="text-sm text-paper/65 transition-colors hover:text-paper"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>

          <div className="mt-14 flex flex-col gap-5 border-t border-separator pt-6 text-sm text-paper/65 md:flex-row md:items-center md:justify-between">
            <span className="font-mono text-xs">
              © {new Date().getFullYear()} {site.name}. Alle Rechte vorbehalten.
            </span>

            {/* Die Bilder liegen als Kopie unter public/credits: So laedt der
                Browser nichts von fremden Servern. */}
            <ul className="flex flex-wrap gap-2">
              {CREDITS.map((credit) => (
                <li key={credit.href}>
                  <a
                    href={credit.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-2 rounded-full bg-default py-1 pr-3 pl-1 text-xs font-medium text-paper transition-colors hover:bg-surface-tertiary"
                  >
                    <Image src={credit.image} alt="" width={20} height={20} className="rounded-full" />
                    Made by {credit.name}
                    <span className="sr-only"> (öffnet einen neuen Tab)</span>
                  </a>
                </li>
              ))}
            </ul>

            <div className="flex gap-5">
              <Link href="/impressum" className="py-1 hover:text-paper">
                Impressum
              </Link>
              <Link href="/datenschutz" className="py-1 hover:text-paper">
                Datenschutz
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
