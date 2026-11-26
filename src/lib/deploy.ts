/**
 * Wo laeuft die Seite gerade?
 *
 * VoltFM laeuft auf einem eigenen Server, nicht mehr auf Vercel. Dort sagt
 * `VOLTFM_ENV`, welche Umgebung das ist:
 *   VOLTFM_ENV=production  → voltfm.xyz (darf in den Discord posten,
 *                            wird von Suchmaschinen gelistet)
 *   VOLTFM_ENV=dev         → Testseite (postet nichts, noindex)
 * Ohne VOLTFM_ENV gilt wie bisher `VERCEL_ENV`, falls es eine Vercel-Umgebung
 * gibt. Ist beides leer, ist es ein lokaler Rechner.
 *
 * Absichtlich ohne "server-only": next.config.ts und die Skripte lesen das auch.
 */
export type DeployEnv = "production" | "preview" | "local";

export function deployEnv(): DeployEnv {
  const own = process.env.VOLTFM_ENV?.trim().toLowerCase();
  if (own === "production" || own === "prod") return "production";
  if (own) return "preview";
  if (process.env.VERCEL_ENV === "production") return "production";
  if (process.env.VERCEL_ENV) return "preview";
  return "local";
}

/** Die echte Seite voltfm.xyz. */
export function isProductionDeploy(): boolean {
  return deployEnv() === "production";
}

/** Eine Test- oder Vorschauseite (nicht lokal, nicht Production). */
export function isPreviewDeploy(): boolean {
  return deployEnv() === "preview";
}
