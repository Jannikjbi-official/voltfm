"use client";

import { useEffect, useState } from "react";
import { Button } from "@heroui/react";
import { Icon, PlayIcon, ExternalLinkIcon } from "@/lib/icons";
import { useRadioPlayer } from "@/components/radio/player-provider";
import type { RadioAidPhase } from "@/lib/radioaid";

/**
 * Steht auf einem Display (`display-panel`): helle Schrift, Ziffern in
 * Punktmatrix.
 *
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
  const { openStream, play, embedAllowed } = useRadioPlayer();

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
          className="led mt-3 shrink-0 animate-[vfm-pulse_2s_ease-in-out_infinite] motion-reduce:animate-none"
        />
        <div className="flex flex-col items-start gap-3">
          <p className="font-display text-[2.1rem] text-balance text-volt sm:text-5xl">
            Die Sendung läuft
          </p>
          <p className="leading-relaxed text-display-muted">
            24 Stunden Charity-Radio — jetzt einschalten und mitspenden.
          </p>
          {/* Mit eingebettetem Player startet der Knopf die Wiedergabe hier,
              sonst fuehrt er ueber denselben Hinweis zum Webplayer. */}
          <Button variant="primary" size="lg" onPress={embedAllowed ? play : openStream}>
            <Icon icon={PlayIcon} />
            Jetzt hören
            {!embedAllowed && <Icon icon={ExternalLinkIcon} />}
          </Button>
        </div>
      </div>
    );
  }

  if (phase === "over") {
    return (
      <div className="flex flex-col items-start gap-4">
        <p className="font-display text-[2.1rem] text-balance text-display-foreground sm:text-5xl">Die Sendung ist vorbei</p>
        <p className="max-w-xl text-lg leading-relaxed text-display-muted">
          Danke an alle, die zugehört und gespendet haben. Die nächste Ausgabe
          kommt in einem Jahr — sobald der Termin steht, findest du ihn hier.
        </p>
        <Button variant="primary" onPress={openStream} className="mt-2">
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
      <p className="flex items-center gap-2 font-meta text-display-muted">
        <span className="led" aria-hidden="true" />
        {label}
      </p>
      {/* Ziffern ohne Animation: Sie zaehlen still herunter. */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2" role="timer" aria-live="off">
        {units.map((unit) => (
          <div
            key={unit.label}
            className="flex min-w-0 flex-col items-center gap-3 rounded-[3px] border border-white/10 px-1 py-5 sm:py-8"
          >
            <span className="font-dot text-3xl leading-none text-volt sm:text-6xl lg:text-7xl">
              {unit.value}
            </span>
            <span className="font-meta text-display-muted">{unit.label}</span>
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
