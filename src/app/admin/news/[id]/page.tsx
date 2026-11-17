import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleForm } from "@/components/admin/article-form";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { ConfirmDeleteButton } from "@/components/admin/confirm-dialog";
import { adminGetArticle, listCategories } from "@/services/content";
import { requireAdmin } from "@/lib/session";
import { deleteArticle } from "../actions";

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
      <AdminPageHeader title="Artikel bearbeiten" description={article.title} />

      <ArticleForm
        article={article}
        categories={categories}
        authorName={profile.name || profile.username || "VoltFM"}
        deleteSlot={
          /* Eigenes Formular im Dialog (Portal) — die Aktionsleiste steht
             ausserhalb des Editor-Formulars, also ist nichts verschachtelt. */
          <ConfirmDeleteButton
            compact
            action={deleteArticle}
            fields={{ id: article.id }}
            title="Wirklich löschen?"
            description={<p className="font-semibold">{article.title}</p>}
          />
        }
      />
    </>
  );
}
