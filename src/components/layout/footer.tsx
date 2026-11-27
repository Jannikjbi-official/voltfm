import Link from "next/link";
import Image from "next/image";
import { footerNav, site } from "@/lib/site";
import { Icon, DiscordIcon, InstagramIcon } from "@/lib/icons";
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
 * Der Footer ist die Rueckseite des Geraets: links Logo, Status und die
 * Anschluesse (Discord, Instagram), rechts die Seiten in vier Spalten.
 * Darunter das Typenschild mit Copyright, Rechtlichem und Credits.
 *
 * Unten haelt er Abstand fuer die Player-Leiste, damit sie nie etwas
 * verdeckt — auch ueber dem iPhone-Balken.
 */
export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-surface-secondary pb-[calc(var(--player-height)+1.5rem+env(safe-area-inset-bottom,0px))]">
      <div className="shell grid gap-2 pt-2 lg:grid-cols-12">
        <div className="surface-card flex flex-col justify-between gap-6 rounded-[var(--radius)] p-6 lg:col-span-4">
          <div>
            <Link href="/" aria-label="VoltFM — zur Startseite" className="inline-block">
              <LogoWordmark className="h-9 w-auto" />
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">{site.description}</p>
            <p className="mt-4 flex items-center gap-2 font-meta text-muted">
              <span className="led" aria-hidden="true" />
              sendet 24/7 · voltfm.xyz
            </p>
          </div>
          <div>
            <ul className="flex flex-wrap gap-2">
              {SOCIAL.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="key inline-flex items-center gap-2 rounded-[var(--radius)] bg-surface px-3.5 py-2 text-sm font-semibold text-foreground ring-1 ring-border transition-colors hover:bg-volt hover:text-graphite"
                  >
                    <Icon icon={item.icon} />
                    {item.label}
                    <span className="sr-only"> (öffnet einen neuen Tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <nav
          aria-label="Footer-Navigation"
          className="surface-card grid grid-cols-2 gap-x-6 gap-y-8 rounded-[var(--radius)] p-6 sm:grid-cols-4 lg:col-span-8"
        >
          {footerNav.map((column) => (
            <div key={column.title}>
              <h2 className="font-meta text-muted">{column.title}</h2>
              <ul className="mt-3 flex flex-col gap-1.5">
                {column.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-[0.95rem] font-medium whitespace-nowrap text-foreground underline-offset-4 hover:underline"
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

      <div className="shell mt-2">
        <div className="flex flex-col gap-4 rounded-[var(--radius)] border border-border px-5 py-4 text-sm text-muted md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
            <span className="font-mono text-xs">
              © {new Date().getFullYear()} {site.name}
            </span>
            <Link href="/impressum" className="py-1 hover:text-foreground">
              Impressum
            </Link>
            <Link href="/datenschutz" className="py-1 hover:text-foreground">
              Datenschutz
            </Link>
          </div>

          {/* Die Bilder liegen als Kopie unter public/credits: So laedt der
              Browser nichts von fremden Servern. */}
          <ul className="flex flex-wrap gap-2">
            {CREDITS.map((credit) => (
              <li key={credit.href}>
                <a
                  href={credit.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-2 rounded-[var(--radius)] py-1 pr-3 pl-1 text-xs font-medium text-foreground ring-1 ring-border transition-colors hover:bg-surface"
                >
                  <Image src={credit.image} alt="" width={20} height={20} className="rounded-[3px]" />
                  Made by {credit.name}
                  <span className="sr-only"> (öffnet einen neuen Tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
