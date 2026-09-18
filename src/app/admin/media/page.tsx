import type { Metadata } from "next";
import { media } from "@/db/collections";
import { serializeAll } from "@/services/content";
import { MediaGrid, type MediaItem } from "./media-grid";
import { deleteMedia, updateMediaAlt } from "./actions";
import styles from "../page.module.css";

export const metadata: Metadata = { title: "Medien · Admin", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function Page() {
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
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Medien</h1>
          <p className={styles.subtitle}>
            {items.length} über UploadThing hochgeladene Bilder. Löschen entfernt die Datei auch dort.
          </p>
        </div>
      </header>

      <MediaGrid items={items} deleteAction={deleteMedia} altAction={updateMediaAlt} />
    </>
  );
}
