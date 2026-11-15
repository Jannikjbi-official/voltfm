import { cn } from "@heroui/react";
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
 * Das Titelbild fuer Beitraege ohne eigenes Bild: Tinte, das Symbol der
 * Kategorie in Gelb, ihr Name und die Wortmarke. Immer dunkel, in beiden
 * Modi — die Logo-Farben werden hier auf die dunkle Fassung gesetzt. Fuellt
 * den Bildbereich der Karte aus, der Groesse und Seitenverhaeltnis vorgibt.
 * Rein dekorativ — Titel und Kategorie stehen ohnehin neben dem Bild.
 *
 * Mit `label` (z. B. "2.500" bei einem Meilenstein) steht statt des Symbols
 * diese Zeile gross in Gelb. Je laenger die Zeile, desto kleiner, damit sie
 * nie umbricht und unten den Kategorienamen ueberdeckt.
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
  const length = label ? (label.length <= 3 ? "short" : label.length <= 5 ? "medium" : "long") : null;

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden bg-ink text-paper [container-type:size] [--logo-accent:var(--volt)] [--logo-mark:var(--volt)] [--logo-word:var(--paper)]"
    >
      {label ? (
        <span
          className={cn(
            "absolute top-[12cqh] right-[7cqw] left-[7cqw] font-display leading-[0.9] tracking-[-0.04em] whitespace-nowrap text-volt",
            length === "short" && "text-[24cqw]",
            length === "medium" && "text-[18cqw]",
            length === "long" && "text-[12cqw]",
          )}
        >
          {label}
        </span>
      ) : icon ? (
        <Icon icon={icon} className="absolute top-[9cqh] left-[7cqw] !h-[24cqh] w-auto text-volt" />
      ) : (
        <LogoIcon className="absolute top-[9cqh] left-[7cqw] h-[24cqh] w-auto" />
      )}
      <div className="absolute right-[7cqw] bottom-[8cqh] left-[7cqw] flex items-end justify-between gap-3">
        <span className="font-wide text-[clamp(1rem,7.5cqw,2.6rem)] leading-[1.05] font-bold tracking-[-0.02em] [overflow-wrap:anywhere]">
          {categoryName}
        </span>
        <LogoWordmark className="h-[clamp(9px,5cqh,20px)] w-auto shrink-0 opacity-85" />
      </div>
    </div>
  );
}
