import type { Metadata } from "next";
import { listHosts } from "@/services/content";
import styles from "../page.module.css";

export const metadata: Metadata = { title: "Moderatoren · Admin", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function Page() {
  const items = await listHosts(true);

  return (
    <>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Moderatoren</h1>
          <p className={styles.subtitle}>Profile und Sendungszuordnung.</p>
        </div>
      </header>

      {items.length === 0 ? (
        <p className={styles.empty}>Noch nichts angelegt.</p>
      ) : (
        <ul className={styles.recent} role="list">
          {items.map((item) => (
            <li key={item.id}>
              <span className={styles.recentLink}>
                <span className={styles.recentTitle}>{item.name}</span>
                <span className={styles.recentMeta}>{item.role}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
