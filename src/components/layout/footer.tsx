import Link from "next/link";
import Image from "next/image";
import { footerNav, site } from "@/lib/site";
import { Icon, DiscordIcon, InstagramIcon, ExternalLinkIcon } from "@/lib/icons";
import { Logo } from "./logo";
import styles from "./footer.module.css";

/** Wer die Seite gebaut hat — unten rechts als kleine Abzeichen. */
const CREDITS = [
  { name: "Something Dev", href: "https://something-dev.com/", image: "/credits/something-dev.png" },
  { name: "Jannikjbi", href: "https://www.jannikjbi.de/", image: "/credits/jannikjbi.png" },
] as const;

/**
 * Der Footer traegt jetzt die zweite Reihe der Navigation (Über uns, FAQ,
 * Presse, Mitmachen, Kontakt) — die Kopfzeile hat nur noch fuenf Punkte.
 */
export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="shell-wide">
        <div className={styles.top}>
          <div className={styles.brand}>
            <Logo />
            <p className={styles.brandText}>{site.description}</p>
            <ul className={styles.social} role="list">
              <li>
                <a href={site.discordUrl} target="_blank" rel="noreferrer noopener" className={styles.socialLink}>
                  <Icon icon={DiscordIcon} />
                  Discord
                  <Icon icon={ExternalLinkIcon} className={styles.externalIcon} />
                  <span className="visually-hidden"> (öffnet einen neuen Tab)</span>
                </a>
              </li>
              <li>
                <a href={site.instagramUrl} target="_blank" rel="noreferrer noopener" className={styles.socialLink}>
                  <Icon icon={InstagramIcon} />
                  Instagram
                  <Icon icon={ExternalLinkIcon} className={styles.externalIcon} />
                  <span className="visually-hidden"> (öffnet einen neuen Tab)</span>
                </a>
              </li>
            </ul>
          </div>

          <nav className={styles.columns} aria-label="Footer-Navigation">
            {footerNav.map((column) => (
              <div key={column.title}>
                <h2 className={styles.columnTitle}>{column.title}</h2>
                <ul className={styles.columnList} role="list">
                  {column.items.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className={styles.columnLink}>
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className={styles.bottom}>
          <span>
            © {new Date().getFullYear()} {site.name}. Alle Rechte vorbehalten.
          </span>

          {/* Wer die Seite gebaut hat. Die Bilder liegen als Kopie unter
              public/credits: So laedt der Browser nichts von fremden Servern. */}
          <ul className={styles.credits} role="list">
            {CREDITS.map((credit) => (
              <li key={credit.href}>
                <a
                  href={credit.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className={styles.creditBadge}
                >
                  <Image
                    src={credit.image}
                    alt=""
                    width={20}
                    height={20}
                    className={styles.creditImage}
                  />
                  Made by {credit.name}
                </a>
              </li>
            ))}
          </ul>
          <div className={styles.legal}>
            <Link href="/impressum" className={styles.legalLink}>
              Impressum
            </Link>
            <Link href="/datenschutz" className={styles.legalLink}>
              Datenschutz
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
