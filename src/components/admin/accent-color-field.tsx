"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import styles from "./accent-color-field.module.css";
import formStyles from "./admin-form.module.css";

/**
 * Gespeichert wird ein Farbton (0–360), nicht ein Hex-Code.
 *
 * Die Profilseite baut daraus `oklch(0.58 0.17 <hue>)`. So bleiben Helligkeit
 * und Sättigung für alle gleich: Jede Akzentfarbe hat denselben Kontrast zum
 * Hintergrund, egal welche jemand wählt. Ein freier Hex-Code könnte auch ein
 * Grau oder ein kaum lesbares Gelb sein.
 */
const PRESETS = [
  { hue: 251, label: "VoltFM-Blau" },
  { hue: 210, label: "Himmel" },
  { hue: 175, label: "Türkis" },
  { hue: 145, label: "Grün" },
  { hue: 95, label: "Limette" },
  { hue: 70, label: "Gold" },
  { hue: 40, label: "Orange" },
  { hue: 25, label: "Rot" },
  { hue: 350, label: "Pink" },
  { hue: 320, label: "Magenta" },
  { hue: 290, label: "Violett" },
  { hue: 270, label: "Lila" },
] as const;

/** Wandelt `#rrggbb` in den Farbton um. Gibt null zurück, wenn es keiner ist. */
function hexToHue(hex: string): number | null {
  const match = /^#?([\da-f]{6})$/i.exec(hex.trim());
  if (!match) return null;

  const value = parseInt(match[1], 16);
  const r = ((value >> 16) & 255) / 255;
  const g = ((value >> 8) & 255) / 255;
  const b = (value & 255) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  // Grautöne haben keinen Farbton — dann bleibt es beim Standard.
  if (delta === 0) return null;

  let hue: number;
  if (max === r) hue = ((g - b) / delta) % 6;
  else if (max === g) hue = (b - r) / delta + 2;
  else hue = (r - g) / delta + 4;

  return Math.round(((hue * 60) + 360) % 360);
}

function swatch(hue: number): string {
  return `oklch(0.58 0.17 ${hue})`;
}

export function AccentColorField({
  name,
  defaultValue = "",
  label,
  hint,
}: {
  name: string;
  defaultValue?: string;
  label: string;
  hint?: string;
}) {
  const [hue, setHue] = useState<string>(defaultValue);
  const [hex, setHex] = useState("");
  const [hexError, setHexError] = useState(false);

  const current = hue === "" ? null : Number(hue);

  function applyHex(value: string) {
    setHex(value);
    if (!value.trim()) {
      setHexError(false);
      return;
    }
    const derived = hexToHue(value);
    if (derived === null) {
      setHexError(true);
      return;
    }
    setHexError(false);
    setHue(String(derived));
  }

  return (
    <div className={styles.field}>
      <span className={formStyles.label}>{label}</span>

      <ul className={styles.swatches} role="list">
        {PRESETS.map((preset) => (
          <li key={preset.hue}>
            <button
              type="button"
              className={styles.swatch}
              style={{ background: swatch(preset.hue) }}
              aria-label={preset.label}
              aria-pressed={current === preset.hue}
              title={preset.label}
              onClick={() => {
                setHue(String(preset.hue));
                setHex("");
                setHexError(false);
              }}
            />
          </li>
        ))}
      </ul>

      <div className={styles.custom}>
        <Input
          value={hex}
          onChange={(event) => applyHex(event.target.value)}
          placeholder="#7c4dff"
          aria-label="Eigene Farbe als Hex-Code"
          maxLength={7}
        />
        {current !== null && (
          <span
            className={styles.preview}
            style={{ background: swatch(current) }}
            aria-hidden="true"
          />
        )}
        <button
          type="button"
          className={styles.reset}
          onClick={() => {
            setHue("");
            setHex("");
            setHexError(false);
          }}
        >
          Zurücksetzen
        </button>
      </div>

      <p className={hexError ? styles.error : styles.hint}>
        {hexError
          ? "Das ist kein Hex-Code. Erwartet wird etwas wie #7c4dff."
          : (hint ??
            "Palette anklicken oder Hex-Code eingeben. Leer lassen für das VoltFM-Standardviolett.")}
      </p>

      {/* Gespeichert wird der Farbton, nicht der Hex-Code. */}
      <input type="hidden" name={name} value={hue} />
    </div>
  );
}
