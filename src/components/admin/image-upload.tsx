"use client";

import { useId, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@heroui/react";
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

  return (
    <div role="group" aria-labelledby={labelId} className="flex min-w-0 flex-col gap-2">
      <span id={labelId} className="label">
        {label}
      </span>

      {url ? (
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <Image
            src={url}
            alt=""
            width={320}
            height={180}
            className="aspect-video w-full object-cover"
            unoptimized
          />
          <div className="flex justify-end p-1.5">
            <Button type="button" variant="danger-soft" size="sm" onPress={() => setUrl("")}>
              <Icon icon={DeleteIcon} />
              Entfernen
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex aspect-video flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-surface text-muted">
          <Icon icon={ImageIcon} className="text-xl" />
          <p className="text-xs">Noch kein Bild ausgewählt</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void startUpload([file]);
        }}
      />

      <Button
        type="button"
        variant="tertiary"
        size="sm"
        isDisabled={isUploading}
        onPress={() => inputRef.current?.click()}
      >
        <Icon icon={isUploading ? LoadingIcon : ImageIcon} spin={isUploading} />
        {isUploading ? "Wird hochgeladen …" : url ? "Bild ersetzen" : "Bild hochladen"}
      </Button>

      {error && <p className="text-xs font-medium text-danger">{error}</p>}

      {/* The value the surrounding form actually submits. */}
      <input type="hidden" name={name} value={url} />
    </div>
  );
}
