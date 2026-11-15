import type { Metadata } from "next";
import Link from "next/link";
import { cn } from "@heroui/react";
import { requireCan } from "@/lib/session";

import { ButtonLink } from "@/components/common/button-link";
import { Icon, PlusIcon, EditIcon } from "@/lib/icons";
import { adminListArticles } from "@/services/content";
import { formatRelative } from "@/lib/format";
import type { ArticleStatus } from "@/types/content";
import { AdminPageHeader, ArticleStatusBadge } from "@/components/admin/admin-ui";

export const metadata: Metadata = { title: "News · Admin", robots: { index: false } };
export const dynamic = "force-dynamic";

const FILTERS: { value: ArticleStatus | "all"; label: string }[] = [
  { value: "all", label: "Alle" },
  { value: "published", label: "Veröffentlicht" },
  { value: "draft", label: "Entwürfe" },
  { value: "scheduled", label: "Geplant" },
  { value: "archived", label: "Archiviert" },
];

export default async function AdminNewsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  // Ein ausgeblendeter Menuepunkt ist kein Schutz — die Seite prueft selbst.
  await requireCan("article", ["update"]);

  const { status } = await searchParams;
  const active = FILTERS.some((f) => f.value === status)
    ? (status as ArticleStatus)
    : undefined;

  const items = await adminListArticles(active);

  return (
    <>
      <AdminPageHeader
        title="News"
        description={`${items.length} Artikel`}
        actions={
          <ButtonLink href="/admin/news/new" variant="primary">
            <Icon icon={PlusIcon} />
            Neuer Artikel
          </ButtonLink>
        }
      />

      <nav aria-label="Status filtern" className="-mx-1 mb-6 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {FILTERS.map((filter) => {
          const current = (filter.value === "all" && !active) || filter.value === active;
          return (
            <Link
              key={filter.value}
              href={filter.value === "all" ? "/admin/news" : `/admin/news?status=${filter.value}`}
              aria-current={current ? "page" : undefined}
              className={cn(
                "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                current
                  ? "border-transparent bg-foreground text-background"
                  : "border-border text-muted hover:bg-default hover:text-foreground",
              )}
            >
              {filter.label}
            </Link>
          );
        })}
      </nav>

      {items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border px-6 py-10 text-center text-sm text-muted">
          Keine Artikel in dieser Ansicht.
        </p>
      ) : (
        <ul className="divide-y divide-separator rounded-2xl border border-border bg-surface">
          {items.map((article) => (
            <li
              key={article.id}
              className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:gap-4 sm:px-6"
            >
              <div className="min-w-0 flex-1">
                <Link
                  href={`/admin/news/${article.id}`}
                  className="block truncate rounded-sm text-sm font-semibold text-foreground hover:underline hover:underline-offset-4"
                >
                  {article.title}
                </Link>
                <p className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted">
                  <span>{article.categorySlug}</span>
                  <span>{article.authorName}</span>
                  <span>{formatRelative(article.updatedAt)}</span>
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <ArticleStatusBadge status={article.status} />
                <ButtonLink href={`/admin/news/${article.id}`} variant="ghost" size="sm">
                  <Icon icon={EditIcon} />
                  Bearbeiten
                </ButtonLink>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
