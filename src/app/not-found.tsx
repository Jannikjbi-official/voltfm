import type { Metadata } from "next";
import { ButtonLink } from "@/components/common/button-link";
import { ErrorScreen } from "@/components/common/error-screen";
import { Icon, SearchIcon, RadioIcon } from "@/lib/icons";
import { buildPageIndex } from "@/lib/site";

export const metadata: Metadata = {
  title: "Seite nicht gefunden",
  description: "Diese Seite gibt es bei VoltFM nicht (mehr).",
  robots: { index: false, follow: true },
};

/**
 * 404. Haelt die Leute im Haus: Der Stream ist einen Klick entfernt, und die
 * Bereiche stehen darunter, statt mit einer Entschuldigung zu enden.
 */
export default function NotFound() {
  return (
    <ErrorScreen
      code="404"
      title="Hier sendet gerade niemand."
      lead="Diese Seite gibt es nicht — oder nicht mehr. Der Livestream läuft aber weiter, und über die Suche findest du fast alles wieder."
      actions={
        <>
          <ButtonLink href="/radio" size="lg">
            <Icon icon={RadioIcon} />
            Zum Livestream
          </ButtonLink>
          <ButtonLink href="/suche" variant="outline" size="lg">
            <Icon icon={SearchIcon} />
            Suche öffnen
          </ButtonLink>
        </>
      }
      links={buildPageIndex().map(({ href, label }) => ({ href, label }))}
    />
  );
}
