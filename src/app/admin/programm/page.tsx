import type { Metadata } from "next";
import { listShows } from "@/services/content";
import { WEEKDAY_LABELS } from "@/services/radio/schedule";
import styles from "../page.module.css";

export const metadata: Metadata = { title: "Programm · Admin", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function Page() {
  const items = await listShows();

  return (
    <>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Programm</h1>
          <p className={styles.subtitle}>Sendungen aus dem CMS. Die Sendezeiten liefert laut.fm.</p>
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
                  {WEEKDAY_LABELS[item.weekday]}, {item.startTime}–{item.endTime} Uhr
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
