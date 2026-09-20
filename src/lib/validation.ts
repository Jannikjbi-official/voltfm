import { z } from "zod";

/**
 * Eine Bildadresse: entweder vollständig, oder der eigene Bild-Endpunkt.
 *
 * Hochgeladene Bilder werden seit dem eigenen Endpunkt als
 * `/api/bilder/<kennung>` gespeichert — `z.string().url()` würde die
 * zurückweisen. Fremde Adressen (Discord-Avatare, ältere Uploads) bleiben
 * erlaubt, aber nur mit Schema, damit hier nichts Beliebiges hineinrutscht.
 */
export const imageUrl = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || /^https:\/\//.test(value) || /^\/api\/bilder\/[A-Za-z0-9_-]{16,64}$/.test(value),
    "Das ist keine gültige Bildadresse.",
  );
