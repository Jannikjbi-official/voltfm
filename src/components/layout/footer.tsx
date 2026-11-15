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
 * Der Footer als Block aus Tinte — immer dunkel, wie die letzte Seite eines
 * Programmhefts. Er traegt die zweite Reihe der Navigation (Über uns, FAQ,
 * Presse, Mitmachen, Kontakt); die Kopfzeile hat nur fuenf Punkte.
 */
export function Footer() {
  return (
    <footer data-theme="dark" className="dark mt-24 border-t-2 border-border bg-ink text-foreground">
      {/* Unten Platz fuer die Player-Leiste, auch ueber dem iPhone-Balken. */}
      <div className="shell pt-14 pb-[calc(2.5rem+var(--player-height)+env(safe-area-inset-bottom,0px))]">
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
                    className="inline-flex items-center gap-2 border-2 border-paper px-3 py-1.5 font-wide text-sm font-bold text-paper transition-colors hover:bg-paper hover:text-ink"
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
              <div key={column.title} className="border-t-2 border-paper pt-3">
                <h2 className="font-display text-2xl text-paper">{column.title}</h2>
                <ul className="mt-4 flex flex-col gap-2">
                  {column.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="text-sm text-paper/75 decoration-2 underline-offset-4 transition-colors hover:text-paper hover:underline"
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

        <div className="mt-14 flex flex-col gap-5 border-t border-white/20 pt-6 text-sm text-paper/70 md:flex-row md:items-center md:justify-between">
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
                  className="inline-flex items-center gap-2 border border-white/30 py-1 pr-3 pl-1 text-xs font-medium text-paper transition-colors hover:border-paper"
                >
                  <Image src={credit.image} alt="" width={20} height={20} />
                  Made by {credit.name}
                  <span className="sr-only"> (öffnet einen neuen Tab)</span>
                </a>
              </li>
            ))}
          </ul>

          <div className="flex gap-5">
            <Link href="/impressum" className="py-1 hover:text-paper hover:underline">
              Impressum
            </Link>
            <Link href="/datenschutz" className="py-1 hover:text-paper hover:underline">
              Datenschutz
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
