"use client";

import { useEffect } from "react";
import { Button } from "@heroui/react";
import { ButtonLink } from "@/components/common/button-link";
import { ErrorScreen } from "@/components/common/error-screen";
import { Icon, RadioIcon, RetryIcon } from "@/lib/icons";
import { buildMainNav } from "@/lib/site";

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

  const nav = buildMainNav().filter((item) => !item.external);

  return (
    <ErrorScreen
      code="Fehler"
      title="Da ist uns etwas abgestürzt."
      lead="Diese Seite konnte nicht geladen werden. Das liegt an uns, nicht an dir. Der Livestream läuft weiter — versuch es gleich noch einmal oder geh woanders hin."
      actions={
        <>
          <Button variant="primary" size="lg" onPress={reset}>
            <Icon icon={RetryIcon} />
            Noch einmal versuchen
          </Button>
          <ButtonLink href="/radio" variant="tertiary" size="lg">
            <Icon icon={RadioIcon} />
            Zum Livestream
          </ButtonLink>
        </>
      }
      links={nav.map(({ href, label }) => ({ href, label }))}
      footer={
        /* Hilft beim Zuordnen, wenn jemand den Fehler meldet. */
        error.digest ? (
          <p className="mt-8 text-xs text-muted">
            Fehlerkennung: <code className="font-mono">{error.digest}</code>
          </p>
        ) : null
      }
    />
  );
}
