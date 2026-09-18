"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Icon, ImageIcon, LoadingIcon, DeleteIcon } from "@/lib/icons";
import { useUploadThing } from "@/lib/uploadthing";
import styles from "./admin-form.module.css";

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

  const { startUpload, isUploading } = useUploadThing(endpoint, {
    onClientUploadComplete: (res) => {
      const uploaded = res?.[0]?.serverData?.url ?? res?.[0]?.ufsUrl;
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
    <div className={styles.upload}>
      <span className={styles.label}>{label}</span>

      {url ? (
        <div className={styles.preview}>
          <Image src={url} alt="" width={320} height={180} className={styles.previewImage} unoptimized />
          <Button
            type="button"
            variant="error"
            mode="ghost"
            size="sm"
            onClick={() => setUrl("")}
          >
            <Icon icon={DeleteIcon} />
            Entfernen
          </Button>
        </div>
      ) : (
        <div className={styles.dropzone}>
          <Icon icon={ImageIcon} className={styles.dropIcon} />
          <p className={styles.dropText}>Noch kein Bild ausgewählt</p>
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
        variant="neutral"
        mode="stroke"
        size="sm"
        disabled={isUploading}
        onClick={() => inputRef.current?.click()}
      >
        <Icon icon={isUploading ? LoadingIcon : ImageIcon} spin={isUploading} />
        {isUploading ? "Wird hochgeladen …" : url ? "Bild ersetzen" : "Bild hochladen"}
      </Button>

      {error && <p className={styles.error}>{error}</p>}

      {/* The value the surrounding form actually submits. */}
      <input type="hidden" name={name} value={url} />
    </div>
  );
}
