import { LogoIcon, LogoWordmark } from "@/components/layout/logo";
import {
  Icon,
  NewsIcon,
  MusicIcon,
  RadioIcon,
  CommunityIcon,
  EventsIcon,
  BoltIcon,
  ToolsIcon,
  CalendarIcon,
  ListIcon,
} from "@/lib/icons";
import styles from "./article-cover.module.css";

/**
 * Pro Kategorie ein Symbol. Kategorien, die hier fehlen (im Admin neu
 * angelegt), bekommen das Play-Icon aus dem Logo — das Titelbild bleibt also
 * nie leer.
 */
const ICONS: Record<string, typeof NewsIcon> = {
  news: NewsIcon,
  musik: MusicIcon,
  radio: RadioIcon,
  community: CommunityIcon,
  events: EventsIcon,
  "in-eigener-sache": BoltIcon,
  "hinter-den-kulissen": ToolsIcon,
  sendeplan: CalendarIcon,
  playlist: ListIcon,
};

/**
 * Das Titelbild fuer Beitraege ohne eigenes Bild: dunkle Flaeche in den
 * Logo-Farben, das Symbol der Kategorie, ihr Name und die Wortmarke. Fuellt
 * den Bildbereich der Karte aus, der Groesse und Seitenverhaeltnis vorgibt.
 * Rein dekorativ — Titel und Kategorie stehen ohnehin neben dem Bild.
 *
 * Mit `label` (z. B. "2.500" bei einem Meilenstein) steht statt des Symbols
 * diese Zeile gross in Gelb.
 */
export function ArticleCover({
  categorySlug,
  categoryName,
  label,
}: {
  categorySlug: string;
  categoryName: string;
  label?: string;
}) {
  const icon = ICONS[categorySlug];

  return (
    <div className={styles.cover} aria-hidden="true">
      {label ? (
        <span
          className={styles.label}
          data-length={label.length <= 3 ? "short" : label.length <= 5 ? "medium" : "long"}
        >
          {label}
        </span>
      ) : icon ? (
        <Icon icon={icon} className={styles.icon} />
      ) : (
        <LogoIcon className={styles.icon} />
      )}
      <div className={styles.foot}>
        <span className={styles.name}>{categoryName}</span>
        <LogoWordmark className={styles.wordmark} />
      </div>
    </div>
  );
}
