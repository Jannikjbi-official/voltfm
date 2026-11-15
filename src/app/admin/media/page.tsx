import type { Metadata } from "next";
import { requireCan } from "@/lib/session";
import { media } from "@/db/collections";
import { serializeAll } from "@/services/content";
import { MediaGrid, type MediaItem } from "./media-grid";
import { deleteMedia, updateMediaAlt } from "./actions";
import { AdminPageHeader } from "@/components/admin/admin-ui";

export const metadata: Metadata = { title: "Medien · Admin", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function Page() {
  // Ein ausgeblendeter Menuepunkt ist kein Schutz — die Seite prueft selbst.
  await requireCan("media", ["upload"]);

  const docs = serializeAll(await media().find().sort({ createdAt: -1 }).limit(120).toArray());

  const items: MediaItem[] = docs.map((doc) => ({
    id: doc.id,
    url: doc.url,
    alt: doc.alt ?? "",
    mimeType: doc.mimeType,
    createdAt: doc.createdAt,
  }));

  return (
    <>
      <AdminPageHeader
        title="Medien"
        description="Über UploadThing hochgeladene Bilder. Löschen entfernt die Datei auch dort."
      />

      <MediaGrid items={items} deleteAction={deleteMedia} altAction={updateMediaAlt} />
    </>
  );
}
