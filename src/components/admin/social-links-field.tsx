"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon, PlusIcon, DeleteIcon } from "@/lib/icons";
import styles from "./social-links-field.module.css";
import formStyles from "./admin-form.module.css";

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
    <div className={styles.field}>
      <span className={formStyles.label}>Social Links</span>

      {rows.length > 0 && (
        <ul className={styles.rows} role="list">
          {rows.map((row, index) => (
            <li key={index} className={styles.row}>
              <select
                value={PLATFORMS.some((p) => p.label === row.label) ? row.label : "Andere"}
                onChange={(event) => choosePlatform(index, event.target.value)}
                className={`${formStyles.select} ${styles.platform}`}
                aria-label="Plattform"
              >
                {PLATFORMS.map((platform) => (
                  <option key={platform.label} value={platform.label}>
                    {platform.label}
                  </option>
                ))}
              </select>

              {/* Bei "Andere" braucht es eine eigene Beschriftung. */}
              {!PLATFORMS.some((p) => p.label === row.label) || row.label === "Andere" ? (
                <Input
                  value={row.label === "Andere" ? "" : row.label}
                  onChange={(event) => update(index, { label: event.target.value })}
                  placeholder="Beschriftung"
                  aria-label="Beschriftung"
                  className={styles.custom}
                />
              ) : null}

              <Input
                value={row.url}
                onChange={(event) => update(index, { url: event.target.value })}
                placeholder="https://…"
                aria-label="Adresse"
                className={styles.url}
              />

              <Button
                type="button"
                variant="error"
                mode="ghost"
                size="sm"
                asIcon
                aria-label="Zeile entfernen"
                onClick={() => setRows((current) => current.filter((_, i) => i !== index))}
              >
                <Icon icon={DeleteIcon} />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <Button
        type="button"
        variant="neutral"
        mode="stroke"
        size="sm"
        onClick={() =>
          setRows((current) => [...current, { label: "Discord", url: "https://discord.gg/" }])
        }
      >
        <Icon icon={PlusIcon} />
        Link hinzufügen
      </Button>

      <p className={styles.hint}>
        Zeilen ohne Adresse werden beim Speichern verworfen.
      </p>

      {/* Das, was tatsächlich abgeschickt wird. */}
      <input type="hidden" name={name} value={serialize(rows)} />
    </div>
  );
}
