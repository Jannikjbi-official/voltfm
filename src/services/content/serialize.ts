import type { WithId } from "mongodb";

/**
 * Mongo documents carry ObjectId and Date values that a Server Component cannot
 * hand to a Client Component. Everything crossing that boundary goes through
 * here first: `_id` becomes a string `id`, dates become ISO strings.
 */
export type Plain<T> = {
  [K in keyof T as K extends "_id" ? never : K]: T[K] extends Date
    ? string
    : T[K] extends Date | null
      ? string | null
      : T[K];
} & { id: string };

export function serialize<T extends { _id?: unknown }>(doc: WithId<T> | T): Plain<T> {
  const { _id, ...rest } = doc as Record<string, unknown> & { _id?: unknown };

  const out: Record<string, unknown> = { id: String(_id ?? "") };
  for (const [key, value] of Object.entries(rest)) {
    out[key] = value instanceof Date ? value.toISOString() : value;
  }
  return out as Plain<T>;
}

export function serializeAll<T extends { _id?: unknown }>(docs: (WithId<T> | T)[]): Plain<T>[] {
  return docs.map((doc) => serialize(doc));
}
