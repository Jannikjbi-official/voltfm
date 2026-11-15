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
      {/* Drei feine Kreise oben rechts — Funkwellen, kein Verlauf. */}
      <span className="absolute top-0 right-0 size-[70cqh] translate-x-1/2 -translate-y-1/2 rounded-full border border-paper/10" />
      <span className="absolute top-0 right-0 size-[120cqh] translate-x-1/2 -translate-y-1/2 rounded-full border border-paper/[0.07]" />
      <span className="absolute top-0 right-0 size-[170cqh] translate-x-1/2 -translate-y-1/2 rounded-full border border-paper/[0.05]" />

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
      ) : (
        /* Das Symbol als gelbe Kachel mit Tinte darauf, wie ein App-Icon. */
        <span className="absolute top-[10cqh] left-[7cqw] grid size-[30cqh] place-items-center rounded-[26%] bg-volt text-ink [--logo-mark:var(--ink)]">
          {icon ? (
            <Icon icon={icon} className="!h-[13cqh] w-auto" />
          ) : (
            <LogoIcon className="h-[14cqh] w-auto" />
          )}
        </span>
      )}
      <div className="absolute right-[7cqw] bottom-[8cqh] left-[7cqw] flex items-end justify-between gap-3">
        <span className="text-[clamp(1rem,7.5cqw,2.6rem)] leading-[1.05] font-extrabold tracking-[-0.03em] [overflow-wrap:anywhere]">
          {categoryName}
        </span>
        <LogoWordmark className="h-[clamp(9px,5cqh,20px)] w-auto shrink-0 opacity-85" />
      </div>
    </div>
  );
}
