import { cn } from "@heroui/react";

/**
 * Der Live-Stempel: ein kleiner Block in Monospace mit blinkendem Punkt.
 *
 * Die Hoererzahl stand hier frueher daneben. Bei einem kleinen Sender sagt
 * eine einstellige Momentaufnahme nichts ueber das Programm. Der Wert bleibt
 * in den Daten — nur nicht mehr auf jeder Seite.
 */
export function LiveIndicator({ label = "Live", className }: { label?: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 bg-ink px-2 py-1 font-mono text-[0.7rem] font-semibold text-volt",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="size-1.5 rounded-full bg-current animate-[vfm-pulse_2s_ease-in-out_infinite] motion-reduce:animate-none"
      />
      {label}
    </span>
  );
}
