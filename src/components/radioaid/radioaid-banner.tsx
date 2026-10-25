"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon, ArrowRightIcon, ExternalLinkIcon, HeartIcon } from "@/lib/icons";
import type { RadioAidPhase } from "@/lib/radioaid";
import styles from "./radioaid-banner.module.css";

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

  return (
    <section className={styles.banner} data-phase={phase} aria-label="RadioAid 2026">
      <div className={`shell ${styles.inner}`}>
        <span className={styles.badge}>
          <Icon icon={HeartIcon} className={styles.heart} />
          {phase === "live" ? "Läuft gerade" : "RadioAid 2026"}
        </span>

        <p className={styles.text}>
          {phase === "live" ? (
            <>RadioAid: 24 Stunden Charity-Radio für {organisation}</>
          ) : (
            <>
              24 Stunden Charity-Radio für {organisation}, ab {dateLabel}
            </>
          )}
        </p>

        {phase === "upcoming" && <Remaining ms={now === null ? null : start - now} />}

        <div className={styles.actions}>
          {phase === "live" && (
            <a href={donateUrl} target="_blank" rel="noreferrer noopener" className={styles.link}>
              Spenden
              <Icon icon={ExternalLinkIcon} />
            </a>
          )}
          <Link href="/radioaid" className={styles.link}>
            Mehr erfahren
            <Icon icon={ArrowRightIcon} />
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
    <p className={styles.countdown}>
      {/* Sekündlich wechselnde Ziffern wären für Screenreader unbenutzbar —
          sie bekommen die Angabe einmal, ohne Sekunden. */}
      <span aria-hidden="true">
        noch <strong className={styles.digits}>{days}</strong> {days === "1" ? "Tag" : "Tage"}{" "}
        <strong className={styles.digits}>{clock}</strong>
      </span>
      <span className="visually-hidden">
        {ms === null ? "Countdown wird geladen." : `Noch ${days} Tage bis zum Sendestart.`}
      </span>
    </p>
  );
}
