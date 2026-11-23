"use server";

import { headers } from "next/headers";
import { z } from "zod";

import { clientKey, rateLimit } from "@/lib/rate-limit";
import { IDEA_NAME_MAX, IDEA_TEXT_MAX, IDEA_TEXT_MIN } from "@/lib/ideas";
import { postIdea } from "@/services/discord/ideas";
import type { IdeaState } from "./idea-state";

/* Nicht exportiert: Eine "use server"-Datei darf nur async-Funktionen
   exportieren. Den Zustandstyp gibt es in ./idea-state.ts. */
const ideaSchema = z.object({
  kind: z.enum(["vorschlag", "playlist"], { message: "Bitte wähl aus, was es ist." }),
  name: z.string().trim().min(2, "Bitte gib einen Namen an.").max(IDEA_NAME_MAX),
  text: z
    .string()
    .trim()
    .min(IDEA_TEXT_MIN, "Ein paar Worte mehr, bitte.")
    .max(IDEA_TEXT_MAX, `Höchstens ${IDEA_TEXT_MAX} Zeichen.`),
  privacy: z.literal("on", { message: "Ohne dein Einverständnis können wir es nicht weitergeben." }),
  website: z.string().max(0).optional(),
});

/** Steuerzeichen raus, höchstens eine Leerzeile am Stück. */
function tidy(value: string): string {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Vorschlag oder Playlist-Idee aus dem Formular auf /mitmachen: geprüft auf
 * dem Server, begrenzt je IP, mit Honigtopf — und dann als Karte in den
 * passenden Discord-Kanal. Gespeichert wird auf voltfm.xyz nichts.
 */
export async function submitIdea(_prev: IdeaState, formData: FormData): Promise<IdeaState> {
  const parsed = ideaSchema.safeParse({
    kind: formData.get("kind"),
    name: formData.get("name"),
    text: formData.get("text"),
    privacy: formData.get("privacy") ?? undefined,
    website: formData.get("website") ?? "",
  });

  if (!parsed.success) {
    // Ein ausgelöster Honigtopf meldet Erfolg — einem Bot sagt man nicht, dass er erkannt wurde.
    if (parsed.error.issues.some((issue) => issue.path[0] === "website")) {
      return { status: "success", message: "Danke, ist angekommen." };
    }
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { status: "error", message: "Bitte prüf die markierten Felder.", fieldErrors };
  }

  const limit = rateLimit(clientKey(await headers(), "idea"), 3, 600);
  if (!limit.ok) {
    return {
      status: "error",
      message: `Zu viele Einsendungen. Versuch es in ${Math.ceil(limit.retryAfterSeconds / 60)} Minuten noch einmal.`,
    };
  }

  const result = await postIdea(parsed.data.kind, tidy(parsed.data.name), tidy(parsed.data.text));
  switch (result) {
    case "ok":
      return { status: "success", message: "Danke, ist angekommen. Wir schauen es uns im Discord an." };
    case "testseite":
      return { status: "info", message: "Das hier ist die Testseite, deshalb ist nichts im Discord gelandet." };
    default:
      return {
        status: "error",
        message: "Gerade klappt das Senden nicht. Schreib es uns gern direkt im Discord.",
      };
  }
}
