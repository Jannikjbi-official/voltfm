import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { assertCan } from "@/lib/session";
import { registerImage } from "@/lib/images";

const f = createUploadthing();

/**
 * Upload endpoints.
 *
 * Every route authorises on the server inside `middleware` before UploadThing
 * hands out an upload URL — an unauthenticated client never receives one.
 * `onUploadComplete` also runs server-side, so the media record cannot be
 * forged by the browser.
 *
 * Zurueckgegeben wird nie die Adresse des Anbieters, sondern immer
 * `/api/bilder/<kennung>` auf der eigenen Domain (siehe `lib/images.ts`).
 */
export const uploadRouter = {
  /** Article cover images and in-article images. Admin only. */
  articleImage: f({
    image: { maxFileSize: "8MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const user = await assertCan("media", ["upload"]).catch(() => null);
      if (!user) throw new UploadThingError("Keine Berechtigung.");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Returned to the client that started the upload.
      return { url: await registerImage(file.key, file.type, metadata.userId) };
    }),

  /** Host portraits and event images. Admin only. */
  contentImage: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const user = await assertCan("media", ["upload"]).catch(() => null);
      if (!user) throw new UploadThingError("Keine Berechtigung.");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { url: await registerImage(file.key, file.type, metadata.userId) };
    }),
} satisfies FileRouter;

export type UploadRouter = typeof uploadRouter;
