import Link from "next/link";
import { footerNav, site } from "@/lib/site";
import { Icon, DiscordIcon, InstagramIcon, ExternalLinkIcon } from "@/lib/icons";
import { Logo } from "./logo";
import styles from "./footer.module.css";

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

          <p className={styles.credit}>
            Designed und programmiert von{" "}
            <a
              href="https://github.com/Jannikjbi-official"
              target="_blank"
              rel="noreferrer noopener"
              className={styles.creditLink}
            >
              Jannik
            </a>{" "}
            und{" "}
            <a
              href="https://github.com/klokwark"
              target="_blank"
              rel="noreferrer noopener"
              className={styles.creditLink}
            >
              Dustin
            </a>
          </p>
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
