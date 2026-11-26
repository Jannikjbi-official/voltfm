import { cn } from "@heroui/react";

/**
 * Die Live-Anzeige: eine rote Signal-LED mit dem Wort daneben, in Mono —
 * wie die Beschriftung an einem Geraet.
 *
 * Die Hoererzahl stand hier frueher daneben. Bei einem kleinen Sender sagt
 * eine einstellige Momentaufnahme nichts ueber das Programm. Der Wert bleibt
 * in den Daten — nur nicht mehr auf jeder Seite.
 */
export function LiveIndicator({ label = "Live", className }: { label?: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-mono text-xs font-semibold lowercase", className)}>
      <span aria-hidden="true" className="led animate-[vfm-pulse_2s_ease-in-out_infinite] motion-reduce:animate-none" />
      {label}
    </span>
  );
}
