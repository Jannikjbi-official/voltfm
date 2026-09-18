import { generateReactHelpers } from "@uploadthing/react";
import type { UploadRouter } from "@/app/api/uploadthing/core";

/**
 * Typed client helpers. `useUploadThing` gives the upload hook used by the
 * admin editor and the profile picture picker.
 */
export const { useUploadThing, uploadFiles } = generateReactHelpers<UploadRouter>();
