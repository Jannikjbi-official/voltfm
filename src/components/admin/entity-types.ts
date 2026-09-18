/**
 * Shared shapes for the generic admin CRUD screens.
 *
 * Categories, hosts, shows and events are all "list plus form" surfaces with
 * the same mechanics, so they share one UI driven by a field description
 * instead of four near-identical forms.
 */

export type EntityFormState = {
  status: "idle" | "error" | "success";
  message?: string;
};

export type FieldType =
  | "text"
  | "textarea"
  /** Textarea plus the formatting toolbar and the image wrapper. */
  | "rich"
  | "number"
  | "select"
  | "checkbox"
  | "image"
  | "time"
  | "datetime";

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  /** For `select`. */
  options?: { value: string; label: string }[];
  /** Renders in the narrow side column instead of the main column. */
  side?: boolean;
  rows?: number;
  min?: number;
  max?: number;
  /** Prefilled when creating a new entry (an existing row always wins). */
  defaultValue?: string | number | boolean;
}

/** A row in the list under the form. */
export interface EntityRow {
  id: string;
  title: string;
  meta?: string;
  badge?: string;
  /** Raw values used to populate the form when editing. */
  values: Record<string, string | number | boolean | null | undefined>;
}
