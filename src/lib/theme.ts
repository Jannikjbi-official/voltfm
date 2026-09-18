/**
 * Theme constants shared by the server and the client.
 *
 * The theme is stored in a cookie rather than localStorage so the server knows
 * it while rendering: `data-theme` is already correct in the HTML it sends, and
 * there is no flash and no hydration mismatch. localStorage cannot do that —
 * it is invisible to the server.
 */

export const THEME_COOKIE = "voltfm-theme";
export const THEME_MAX_AGE = 60 * 60 * 24 * 365;

export type Theme = "light" | "dark";

/** Light is the default: an unknown visitor gets the light design. */
export const DEFAULT_THEME: Theme = "light";

export function normalizeTheme(value: string | undefined | null): Theme {
  return value === "dark" ? "dark" : "light";
}
