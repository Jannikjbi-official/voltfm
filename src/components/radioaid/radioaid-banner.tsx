"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon, ExternalLinkIcon, HeartIcon } from "@/lib/icons";
import type { RadioAidPhase } from "@/lib/radioaid";

/**
 * Der Hinweis auf RadioAid oben auf der Startseite.
 *
 * Vor dem Start zaehlt er herunter, waehrend der Sendung sagt er, dass sie
 * laeuft, und nach dem Ende verschwindet er. Die Phase rechnet der Browser
 * jede Sekunde neu: Die Startseite wird nur stuendlich neu gebaut, und wer sie
 * offen hat, soll nach dem Ende nicht weiter auf einen Banner schauen, der
 * eine vergangene Sendung bewirbt.
 *
 * Wie beim Countdown auf /radioaid stehen bis zum Mount Platzhalter — eine
 * Zahl im Server-HTML waere beim Hydrieren zwangslaeufig eine andere.
 */
export function RadioAidBanner({
  start,
  end,
  initialPhase,
  organisation,
  donateUrl,
  dateLabel,
}: {
  start: number;
  end: number;
  initialPhase: RadioAidPhase;
  organisation: string;
  donateUrl: string;
  /** Z. B. "6. November, 18 Uhr" — vom Server formatiert, in Senderzeit. */
  dateLabel: string;
}) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const phase: RadioAidPhase =
    now === null ? initialPhase : now < start ? "upcoming" : now <= end ? "live" : "over";

  if (phase === "over") return null;

  const link =
    "key relative inline-flex items-center gap-1.5 rounded-[var(--radius)] bg-surface px-3.5 py-1.5 text-sm font-semibold text-foreground ring-1 ring-border transition-colors hover:bg-volt hover:text-graphite";

  return (
    <section aria-label="RadioAid 2026" className="shell pt-2">
      {/* Eine Leiste im Gehaeuse statt eines Streifens ueber die volle
          Breite — sie gehoert zur Seite, nicht zur Kopfzeile. */}
      <div className="surface-card flex flex-wrap items-center gap-x-5 gap-y-3 rounded-[var(--radius)] p-2 pr-3">
        <span className="inline-flex items-center gap-2.5 font-wide text-sm font-bold text-foreground">
          <span
            aria-hidden="true"
            className="key grid size-9 place-items-center rounded-[var(--radius)] bg-volt text-xs text-graphite active:translate-y-0"
          >
            <Icon
              icon={HeartIcon}
              className={
                phase === "live"
                  ? "animate-[vfm-pulse_2s_ease-in-out_infinite] motion-reduce:animate-none"
                  : undefined
              }
            />
          </span>
          {phase === "live" ? "Läuft gerade" : "RadioAid 2026"}
        </span>

        <p className="min-w-0 text-sm text-muted">
          {phase === "live" ? (
            <>RadioAid: 24 Stunden Charity-Radio für {organisation}</>
          ) : (
            <>
              24 Stunden Charity-Radio für {organisation}, ab {dateLabel}
            </>
          )}
        </p>

        {phase === "upcoming" && <Remaining ms={now === null ? null : start - now} />}

        <div className="flex items-center gap-2 sm:ml-auto">
          {phase === "live" && (
            <a href={donateUrl} target="_blank" rel="noreferrer noopener" className={link}>
              Spenden
              <Icon icon={ExternalLinkIcon} className="text-[0.7em]" />
              <span className="sr-only"> (öffnet einen neuen Tab)</span>
            </a>
          )}
          <Link href="/radioaid" className={link}>
            Mehr erfahren
          </Link>
        </div>
      </div>
    </section>
  );
}

function Remaining({ ms }: { ms: number | null }) {
  const pad = (n: number) => String(n).padStart(2, "0");
  let days = "--";
  let clock = "--:--:--";
  if (ms !== null && ms > 0) {
    const total = Math.floor(ms / 1000);
    days = String(Math.floor(total / 86_400));
    clock = `${pad(Math.floor(total / 3_600) % 24)}:${pad(Math.floor(total / 60) % 60)}:${pad(total % 60)}`;
  }

  return (
    <p className="display-panel rounded-[3px] px-3 py-1.5 font-mono text-xs text-display-muted">
      {/* Sekuendlich wechselnde Ziffern waeren fuer Screenreader unbenutzbar —
          sie bekommen die Angabe einmal, ohne Sekunden. */}
      <span aria-hidden="true">
        noch <strong className="font-dot text-sm text-volt">{days}</strong>{" "}
        {days === "1" ? "tag" : "tage"}{" "}
        <strong className="font-dot text-sm text-volt">{clock}</strong>
      </span>
      <span className="sr-only">
        {ms === null ? "Countdown wird geladen." : `Noch ${days} Tage bis zum Sendestart.`}
      </span>
    </p>
  );
}
