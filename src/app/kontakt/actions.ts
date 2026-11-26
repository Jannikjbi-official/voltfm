"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { contactMessages } from "@/db/collections";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { isMailConfigured, sendContactMail } from "@/lib/mail";
import { site } from "@/lib/site";

/**
 * Contact form submission.
 *
 * Validated server-side with the same schema the client uses, rate limited per
 * IP, and protected by a honeypot field. Nothing here trusts the client.
 */

/* Nicht exportiert: Eine "use server"-Datei darf nur async-Funktionen
   exportieren, sonst bricht jeder Aufruf der Action ab. */
const contactSchema = z.object({
  name: z.string().trim().min(2, "Bitte gib deinen Namen an.").max(80),
  email: z.string().trim().email("Bitte gib eine gültige E-Mail-Adresse an.").max(160),
  subject: z.string().trim().min(3, "Bitte gib einen Betreff an.").max(120),
  message: z
    .string()
    .trim()
    .min(20, "Bitte schreib uns mindestens ein paar Sätze (min. 20 Zeichen).")
    .max(4000, "Die Nachricht ist zu lang (max. 4000 Zeichen)."),
  privacy: z.literal("on", {
    message: "Bitte stimme der Datenschutzerklärung zu.",
  }),
  /** Honeypot: a real person never fills a field they cannot see. */
  website: z.string().max(0).optional(),
});

export type ContactState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<"name" | "email" | "subject" | "message" | "privacy", string>>;
};

export async function submitContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  /* Das Formular ist abgeschaltet, Anfragen laufen ueber Discord. Die Pruefung
     steht hier und nicht nur in der Oberflaeche: eine Server Action ist ein
     POST, den man auch ohne unser Formular abschicken kann. */
  if (!site.contactFormEnabled) {
    return {
      status: "error",
      message:
        "Das Kontaktformular ist derzeit deaktiviert. Bitte oeffne ein Ticket in unserem Discord.",
    };
  }

  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
    privacy: formData.get("privacy"),
    website: formData.get("website") ?? "",
  });

  if (!parsed.success) {
    const fieldErrors: ContactState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && key !== "website") {
        fieldErrors[key as keyof NonNullable<ContactState["fieldErrors"]>] ??= issue.message;
      }
    }
    // A tripped honeypot reports success: telling a bot it was detected only
    // helps it try again differently.
    if (parsed.error.issues.some((i) => i.path[0] === "website")) {
      return { status: "success", message: "Danke! Deine Nachricht ist bei uns angekommen." };
    }
    return {
      status: "error",
      message: "Bitte prüfe die markierten Felder.",
      fieldErrors,
    };
  }

  const requestHeaders = await headers();
  const limit = rateLimit(clientKey(requestHeaders, "contact"), 3, 600);
  if (!limit.ok) {
    return {
      status: "error",
      message: `Zu viele Anfragen. Bitte versuch es in ${Math.ceil(limit.retryAfterSeconds / 60)} Minuten erneut.`,
    };
  }

  let stored = false;
  try {
    await contactMessages().insertOne({
      name: parsed.data.name,
      email: parsed.data.email,
      subject: parsed.data.subject,
      message: parsed.data.message,
      handled: false,
      createdAt: new Date(),
    });
    stored = true;
  } catch (error) {
    console.error("[contact] insert failed", error);
  }

  /* Zusaetzlich per Mail ans Stationspostfach. Klappt einer der beiden Wege,
     ist die Nachricht angekommen. */
  let mailed = false;
  if (isMailConfigured()) {
    try {
      await sendContactMail(parsed.data);
      mailed = true;
    } catch (error) {
      console.error("[contact] mail failed", error);
    }
  }

  if (!stored && !mailed) {
    return {
      status: "error",
      message: "Die Nachricht konnte nicht gesendet werden. Bitte versuch es später erneut.",
    };
  }

  return {
    status: "success",
    message: "Danke! Deine Nachricht ist bei uns angekommen. Wir melden uns.",
  };
}
