"use client";

import { useState } from "react";
import { coverSrc } from "./cover-url";
import styles from "./cover-stage.module.css";

type Layer = { src: string; loaded: boolean };

/**
 * Das Cover noch einmal, stark weichgezeichnet und abgeblendet, als Flaeche
 * hinter der Buehne. Beim Songwechsel blendet das neue Bild weich ueber das
 * alte — erst, wenn es geladen ist, sonst blendet es ins Leere.
 *
 * Geladen wird die kleine 96er-Datei: Weichgezeichnet sieht man keine
 * Aufloesung, und sie liegt ohnehin schon im Cache, weil die Leiste unten
 * dieselbe benutzt. Der Schleier darueber kommt aus der Seitenfarbe
 * (--color-stage-scrim), damit der Text in beiden Modi lesbar bleibt.
 *
 * Bei reduzierter Bewegung wechselt das Bild ohne Ueberblendung — die globale
 * Regel in globals.css setzt die Uebergangsdauer dann praktisch auf null.
 */
export function CoverBackdrop({ src }: { src: string | null | undefined }) {
  const [layers, setLayers] = useState<Layer[]>(() => (src ? [{ src, loaded: true }] : []));
  const [shownSrc, setShownSrc] = useState(src);

  /* Neues Cover: als zweite Ebene obendrauf. Das ist das von React empfohlene
     Muster fuer "auf eine geaenderte Prop reagieren" — im Render statt in
     einem Effekt, damit kein Zwischenstand mit dem alten Bild gemalt wird. */
  if (src !== shownSrc) {
    setShownSrc(src);
    setLayers((current) => {
      const settled = current.filter((layer) => layer.loaded).slice(-1);
      return src ? [...settled, { src, loaded: false }] : [];
    });
  }

  const markLoaded = (loadedSrc: string) =>
    setLayers((current) =>
      current.map((layer) => (layer.src === loadedSrc ? { ...layer, loaded: true } : layer)),
    );

  /* Ist die Ueberblendung durch, braucht es die alte Ebene nicht mehr. */
  const dropOlder = (doneSrc: string) =>
    setLayers((current) => {
      const index = current.findIndex((layer) => layer.src === doneSrc);
      return index > 0 ? current.slice(index) : current;
    });

  const dropFailed = (failedSrc: string) =>
    setLayers((current) => current.filter((layer) => layer.src !== failedSrc));

  return (
    <div className={styles.backdrop} aria-hidden="true">
      {layers.map((layer) => (
        // eslint-disable-next-line @next/next/no-img-element -- feste 96er-Datei, siehe cover-url.ts
        <img
          key={layer.src}
          src={coverSrc(layer.src, "thumb")}
          alt=""
          decoding="async"
          className={styles.backdropImage}
          data-loaded={layer.loaded || undefined}
          onLoad={() => markLoaded(layer.src)}
          onError={() => dropFailed(layer.src)}
          onTransitionEnd={() => dropOlder(layer.src)}
        />
      ))}
      <div className={styles.scrim} />
    </div>
  );
}
