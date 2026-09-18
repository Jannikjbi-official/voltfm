import type { Metadata } from "next";
import { media } from "@/db/collections";
import { serializeAll } from "@/services/content";
import { formatDate } from "@/lib/format";
import styles from "../page.module.css";

export const metadata: Metadata = { title: "Medien · Admin", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function Page() {
  const items = serializeAll(await media().find().sort({ createdAt: -1 }).limit(100).toArray());

  return (
    <>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Medien</h1>
          <p className={styles.subtitle}>Alle über UploadThing hochgeladenen Bilder.</p>
        </div>
      </header>

      {items.length === 0 ? (
        <p className={styles.empty}>Noch nichts angelegt.</p>
      ) : (
        <ul className={styles.recent} role="list">
          {items.map((item) => (
            <li key={item.id}>
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer noopener"
                className={styles.recentLink}
              >
                <span className={styles.recentTitle}>{item.url.split("/").pop()}</span>
                <span className={styles.recentMeta}>{formatDate(item.createdAt)}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
