import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { assertAdmin } from "@/lib/session";
import { media } from "@/db/collections";

const f = createUploadthing();

/**
 * Upload endpoints.
 *
 * Every route authorises on the server inside `middleware` before UploadThing
 * hands out an upload URL — an unauthenticated client never receives one.
 * `onUploadComplete` also runs server-side, so the media record cannot be
 * forged by the browser.
 */
export const uploadRouter = {
  /** Article cover images and in-article images. Admin only. */
  articleImage: f({
    image: { maxFileSize: "8MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const user = await assertAdmin().catch(() => null);
      if (!user) throw new UploadThingError("Keine Berechtigung.");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await media().insertOne({
        url: file.ufsUrl,
        alt: "",
        mimeType: file.type,
        uploadedBy: metadata.userId,
        createdAt: new Date(),
      });
      // Returned to the client that started the upload.
      return { url: file.ufsUrl };
    }),

  /** Host portraits and event images. Admin only. */
  contentImage: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const user = await assertAdmin().catch(() => null);
      if (!user) throw new UploadThingError("Keine Berechtigung.");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await media().insertOne({
        url: file.ufsUrl,
        alt: "",
        mimeType: file.type,
        uploadedBy: metadata.userId,
        createdAt: new Date(),
      });
      return { url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type UploadRouter = typeof uploadRouter;
