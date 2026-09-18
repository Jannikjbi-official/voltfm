import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleForm } from "@/components/admin/article-form";
import { Button } from "@/components/ui/button";
import { Icon, DeleteIcon } from "@/lib/icons";
import { adminGetArticle, listCategories } from "@/services/content";
import { requireAdmin } from "@/lib/session";
import { deleteArticle } from "../actions";
import styles from "../../page.module.css";

export const metadata: Metadata = { title: "Artikel bearbeiten · Admin", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [user, article, categories] = await Promise.all([
    requireAdmin(),
    adminGetArticle(id),
    listCategories(),
  ]);

  if (!article) notFound();
  const profile = user as typeof user & { username?: string | null };

  return (
    <>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Artikel bearbeiten</h1>
          <p className={styles.subtitle}>{article.title}</p>
        </div>

        {/* Its own form: a nested form inside the editor would be invalid HTML. */}
        <form action={deleteArticle}>
          <input type="hidden" name="id" value={article.id} />
          <Button type="submit" variant="error" mode="stroke" size="sm">
            <Icon icon={DeleteIcon} />
            Löschen
          </Button>
        </form>
      </header>

      <ArticleForm
        article={article}
        categories={categories}
        authorName={profile.name || profile.username || "VoltFM"}
      />
    </>
  );
}
