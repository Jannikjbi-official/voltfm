"use client";

import { useEffect, useState } from "react";
import { Button } from "@heroui/react";
import { Icon, PlayIcon, ExternalLinkIcon } from "@/lib/icons";
import { useRadioPlayer } from "@/components/radio/player-provider";
import type { RadioAidPhase } from "@/lib/radioaid";

/**
 * Countdown bis zum Sendestart — und danach der Weg zum Hören.
 *
 * Zielzeitpunkte kommen als Zeitstempel vom Server, damit hier keine
 * Zeitzonen-Arithmetik stattfindet. Die Phase wird trotzdem im Browser neu
 * berechnet: Ein Besucher kann die Seite offen haben, während die Sendung
 * beginnt, und soll dann nicht auf einem abgelaufenen Countdown sitzen.
 *
 * Bis zum Mount stehen Platzhalter. Eine Zahl, die schon im server-gerenderten
 * HTML steht, wäre beim Hydrieren zwangsläufig eine andere — das meldet React
 * zu Recht als Fehler.
 */
export function Countdown({
  start,
  end,
  initialPhase,
  label,
}: {
  start: number;
  end: number;
  initialPhase: RadioAidPhase;
  label: string;
}) {
  const [now, setNow] = useState<number | null>(null);
  const { openStream } = useRadioPlayer();

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  // Vor dem Mount gilt, was der Server gesehen hat.
  const phase: RadioAidPhase =
    now === null ? initialPhase : now < start ? "upcoming" : now <= end ? "live" : "over";

  if (phase === "live") {
    return (
      <div className="flex items-start gap-4" role="status">
        <span
          aria-hidden="true"
          className="mt-2 size-3.5 shrink-0 rounded-full bg-volt animate-[vfm-pulse_2s_ease-in-out_infinite] motion-reduce:animate-none"
        />
        <div className="flex flex-col items-start gap-3">
          <p className="font-display text-[2.1rem] text-balance text-foreground sm:text-5xl">
            Die Sendung läuft
          </p>
          <p className="leading-relaxed text-muted">
            24 Stunden Charity-Radio — jetzt einschalten und mitspenden.
          </p>
          {/* Fuehrt ueber denselben Hinweis wie der Player: Die Wiedergabe
              findet im Webplayer von lautstation.de statt, nicht hier. */}
          <Button variant="primary" size="lg" onPress={openStream}>
            <Icon icon={PlayIcon} />
            Jetzt hören
            <Icon icon={ExternalLinkIcon} />
          </Button>
        </div>
      </div>
    );
  }

  if (phase === "over") {
    return (
      <div className="flex flex-col items-start gap-4">
        <p className="font-display text-[2.1rem] text-balance text-foreground sm:text-5xl">Die Sendung ist vorbei</p>
        <p className="max-w-xl text-lg leading-relaxed text-muted">
          Danke an alle, die zugehört und gespendet haben. Die nächste Ausgabe
          kommt in einem Jahr — sobald der Termin steht, findest du ihn hier.
        </p>
        <Button variant="tertiary" onPress={openStream} className="mt-2">
          <Icon icon={PlayIcon} />
          Jetzt hören
          <Icon icon={ExternalLinkIcon} />
        </Button>
      </div>
    );
  }

  const remaining = now === null ? null : start - now;
  const units = (() => {
    if (remaining === null || remaining <= 0) {
      return [
        { value: "--", label: "Tage" },
        { value: "--", label: "Stunden" },
        { value: "--", label: "Minuten" },
        { value: "--", label: "Sekunden" },
      ];
    }
    const total = Math.floor(remaining / 1000);
    const pad = (n: number) => String(n).padStart(2, "0");
    return [
      { value: String(Math.floor(total / 86_400)), label: "Tage" },
      { value: pad(Math.floor(total / 3_600) % 24), label: "Stunden" },
      { value: pad(Math.floor(total / 60) % 60), label: "Minuten" },
      { value: pad(total % 60), label: "Sekunden" },
    ];
  })();

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <p className="text-sm font-semibold text-muted">{label}</p>
      {/* Ziffern ohne Animation: Sie zaehlen still herunter. */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3" role="timer" aria-live="off">
        {units.map((unit) => (
          <div
            key={unit.label}
            className="flex flex-col items-center gap-2 rounded-2xl bg-default px-1 py-5 sm:py-7"
          >
            <span className="font-display text-3xl leading-none tabular-nums text-foreground sm:text-6xl">
              {unit.value}
            </span>
            <span className="text-xs text-muted sm:text-sm">{unit.label}</span>
          </div>
        ))}
      </div>
      {/* Fuer Screenreader reicht die Angabe einmal — eine sekuendlich
          aktualisierte Live-Region waere unbenutzbar. */}
      <p className="sr-only">
        {remaining === null
          ? "Countdown wird geladen."
          : `Noch ${units[0].value} Tage, ${units[1].value} Stunden und ${units[2].value} Minuten bis zum Sendestart.`}
      </p>
    </div>
  );
}
