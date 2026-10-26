import Link from "next/link";
import { ButtonLink } from "@/components/common/button-link";
import { footerNav, site } from "@/lib/site";
import { Icon, DiscordIcon, InstagramIcon } from "@/lib/icons";
import { Logo } from "./logo";
import styles from "./footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="shell-wide">
        <div className={styles.top}>
          <div className={styles.brand}>
            <Logo />
            <p className={styles.brandText}>
              {site.description}
            </p>
            <div className={styles.brandLinks}>
              <ButtonLink href={site.discordUrl} external variant="primary" mode="stroke" size="sm">
                <Icon icon={DiscordIcon} />
                Community auf Discord
              </ButtonLink>
              <ButtonLink href={site.instagramUrl} external variant="neutral" mode="stroke" size="sm">
                <Icon icon={InstagramIcon} />
                Instagram
              </ButtonLink>
            </div>
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
            <Link href="/impressum" className={styles.columnLink}>
              Impressum
            </Link>
            <Link href="/datenschutz" className={styles.columnLink}>
              Datenschutz
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
