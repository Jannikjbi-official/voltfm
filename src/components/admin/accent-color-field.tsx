"use client";

import { useId, useState } from "react";
import { cn } from "@heroui/react";

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
  const labelId = useId();
  const hintId = useId();

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
    <div role="group" aria-labelledby={labelId} className="flex min-w-0 flex-col gap-2">
      <span id={labelId} className="label">
        {label}
      </span>

      <ul className="grid grid-cols-6 gap-2.5">
        {PRESETS.map((preset) => (
          <li key={preset.hue}>
            <button
              type="button"
              /* Die Farbe ist ein Wert aus der Palette — nur sie wird als
                 Variable gesetzt, das Aussehen kommt aus den Klassen. */
              style={{ "--swatch": swatch(preset.hue) } as React.CSSProperties}
              className={cn(
                "block aspect-square w-full rounded-full bg-[var(--swatch)] ring-offset-2 ring-offset-[var(--surface-secondary)] transition-transform hover:scale-105 motion-reduce:transition-none",
                current === preset.hue && "ring-2 ring-foreground",
              )}
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

      <div className="flex items-center gap-2">
        <input
          value={hex}
          onChange={(event) => applyHex(event.target.value)}
          placeholder="#7c4dff"
          aria-label="Eigene Farbe als Hex-Code"
          aria-describedby={hintId}
          aria-invalid={hexError || undefined}
          data-invalid={hexError ? "true" : undefined}
          maxLength={7}
          className="input w-full min-w-0 flex-1 font-mono"
        />
        {current !== null && (
          <span
            style={{ "--swatch": swatch(current) } as React.CSSProperties}
            className="size-9 shrink-0 rounded-full bg-[var(--swatch)] ring-1 ring-border"
            aria-hidden="true"
          />
        )}
        <button
          type="button"
          className="h-9 shrink-0 rounded-full bg-default px-3.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-tertiary"
          onClick={() => {
            setHue("");
            setHex("");
            setHexError(false);
          }}
        >
          Zurücksetzen
        </button>
      </div>

      <p id={hintId} className={hexError ? "text-xs font-medium text-danger" : "description"}>
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
