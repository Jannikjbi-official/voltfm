"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Icon, MusicIcon } from "@/lib/icons";
import { lautstation } from "@/lib/lautstation";
import styles from "./lautstation-playlist.module.css";

declare global {
  interface Window {
    LautstationWidget?: { init: (options: { container: HTMLElement; station: string }) => void };
  }
}

/**
 * Die Playlist der letzten Tage, als Widget von lautstation.de.
 *
 * Erst nach einem Klick: Ab dann laedt der Browser ein Skript und die
 * Titelliste von cdn.lautstation.de und uebertraegt dabei IP-Adresse und
 * Browserkennung. Wer "nicht jedes Mal fragen" waehlt, bekommt das in
 * localStorage gemerkt — wie beim Player, und genauso widerrufbar.
 *
 * Der Container traegt bewusst kein data-station: Damit uebergeht ihn die
 * automatische Suche des Widgets, und es wird genau einmal ueber onReady
 * gestartet — auch, wenn man per Navigation zur Seite zurueckkehrt und das
 * Skript schon geladen ist.
 */
export function LautstationPlaylist({ station }: { station: string }) {
  /* null bis zum Mount: Was im Speicher steht, weiss nur der Browser. */
  const [consent, setConsent] = useState<boolean | null>(null);
  const [remembered, setRemembered] = useState(false);
  const [remember, setRemember] = useState(false);
  const container = useRef<HTMLDivElement>(null);

  /* Einmaliges Lesen eines Browser-Speichers beim Mount — wie im
     RadioPlayerProvider. Als Startwert ginge es nicht: Das Server-HTML waere
     ein anderes und das Hydrieren schluege fehl. */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    let stored = false;
    try {
      stored = localStorage.getItem(lautstation.consentKey) === "granted";
    } catch {
      // Kein Speicher verfuegbar — dann wird eben jedes Mal gefragt.
    }
    setRemembered(stored);
    setConsent(stored);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  function accept() {
    if (remember) {
      try {
        localStorage.setItem(lautstation.consentKey, "granted");
        setRemembered(true);
      } catch {
        // gilt dann nur fuer diesen Seitenaufruf
      }
    }
    setConsent(true);
  }

  function revoke() {
    try {
      localStorage.removeItem(lautstation.consentKey);
    } catch {
      // nichts zu entfernen
    }
    /* Neu laden, damit das fremde Skript nicht weiter auf der Seite liegt. */
    window.location.reload();
  }

  if (consent === null) return <div className={styles.placeholder} aria-hidden="true" />;

  if (!consent) {
    return (
      <div className={styles.gate}>
        <span className={styles.gateIcon} aria-hidden="true">
          <Icon icon={MusicIcon} />
        </span>
        <h2 className={styles.gateTitle}>Playlist von {lautstation.name} laden?</h2>
        <p className={styles.gateText}>
          Die Liste aller Titel der letzten Tage kommt von {lautstation.name}, einem
          privaten Verzeichnis für laut.fm-Stationen. Mit dem Klick verbindet sich
          dein Browser dorthin und überträgt dabei deine IP-Adresse und
          Browserkennung. Vorher passiert nichts.
        </p>
        <div className={styles.gateActions}>
          <Button variant="primary" mode="filled" size="md" onClick={accept}>
            Playlist laden
          </Button>
          <label className={styles.remember}>
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
            />
            <span>Nicht jedes Mal fragen</span>
          </label>
        </div>
        <p className={styles.gateNote}>
          Mehr dazu in unserer <a href="/datenschutz">Datenschutzerklärung</a> und in der{" "}
          <a href={lautstation.privacyUrl} target="_blank" rel="noreferrer noopener">
            von {lautstation.name}
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <>
      <div ref={container} className={`lautstation-playlist ${styles.widget}`} />
      <Script
        src={lautstation.scriptUrl}
        strategy="afterInteractive"
        onReady={() => {
          if (container.current) window.LautstationWidget?.init({ container: container.current, station });
        }}
      />
      {remembered && (
        <p className={styles.revoke}>
          Du hast das Laden dauerhaft erlaubt.{" "}
          <button type="button" className={styles.linkButton} onClick={revoke}>
            Zurücknehmen
          </button>
        </p>
      )}
    </>
  );
}
