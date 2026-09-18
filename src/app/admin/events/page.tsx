import type { Metadata } from "next";
import { listEvents } from "@/services/content";
import { formatDateTime } from "@/lib/format";
import styles from "../page.module.css";

export const metadata: Metadata = { title: "Events · Admin", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function Page() {
  const items = await listEvents("all");

  return (
    <>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Events</h1>
          <p className={styles.subtitle}>Alle Termine, kommende und vergangene.</p>
        </div>
      </header>

      {items.length === 0 ? (
        <p className={styles.empty}>Noch nichts angelegt.</p>
      ) : (
        <ul className={styles.recent} role="list">
          {items.map((item) => (
            <li key={item.id}>
              <span className={styles.recentLink}>
                <span className={styles.recentTitle}>{item.title}</span>
                <span className={styles.recentMeta}>
                  <span className={styles.status} data-status={item.status}>
                    {item.status}
                  </span>
                  {formatDateTime(item.startsAt)}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
