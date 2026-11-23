"use server";

import { revalidatePath } from "next/cache";

import { ideaApprovals } from "@/db/collections";
import { assertAdmin, assertCan, AuthorizationError } from "@/lib/session";
import { isIdeaKind } from "@/lib/ideas";
import type { EntityFormState } from "@/components/admin/entity-types";

/**
 * Gibt einen Vorschlag oder eine Playlist-Idee für die Seite frei — oder
 * nimmt die Freigabe zurück. Gespeichert wird nur die Nachrichten-ID, nicht
 * der Text. Wer Beiträge veröffentlichen darf, darf auch das.
 */
export async function setIdeaApproval(
  _prev: EntityFormState,
  formData: FormData,
): Promise<EntityFormState> {
  let name: string;
  try {
    await assertAdmin();
    const user = await assertCan("article", ["publish"]);
    name = user.name || (user as { username?: string }).username || "Admin";
  } catch (error) {
    if (error instanceof AuthorizationError) return { status: "error", message: error.message };
    throw error;
  }

  const messageId = String(formData.get("messageId") ?? "");
  const kind = String(formData.get("kind") ?? "");
  const approve = formData.get("approve") === "1";
  if (!/^\d{5,25}$/.test(messageId) || !isIdeaKind(kind)) {
    return { status: "error", message: "Unbekannter Eintrag." };
  }

  try {
    if (approve) {
      await ideaApprovals().updateOne(
        { messageId },
        { $set: { kind, approvedAt: new Date(), approvedBy: name } },
        { upsert: true },
      );
    } else {
      await ideaApprovals().deleteOne({ messageId });
    }
  } catch (error) {
    console.error("[admin] Freigabe nicht gespeichert", error);
    return { status: "error", message: "Speichern hat nicht geklappt. Versuch es gleich noch einmal." };
  }

  revalidatePath("/mitmachen");
  revalidatePath("/admin/ideen");
  return { status: "success", message: approve ? "Steht jetzt auf /mitmachen." : "Nicht mehr auf der Seite." };
}
