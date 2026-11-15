/**
 * Theme constants shared by the server and the client.
 *
 * The theme is stored in a cookie rather than localStorage so the server knows
 * it while rendering: `data-theme` and the `dark`/`light` class (HeroUI keys
 * its colours off both) are already correct in the HTML it sends, and
 * there is no flash and no hydration mismatch. localStorage cannot do that —
 * it is invisible to the server.
 */

export const THEME_COOKIE = "voltfm-theme";
export const THEME_MAX_AGE = 60 * 60 * 24 * 365;

export type Theme = "light" | "dark";

/** Dunkel ist der Standard: Wer noch nichts gewaehlt hat, bekommt das dunkle Design. */
export const DEFAULT_THEME: Theme = "dark";

export function normalizeTheme(value: string | undefined | null): Theme {
  return value === "light" ? "light" : "dark";
}
