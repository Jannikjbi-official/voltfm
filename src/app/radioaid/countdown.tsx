"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Icon, PlayIcon, ExternalLinkIcon } from "@/lib/icons";
import { useRadioPlayer } from "@/components/radio/player-provider";
import type { RadioAidPhase } from "@/lib/radioaid";
import styles from "./page.module.css";

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
      <div className={styles.countdownLive} role="status">
        <span className={styles.livePulse} aria-hidden="true" />
        <div className={styles.liveBody}>
          <p className={styles.liveTitle}>Die Sendung läuft</p>
          <p className={styles.liveText}>
            24 Stunden Charity-Radio — jetzt einschalten und mitspenden.
          </p>
          {/* Führt über denselben Hinweis wie der Player: Die Wiedergabe
              findet im Webplayer von lautstation.de statt, nicht hier. */}
          <Button variant="primary" mode="filled" size="lg" onClick={openStream}>
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
      <div className={styles.countdownOver}>
        <p className={styles.overTitle}>Die Sendung ist vorbei</p>
        <p className={styles.overText}>
          Danke an alle, die zugehört und gespendet haben. Die nächste Ausgabe
          kommt in einem Jahr — sobald der Termin steht, findest du ihn hier.
        </p>
        <Button variant="neutral" mode="stroke" size="md" onClick={openStream}>
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
    <div className={styles.countdown}>
      <p className={styles.countdownLabel}>{label}</p>
      <div className={styles.units} role="timer" aria-live="off">
        {units.map((unit) => (
          <div key={unit.label} className={styles.unit}>
            <span className={styles.unitValue}>{unit.value}</span>
            <span className={styles.unitLabel}>{unit.label}</span>
          </div>
        ))}
      </div>
      {/* Für Screenreader reicht die Angabe einmal — eine sekündlich
          aktualisierte Live-Region wäre unbenutzbar. */}
      <p className="visually-hidden">
        {remaining === null
          ? "Countdown wird geladen."
          : `Noch ${units[0].value} Tage, ${units[1].value} Stunden und ${units[2].value} Minuten bis zum Sendestart.`}
      </p>
    </div>
  );
}
