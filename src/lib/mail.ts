import "server-only";
import nodemailer from "nodemailer";
import { site } from "@/lib/site";

/**
 * Versand ueber den eigenen Mailserver (Stalwart). Angemeldet wird mit dem
 * Postfach aus SMTP_USER, damit SPF, DKIM und DMARC fuer voltfm.xyz passen.
 *
 * .env:
 *   SMTP_HOST=mail.tokigame.com   SMTP_PORT=465
 *   SMTP_USER=kontakt@voltfm.xyz  SMTP_PASS=…
 *   CONTACT_TO=kontakt@voltfm.xyz (optional, Standard: site.stationEmail)
 */
export function isMailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

let transport: nodemailer.Transporter | null = null;
function getTransport() {
  if (!transport) {
    const port = Number(process.env.SMTP_PORT ?? 465);
    transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transport;
}

type ContactMail = { name: string; email: string; subject: string; message: string };

/** Schickt eine Kontaktanfrage an das Stationspostfach. "Antworten" geht direkt an die Person. */
export async function sendContactMail(c: ContactMail) {
  const from = process.env.SMTP_FROM ?? `VoltFM Kontaktformular <${process.env.SMTP_USER}>`;
  const to = process.env.CONTACT_TO ?? site.stationEmail;
  const oneLine = (s: string) => s.replace(/[\r\n]+/g, " ").trim();
  await getTransport().sendMail({
    from,
    to,
    replyTo: { name: oneLine(c.name), address: c.email },
    subject: `[Kontakt] ${oneLine(c.subject)}`,
    text: [
      `Neue Nachricht über das Kontaktformular auf ${site.canonicalUrl}/kontakt`,
      "",
      `Name:    ${oneLine(c.name)}`,
      `E-Mail:  ${c.email}`,
      `Betreff: ${oneLine(c.subject)}`,
      "",
      c.message,
      "",
      "—",
      "Einfach auf „Antworten“ klicken, die Antwort geht direkt an die Person.",
    ].join("\n"),
  });
}
