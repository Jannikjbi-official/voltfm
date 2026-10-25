import { z } from "zod";

/**
 * Eine Bildadresse: entweder vollständig, der eigene Bild-Endpunkt oder ein
 * mitgeliefertes Titelbild.
 *
 * Hochgeladene Bilder werden seit dem eigenen Endpunkt als
 * `/api/bilder/<kennung>` gespeichert — `z.string().url()` würde die
 * zurückweisen. Titelbilder, die mit der Seite ausgeliefert werden, liegen
 * unter `public/titelbilder/` (z. B. die per Migration angelegten Beiträge);
 * ohne diese Ausnahme liesse sich so ein Beitrag im Admin nicht mehr
 * speichern. Fremde Adressen (Discord-Avatare, ältere Uploads) bleiben
 * erlaubt, aber nur mit Schema, damit hier nichts Beliebiges hineinrutscht.
 */
export const imageUrl = z
  .string()
  .trim()
  .refine(
    (value) =>
      value === "" ||
      /^https:\/\//.test(value) ||
      /^\/api\/bilder\/[A-Za-z0-9_-]{16,64}$/.test(value) ||
      /^\/titelbilder\/[a-z0-9-]+\.(png|jpe?g|webp)$/.test(value),
    "Das ist keine gültige Bildadresse.",
  );
