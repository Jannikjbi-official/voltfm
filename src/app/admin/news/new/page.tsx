import type { Metadata } from "next";
import { ArticleForm } from "@/components/admin/article-form";
import { listCategories } from "@/services/content";
import { requireAdmin } from "@/lib/session";
import styles from "../../page.module.css";

export const metadata: Metadata = { title: "Neuer Artikel · Admin", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function NewArticlePage() {
  const [user, categories] = await Promise.all([requireAdmin(), listCategories()]);
  const profile = user as typeof user & { username?: string | null };

  return (
    <>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Neuer Artikel</h1>
          <p className={styles.subtitle}>Als Entwurf speichern oder direkt veröffentlichen.</p>
        </div>
      </header>

      <ArticleForm
        categories={categories}
        authorName={profile.name || profile.username || "VoltFM"}
      />
    </>
  );
}
