"use client";

import { useId, useState } from "react";
import { Button } from "@heroui/react";
import { TextField } from "@/components/common/form-field";
import { Icon, PlusIcon, DeleteIcon } from "@/lib/icons";
import { ImageUpload } from "./image-upload";

type GalleryImage = { url: string; alt: string };

/** Der gespeicherte Wert als Liste — kaputtes JSON heißt: keine Bilder. */
function parse(value: string): GalleryImage[] {
  try {
    const list: unknown = JSON.parse(value || "[]");
    if (!Array.isArray(list)) return [];
    return list
      .filter((entry): entry is GalleryImage => typeof entry?.url === "string")
      .map((entry) => ({ url: entry.url, alt: typeof entry.alt === "string" ? entry.alt : "" }));
  } catch {
    return [];
  }
}

/**
 * Mehrere Bilder, jedes mit eigener Beschreibung. Jede Zeile schickt
 * `<name>Url` und `<name>Alt` ins FormData; die Action liest beides mit
 * `getAll` in derselben Reihenfolge. Hochgeladen wird über `ImageUpload`,
 * gespeichert also nur `/api/bilder/<kennung>`.
 */
export function GalleryField({
  name,
  label,
  hint,
  defaultValue,
  max = 6,
}: {
  name: string;
  label: string;
  hint?: string;
  defaultValue: string;
  max?: number;
}) {
  const labelId = useId();
  const [slots, setSlots] = useState(() =>
    parse(defaultValue)
      .slice(0, max)
      .map((image, index) => ({ key: `bild-${index}`, ...image })),
  );
  const [next, setNext] = useState(slots.length);

  function add() {
    setSlots((current) => [...current, { key: `bild-${next}`, url: "", alt: "" }]);
    setNext((value) => value + 1);
  }

  return (
    <div role="group" aria-labelledby={labelId} className="flex min-w-0 flex-col gap-2">
      <span id={labelId} className="label font-mono text-xs font-medium lowercase text-foreground">
        {label}
      </span>
      {hint && <p className="description text-xs text-muted">{hint}</p>}

      {slots.length > 0 && (
        <ul className="grid gap-2 sm:grid-cols-2">
          {slots.map((slot, index) => (
            <li key={slot.key} className="well flex min-w-0 flex-col gap-2 rounded-[var(--radius)] p-2">
              <ImageUpload name={`${name}Url`} value={slot.url || undefined} label={`Bild ${index + 1}`} />
              <TextField
                name={`${name}Alt`}
                label="Was ist zu sehen?"
                defaultValue={slot.alt}
                maxLength={200}
                placeholder="Beschreibung für alle, die das Bild nicht sehen"
              />
              <Button
                type="button"
                size="sm"
                variant="tertiary"
                className="self-start"
                onPress={() => setSlots((current) => current.filter((entry) => entry.key !== slot.key))}
              >
                <Icon icon={DeleteIcon} />
                Zeile entfernen
              </Button>
            </li>
          ))}
        </ul>
      )}

      {slots.length < max && (
        <Button type="button" size="sm" variant="secondary" className="self-start" onPress={add}>
          <Icon icon={PlusIcon} />
          Bild hinzufügen
        </Button>
      )}
    </div>
  );
}
