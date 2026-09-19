import type { Metadata } from "next";
import { requireCan } from "@/lib/session";
import Link from "next/link";

import { ButtonLink } from "@/components/common/button-link";
import { Icon, PlusIcon, EditIcon } from "@/lib/icons";
import { adminListArticles } from "@/services/content";
import { formatRelative } from "@/lib/format";
import type { ArticleStatus } from "@/types/content";
import styles from "../page.module.css";
import listStyles from "./list.module.css";

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
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>News</h1>
          <p className={styles.subtitle}>{items.length} Artikel</p>
        </div>
        <ButtonLink href="/admin/news/new" variant="primary" mode="filled" size="md">
          <Icon icon={PlusIcon} />
          Neuer Artikel
        </ButtonLink>
      </header>

      <nav className={listStyles.filters} aria-label="Status filtern">
        {FILTERS.map((filter) => (
          <Link
            key={filter.value}
            href={filter.value === "all" ? "/admin/news" : `/admin/news?status=${filter.value}`}
            className={listStyles.filter}
            aria-current={
              (filter.value === "all" && !active) || filter.value === active ? "page" : undefined
            }
          >
            {filter.label}
          </Link>
        ))}
      </nav>

      {items.length === 0 ? (
        <p className={styles.empty}>Keine Artikel in dieser Ansicht.</p>
      ) : (
        <ul className={listStyles.list} role="list">
          {items.map((article) => (
            <li key={article.id} className={listStyles.row}>
              <div className={listStyles.rowMain}>
                <Link href={`/admin/news/${article.id}`} className={listStyles.rowTitle}>
                  {article.title}
                </Link>
                <span className={listStyles.rowMeta}>
                  {article.categorySlug} · {article.authorName} ·{" "}
                  {formatRelative(article.updatedAt)}
                </span>
              </div>

              <span className={styles.status} data-status={article.status}>
                {article.status}
              </span>

              <ButtonLink
                href={`/admin/news/${article.id}`}
                variant="neutral"
                mode="ghost"
                size="sm"
              >
                <Icon icon={EditIcon} />
                Bearbeiten
              </ButtonLink>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
