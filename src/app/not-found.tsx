import type { Metadata } from "next";
import { ButtonLink } from "@/components/common/button-link";
import { Icon, ArrowRightIcon, SearchIcon, RadioIcon } from "@/lib/icons";
import { buildPageIndex } from "@/lib/site";
import styles from "./not-found.module.css";

export const metadata: Metadata = {
  title: "Seite nicht gefunden",
  description: "Diese Seite gibt es bei VoltFM nicht (mehr).",
  robots: { index: false, follow: true },
};

/**
 * 404. Keeps the listener in the building: the stream is still one click away,
 * and the main sections are listed rather than dead-ending on an apology.
 */
export default function NotFound() {
  return (
    <div className={styles.page}>
      <div className="shell">
        <div className={styles.inner}>
          <p className={styles.code} aria-hidden="true">
            404
          </p>

          <h1 className={styles.title}>Hier sendet gerade niemand.</h1>

          <p className={styles.lead}>
            Diese Seite gibt es nicht — oder nicht mehr. Der Livestream läuft
            aber weiter, und über die Suche findest du fast alles wieder.
          </p>

          <div className={styles.actions}>
            <ButtonLink href="/radio" variant="primary" mode="filled" size="md">
              <Icon icon={RadioIcon} />
              Zum Livestream
            </ButtonLink>
            <ButtonLink href="/suche" variant="neutral" mode="stroke" size="md">
              <Icon icon={SearchIcon} />
              Suche öffnen
            </ButtonLink>
          </div>

          <nav className={styles.nav} aria-label="Weitere Bereiche">
            <p className={styles.navLabel}>Oder weiter zu</p>
            <ul className={styles.navList} role="list">
              {buildPageIndex().map((item) => (
                <li key={item.href}>
                  <ButtonLink href={item.href} variant="neutral" mode="ghost" size="sm">
                    {item.label}
                    <Icon icon={ArrowRightIcon} />
                  </ButtonLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}
