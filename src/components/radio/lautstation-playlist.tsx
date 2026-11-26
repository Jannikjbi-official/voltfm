"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { Button } from "@heroui/react";
import { CheckboxField } from "@/components/common/form-field";
import { Icon, MusicIcon } from "@/lib/icons";
import { lautstation } from "@/lib/lautstation";

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

  if (consent === null) return <div className="min-h-60" aria-hidden="true" />;

  if (!consent) {
    return (
      <div className="surface-card rounded-[var(--radius)] p-2">
        <div className="flex flex-col gap-4 px-3 pt-4 sm:flex-row sm:items-start sm:gap-5 sm:px-5 sm:pt-5">
          <span
            aria-hidden="true"
            className="display-panel grid size-12 shrink-0 place-items-center rounded-[var(--radius)] text-lg text-volt"
          >
            <Icon icon={MusicIcon} />
          </span>
          <div className="min-w-0">
            {/* Die Fortsetzung der Liste darueber, kein eigener Abschnitt —
                deshalb eine h3 unter "Was gerade lief". */}
            <h3 className="font-wide text-xl font-bold text-foreground">
              Die ganze Playlist der letzten Tage
            </h3>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-pretty text-muted">
              Jeder Titel, mit Uhrzeit, Tag für Tag. Die Liste kommt von{" "}
              {lautstation.name}, einem privaten Verzeichnis für laut.fm-Stationen. Mit
              dem Klick verbindet sich dein Browser dorthin und überträgt dabei deine
              IP-Adresse und Browserkennung. Vorher passiert nichts.
            </p>
          </div>
        </div>
        <div className="well mt-6 flex flex-wrap items-center gap-x-6 gap-y-4 rounded-[var(--radius)] p-3 sm:pr-5">
          <Button variant="primary" onPress={accept}>
            Ganze Playlist laden
          </Button>
          <CheckboxField
            label="Nicht jedes Mal fragen"
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
          />
        </div>
        <p className="px-3 pt-3 pb-2 text-xs text-muted sm:px-5">
          Mehr dazu in unserer{" "}
          <a href="/datenschutz" className="underline underline-offset-4 hover:text-foreground">
            Datenschutzerklärung
          </a>{" "}
          und in der{" "}
          <a
            href={lautstation.privacyUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="underline underline-offset-4 hover:text-foreground"
          >
            von {lautstation.name}
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="surface-card rounded-[var(--radius)] p-3 sm:p-5">
        <div ref={container} className="lautstation-playlist vfm-lautstation" />
      </div>
      <Script
        src={lautstation.scriptUrl}
        strategy="afterInteractive"
        onReady={() => {
          if (container.current) window.LautstationWidget?.init({ container: container.current, station });
        }}
      />
      {remembered && (
        <p className="mt-4 px-1 text-xs text-muted">
          Du hast das Laden dauerhaft erlaubt.{" "}
          <button
            type="button"
            className="rounded-sm font-medium text-foreground underline underline-offset-4"
            onClick={revoke}
          >
            Zurücknehmen
          </button>
        </p>
      )}
    </>
  );
}
