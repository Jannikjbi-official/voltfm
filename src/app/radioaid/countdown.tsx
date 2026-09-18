"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";

/**
 * Countdown bis zum Sendestart.
 *
 * Der Zielzeitpunkt kommt als Zeitstempel vom Server, damit hier keine
 * Zeitzonen-Arithmetik stattfindet. Bis zum Mount stehen Platzhalter: Server
 * und Browser haben unterschiedliche Uhren, und eine Zahl, die schon im HTML
 * steht, waere beim Hydrieren zwangslaeufig eine andere — das meldet React zu
 * Recht als Fehler.
 */
export function Countdown({ target, label }: { target: number; label: string }) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setRemaining(target - Date.now());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [target]);

  const running = remaining !== null && remaining <= 0;

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

  if (running) {
    return (
      <div className={styles.countdownLive} role="status">
        <span className={styles.livePulse} aria-hidden="true" />
        <div>
          <p className={styles.liveTitle}>Die Sendung läuft</p>
          <p className={styles.liveText}>
            24 Stunden Charity-Radio — jetzt einschalten und mitspenden.
          </p>
        </div>
      </div>
    );
  }

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
