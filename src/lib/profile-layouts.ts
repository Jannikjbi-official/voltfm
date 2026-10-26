/**
 * Die Aufbauten fuer Moderatorenprofile.
 *
 * Steht ausserhalb von admin/moderatoren/actions.ts, weil eine "use server"-
 * Datei nur async Funktionen exportieren darf — und Admin, Action und
 * Profilseite dieselbe Liste brauchen.
 */
export const PROFILE_LAYOUTS = [
  { value: "buehne", label: "Bühne" },
  { value: "poster", label: "Poster" },
  { value: "karte", label: "Karte" },
] as const;

export type ProfileLayout = (typeof PROFILE_LAYOUTS)[number]["value"];

export const PROFILE_LAYOUT_VALUES = PROFILE_LAYOUTS.map((layout) => layout.value) as [
  ProfileLayout,
  ...ProfileLayout[],
];

export const DEFAULT_PROFILE_LAYOUT: ProfileLayout = "buehne";

/**
 * Die Werte von vor dem Umbau im Oktober 2026. Sie bleiben bewusst in der
 * Datenbank stehen und werden erst beim Lesen umgestellt: Vorschau und
 * Production teilen sich die Datenbank, und die alte Production-Fassung kennt
 * die neuen Werte nicht — eine Migration haette dort die Profile zerlegt.
 */
const LEGACY_LAYOUTS: Record<string, ProfileLayout> = {
  spotlight: "buehne",
  editorial: "karte",
  stage: "poster",
  zine: "poster",
};

export function normalizeProfileLayout(value: unknown): ProfileLayout {
  if (typeof value !== "string") return DEFAULT_PROFILE_LAYOUT;
  if ((PROFILE_LAYOUT_VALUES as string[]).includes(value)) return value as ProfileLayout;
  return LEGACY_LAYOUTS[value] ?? DEFAULT_PROFILE_LAYOUT;
}
