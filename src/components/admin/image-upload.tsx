"use client";

import { useId, useRef, useState } from "react";
import Image from "next/image";
import { Button, cn } from "@heroui/react";
import { Icon, ImageIcon, LoadingIcon, DeleteIcon } from "@/lib/icons";
import { useUploadThing } from "@/lib/uploadthing";

/**
 * Image picker backed by UploadThing.
 *
 * Uploads go straight from the browser to UploadThing; the server only ever
 * authorises the upload and records the resulting URL. The chosen URL is kept
 * in a hidden input so the surrounding form posts it like any other field.
 */
export function ImageUpload({
  name,
  value,
  label,
  endpoint = "contentImage",
}: {
  name: string;
  value?: string;
  label: string;
  endpoint?: "articleImage" | "contentImage";
}) {
  const [url, setUrl] = useState(value ?? "");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const labelId = useId();

  const { startUpload, isUploading } = useUploadThing(endpoint, {
    onClientUploadComplete: (res) => {
      // Bewusst kein Rueckfall auf res[0].ufsUrl: Das waere die Adresse des
      // Anbieters, und genau die soll nirgends gespeichert werden.
      const uploaded = res?.[0]?.serverData?.url;
      if (uploaded) setUrl(uploaded);
      setError(null);
    },
    onUploadError: (uploadError) => {
      setError(
        uploadError.message.includes("Berechtigung")
          ? "Keine Berechtigung zum Hochladen."
          : "Upload fehlgeschlagen. Ist UPLOADTHING_TOKEN gesetzt?",
      );
    },
  });

  const [dragOver, setDragOver] = useState(false);

  function pick(files: FileList | null | undefined) {
    const file = Array.from(files ?? []).find((entry) => entry.type.startsWith("image/"));
    if (file) void startUpload([file]);
  }

  return (
    <div role="group" aria-labelledby={labelId} className="flex min-w-0 flex-col gap-2">
      <span id={labelId} className="label">
        {label}
      </span>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(event) => {
          pick(event.target.files);
          // Damit dieselbe Datei ein zweites Mal ausgewaehlt werden kann.
          event.target.value = "";
        }}
      />

      {url ? (
        <div className="group relative overflow-hidden rounded-2xl bg-surface-secondary">
          <Image
            src={url}
            alt=""
            width={480}
            height={270}
            className="aspect-video w-full object-cover"
            unoptimized
          />
          {isUploading && (
            <div className="absolute inset-0 grid place-items-center bg-ink/60 text-paper">
              <Icon icon={LoadingIcon} spin className="text-lg" />
            </div>
          )}
          <div className="absolute right-2 bottom-2 flex gap-1.5">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              isDisabled={isUploading}
              className="bg-ink/75 text-paper backdrop-blur hover:bg-ink"
              onPress={() => inputRef.current?.click()}
            >
              <Icon icon={ImageIcon} />
              Ersetzen
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              isIconOnly
              aria-label="Bild entfernen"
              className="bg-ink/75 text-paper backdrop-blur hover:bg-danger hover:text-danger-foreground"
              onPress={() => setUrl("")}
            >
              <Icon icon={DeleteIcon} />
            </Button>
          </div>
        </div>
      ) : (
        /* Die ganze Flaeche ist der Knopf — Klick oder Datei hineinziehen. */
        <button
          type="button"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            if (!event.dataTransfer?.types.includes("Files")) return;
            event.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragOver(false);
            pick(event.dataTransfer?.files);
          }}
          className={cn(
            "flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed text-muted transition-colors outline-none focus-visible:ring-2 focus-visible:ring-focus",
            dragOver
              ? "border-volt bg-accent-soft text-foreground"
              : "border-[color-mix(in_oklab,var(--foreground)_18%,transparent)] bg-surface-secondary hover:border-[color-mix(in_oklab,var(--foreground)_35%,transparent)] hover:text-foreground",
          )}
        >
          <span className="grid size-10 place-items-center rounded-xl bg-surface text-sm">
            <Icon icon={isUploading ? LoadingIcon : ImageIcon} spin={isUploading} />
          </span>
          <span className="text-sm font-semibold">{isUploading ? "Wird hochgeladen …" : "Bild hochladen"}</span>
          <span className="text-xs">oder hierher ziehen</span>
        </button>
      )}

      {error && <p className="text-xs font-medium text-danger">{error}</p>}

      {/* The value the surrounding form actually submits. */}
      <input type="hidden" name={name} value={url} />
    </div>
  );
}
