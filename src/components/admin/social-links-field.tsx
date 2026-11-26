"use client";

import { useId, useState } from "react";
import { Button } from "@heroui/react";
import { Icon, PlusIcon, DeleteIcon } from "@/lib/icons";

/**
 * Bekannte Plattformen mit dem Anfang ihrer Adresse.
 *
 * Der Präfix wird beim Auswählen vorgesetzt, damit man nur noch den
 * Benutzernamen tippt. "Andere" lässt jede Adresse zu — die Liste soll nicht
 * zur Hürde werden, nur weil eine Plattform fehlt.
 */
const PLATFORMS = [
  { label: "Discord", prefix: "https://discord.gg/" },
  { label: "Instagram", prefix: "https://instagram.com/" },
  { label: "TikTok", prefix: "https://tiktok.com/@" },
  { label: "YouTube", prefix: "https://youtube.com/@" },
  { label: "Twitch", prefix: "https://twitch.tv/" },
  { label: "X", prefix: "https://x.com/" },
  { label: "Bluesky", prefix: "https://bsky.app/profile/" },
  { label: "SoundCloud", prefix: "https://soundcloud.com/" },
  { label: "Spotify", prefix: "https://open.spotify.com/user/" },
  { label: "Website", prefix: "https://" },
  { label: "Andere", prefix: "" },
] as const;

interface Row {
  label: string;
  url: string;
}

/** "Label|URL" je Zeile — das Format, das die Server Action erwartet. */
function parse(value: string): Row[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, ...rest] = line.split("|");
      return { label: (label ?? "").trim(), url: rest.join("|").trim() };
    });
}

function serialize(rows: Row[]): string {
  return rows
    .filter((row) => row.label.trim() && row.url.trim())
    .map((row) => `${row.label.trim()}|${row.url.trim()}`)
    .join("\n");
}

/**
 * Social-Links als Zeilen aus Plattform und Adresse.
 *
 * Vorher war das ein Textfeld, in das man "Label|URL" pro Zeile tippen musste
 * — funktioniert, aber man muss das Format kennen und ein Tippfehler im
 * Trennzeichen verwirft die Zeile stillschweigend. Abgeschickt wird weiterhin
 * dasselbe Format, nur über ein verstecktes Feld.
 */
export function SocialLinksField({
  name,
  defaultValue = "",
}: {
  name: string;
  defaultValue?: string;
}) {
  const [rows, setRows] = useState<Row[]>(() => parse(defaultValue));
  const labelId = useId();

  function update(index: number, patch: Partial<Row>) {
    setRows((current) =>
      current.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
  }

  /** Beim Plattformwechsel die Adresse vorbelegen, sofern noch nichts drinsteht. */
  function choosePlatform(index: number, label: string) {
    const platform = PLATFORMS.find((p) => p.label === label);
    setRows((current) =>
      current.map((row, i) => {
        if (i !== index) return row;
        const untouched = !row.url || PLATFORMS.some((p) => p.prefix && row.url === p.prefix);
        return { label, url: untouched ? (platform?.prefix ?? "") : row.url };
      }),
    );
  }

  return (
    <div role="group" aria-labelledby={labelId} className="flex min-w-0 flex-col gap-2">
      <span id={labelId} className="label font-mono text-xs font-medium lowercase text-foreground">
        Social Links
      </span>

      {rows.length > 0 && (
        <ul className="flex flex-col gap-2">
          {rows.map((row, index) => {
            const custom = !PLATFORMS.some((p) => p.label === row.label) || row.label === "Andere";
            return (
              <li
                key={index}
                className="well grid grid-cols-[minmax(0,1fr)_auto] gap-2 rounded-[var(--radius)] p-2 sm:grid-cols-[9.5rem_minmax(0,1fr)_auto] sm:items-center"
              >
                <div className="relative">
                  <select
                    value={PLATFORMS.some((p) => p.label === row.label) ? row.label : "Andere"}
                    onChange={(event) => choosePlatform(index, event.target.value)}
                    className="input w-full appearance-none pr-8"
                    aria-label="Plattform"
                  >
                    {PLATFORMS.map((platform) => (
                      <option key={platform.label} value={platform.label}>
                        {platform.label}
                      </option>
                    ))}
                  </select>
                  <svg
                    viewBox="0 0 16 16"
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted"
                  >
                    <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  isIconOnly
                  aria-label="Zeile entfernen"
                  className="text-danger sm:order-last"
                  onPress={() => setRows((current) => current.filter((_, i) => i !== index))}
                >
                  <Icon icon={DeleteIcon} />
                </Button>

                <div className="col-span-2 flex min-w-0 flex-col gap-2 sm:col-span-1 sm:flex-row">
                  {/* Bei "Andere" braucht es eine eigene Beschriftung. */}
                  {custom ? (
                    <input
                      value={row.label === "Andere" ? "" : row.label}
                      onChange={(event) => update(index, { label: event.target.value })}
                      placeholder="Beschriftung"
                      aria-label="Beschriftung"
                      className="input w-full sm:w-36"
                    />
                  ) : null}
                  <input
                    value={row.url}
                    onChange={(event) => update(index, { url: event.target.value })}
                    placeholder="https://…"
                    aria-label="Adresse"
                    className="input w-full min-w-0 flex-1"
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div>
        <Button
          type="button"
          variant="tertiary"
          size="sm"
          onPress={() =>
            setRows((current) => [...current, { label: "Discord", url: "https://discord.gg/" }])
          }
        >
          <Icon icon={PlusIcon} />
          Link hinzufügen
        </Button>
      </div>

      <p className="description">Zeilen ohne Adresse werden beim Speichern verworfen.</p>

      {/* Das, was tatsächlich abgeschickt wird. */}
      <input type="hidden" name={name} value={serialize(rows)} />
    </div>
  );
}
