"use client";

import { useEffect } from "react";
import { ButtonLink } from "@/components/common/button-link";
import { Button } from "@/components/ui/button";
import { Icon, ArrowRightIcon, RadioIcon, LoadingIcon } from "@/lib/icons";
import { buildMainNav } from "@/lib/site";
import styles from "./not-found.module.css";

/**
 * Was statt eines Absturzes erscheint.
 *
 * Next.js zeigt sonst eine nackte Fehlermeldung („This page couldn't load"),
 * die aussieht, als wäre die ganze Seite kaputt. Das hier sieht aus wie die
 * 404-Seite und bietet denselben Ausweg: weiterhören, neu laden, woanders
 * hingehen.
 *
 * Die eigentliche Ursache steht bewusst nicht hier — sie kann interne Pfade
 * oder Datenbankmeldungen enthalten. Sie landet in der Serverkonsole, und die
 * `digest` genügt, um beides einander zuzuordnen.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[error-boundary]", error);
  }, [error]);

  const nav = buildMainNav();

  return (
    <div className={styles.page}>
      <div className="shell">
        <div className={styles.inner}>
          <p className={styles.code} aria-hidden="true">
            Fehler
          </p>

          <h1 className={styles.title}>Da ist uns etwas abgestürzt.</h1>

          <p className={styles.lead}>
            Diese Seite konnte nicht geladen werden. Das liegt an uns, nicht an
            dir. Der Livestream läuft weiter — versuch es gleich noch einmal
            oder geh woanders hin.
          </p>

          <div className={styles.actions}>
            <Button variant="primary" mode="filled" size="md" onClick={reset}>
              <Icon icon={LoadingIcon} />
              Noch einmal versuchen
            </Button>
            <ButtonLink href="/radio" variant="neutral" mode="stroke" size="md">
              <Icon icon={RadioIcon} />
              Zum Livestream
            </ButtonLink>
          </div>

          {/* Dieselben Klassen wie auf der 404-Seite — beide teilen sich das
              Stylesheet, damit sie nicht auseinanderlaufen. */}
          <nav className={styles.nav} aria-label="Weitere Bereiche">
            <p className={styles.navLabel}>Oder weiter zu</p>
            <ul className={styles.navList} role="list">
              {nav
                .filter((item) => item.href !== "/")
                .map((item) => (
                  <li key={item.href}>
                    <ButtonLink href={item.href} variant="neutral" mode="ghost" size="sm">
                      {item.label}
                      <Icon icon={ArrowRightIcon} />
                    </ButtonLink>
                  </li>
                ))}
            </ul>
          </nav>

          {/* Hilft beim Zuordnen, wenn jemand den Fehler meldet. */}
          {error.digest && (
            <p className={styles.digest}>
              Fehlerkennung: <code>{error.digest}</code>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
