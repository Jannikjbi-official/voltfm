import Link from "next/link";
import Image from "next/image";
import { footerNav, site } from "@/lib/site";
import { Icon, DiscordIcon, InstagramIcon, ExternalLinkIcon } from "@/lib/icons";
import { Logo } from "./logo";

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
 * Der Footer traegt die zweite Reihe der Navigation (Über uns, FAQ, Presse,
 * Mitmachen, Kontakt) — die Kopfzeile hat nur fuenf Punkte.
 */
export function Footer() {
  return (
    <footer className="mt-24 border-t border-separator bg-surface-secondary/60">
      <div className="shell py-14">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,2fr)]">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-muted">{site.description}</p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {SOCIAL.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-2 rounded-full border border-border px-3.5 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-default"
                  >
                    <Icon icon={item.icon} />
                    {item.label}
                    <Icon icon={ExternalLinkIcon} className="text-[0.65em] opacity-50" />
                    <span className="sr-only"> (öffnet einen neuen Tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <nav aria-label="Footer-Navigation" className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {footerNav.map((column) => (
              <div key={column.title}>
                <h2 className="font-wide text-sm font-bold text-foreground">{column.title}</h2>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {column.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="rounded-sm text-sm text-muted transition-colors hover:text-foreground"
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

        <div className="mt-14 flex flex-col gap-5 border-t border-separator pt-6 text-sm text-muted md:flex-row md:items-center md:justify-between">
          <span>
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
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-surface py-1 pr-3 pl-1 text-xs font-medium text-foreground transition-colors hover:bg-default"
                >
                  <Image src={credit.image} alt="" width={20} height={20} className="rounded-full" />
                  Made by {credit.name}
                  <span className="sr-only"> (öffnet einen neuen Tab)</span>
                </a>
              </li>
            ))}
          </ul>

          <div className="flex gap-5">
            <Link href="/impressum" className="rounded-sm py-1 hover:text-foreground">
              Impressum
            </Link>
            <Link href="/datenschutz" className="rounded-sm py-1 hover:text-foreground">
              Datenschutz
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
