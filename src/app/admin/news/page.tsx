import type { Metadata } from "next";
import Link from "next/link";
import { requireCan } from "@/lib/session";

import { ButtonLink } from "@/components/common/button-link";
import { Icon, PlusIcon, EditIcon, ExternalLinkIcon } from "@/lib/icons";
import { adminListArticles, countArticlesByStatus, getCategoryNames } from "@/services/content";
import { formatDate, formatRelative } from "@/lib/format";
import type { ArticleStatus } from "@/types/content";
import {
  AdminPageHeader,
  AdminTable,
  ArticleStatusBadge,
  PillCount,
  Td,
  Th,
  filterPillClass,
  trClass,
} from "@/components/admin/admin-ui";

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
  const active = FILTERS.some((f) => f.value === status && f.value !== "all")
    ? (status as ArticleStatus)
    : undefined;

  const [items, counts, categoryNames] = await Promise.all([
    adminListArticles(active),
    countArticlesByStatus(),
    getCategoryNames(),
  ]);
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);

  return (
    <>
      <AdminPageHeader
        title="News"
        description="Artikel schreiben, planen und veröffentlichen."
        actions={
          <ButtonLink href="/admin/news/new" variant="primary">
            <Icon icon={PlusIcon} />
            Neuer Artikel
          </ButtonLink>
        }
      />

      <nav aria-label="Nach Status filtern" className="-mx-1 mb-5 flex gap-1.5 overflow-x-auto px-1 py-1">
        {FILTERS.map((filter) => {
          const current = (filter.value === "all" && !active) || filter.value === active;
          const count = filter.value === "all" ? total : counts[filter.value];
          return (
            <Link
              key={filter.value}
              href={filter.value === "all" ? "/admin/news" : `/admin/news?status=${filter.value}`}
              aria-current={current ? "page" : undefined}
              className={filterPillClass(current)}
            >
              {filter.label}
              <PillCount active={current}>{count}</PillCount>
            </Link>
          );
        })}
      </nav>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border px-6 py-12 text-center">
          <p className="font-bold text-foreground">Keine Artikel in dieser Ansicht.</p>
          {active && (
            <Link href="/admin/news" className="mt-2 inline-block text-sm text-muted underline underline-offset-4 hover:text-foreground">
              Alle Artikel zeigen
            </Link>
          )}
        </div>
      ) : (
        <AdminTable>
          <thead>
            <tr>
              <Th>Titel</Th>
              <Th className="w-0">Status</Th>
              <Th className="hidden w-0 lg:table-cell">Kategorie</Th>
              <Th className="hidden w-0 md:table-cell">Veröffentlicht</Th>
              <Th className="hidden w-0 sm:table-cell">Geändert</Th>
              <Th className="hidden w-0 text-right sm:table-cell">
                <span className="sr-only">Aktionen</span>
              </Th>
            </tr>
          </thead>
          <tbody>
            {items.map((article) => (
              <tr key={article.id} className={trClass}>
                <Td className="w-full max-w-0">
                  <Link
                    href={`/admin/news/${article.id}`}
                    className="line-clamp-2 font-semibold text-foreground transition-colors hover:text-accent-text sm:line-clamp-1"
                  >
                    {article.title}
                  </Link>
                  <span className="mt-0.5 block truncate text-xs text-muted">
                    {article.authorName}
                    {article.featured && ", Aufmacher"}
                  </span>
                </Td>
                <Td>
                  <ArticleStatusBadge status={article.status} />
                </Td>
                <Td className="hidden whitespace-nowrap text-muted lg:table-cell">
                  {categoryNames[article.categorySlug] ?? article.categorySlug}
                </Td>
                <Td className="hidden font-mono text-xs whitespace-nowrap text-muted md:table-cell">
                  {article.publishedAt ? formatDate(article.publishedAt, "short") : "—"}
                </Td>
                <Td className="hidden text-xs whitespace-nowrap text-muted sm:table-cell">
                  {formatRelative(article.updatedAt)}
                </Td>
                <Td className="hidden text-right whitespace-nowrap sm:table-cell">
                  <div className="inline-flex gap-1">
                    {article.status === "published" && (
                      <ButtonLink
                        href={`/news/${article.slug}`}
                        external
                        variant="ghost"
                        size="sm"
                        isIconOnly
                        aria-label={`${article.title} auf der Seite ansehen`}
                      >
                        <Icon icon={ExternalLinkIcon} />
                      </ButtonLink>
                    )}
                    <ButtonLink
                      href={`/admin/news/${article.id}`}
                      variant="ghost"
                      size="sm"
                      isIconOnly
                      aria-label={`${article.title} bearbeiten`}
                    >
                      <Icon icon={EditIcon} />
                    </ButtonLink>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </AdminTable>
      )}
    </>
  );
}
