import { cn } from "@heroui/react";

/**
 * Der Live-Punkt: eine gelbe Pille mit pulsierendem Punkt.
 *
 * Die Hoererzahl stand hier frueher daneben. Bei einem kleinen Sender sagt
 * eine einstellige Momentaufnahme nichts ueber das Programm. Der Wert bleibt
 * in den Daten — nur nicht mehr auf jeder Seite.
 */
export function LiveIndicator({ label = "Live", className }: { label?: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full bg-volt px-2.5 py-1 text-xs font-bold text-ink",
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
