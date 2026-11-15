import type { Metadata } from "next";
import { ArticleForm } from "@/components/admin/article-form";
import { listCategories } from "@/services/content";
import { requireAdmin } from "@/lib/session";
import { AdminPageHeader } from "@/components/admin/admin-ui";

export const metadata: Metadata = { title: "Neuer Artikel · Admin", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function NewArticlePage() {
  const [user, categories] = await Promise.all([requireAdmin(), listCategories()]);
  const profile = user as typeof user & { username?: string | null };

  return (
    <>
      <AdminPageHeader
        title="Neuer Artikel"
        description="Als Entwurf speichern oder direkt veröffentlichen."
      />

      <ArticleForm
        categories={categories}
        authorName={profile.name || profile.username || "VoltFM"}
      />
    </>
  );
}
