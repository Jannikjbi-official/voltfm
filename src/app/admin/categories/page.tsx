import type { Metadata } from "next";
import { requireCan } from "@/lib/session";
import { listCategories } from "@/services/content";
import { EntityManager } from "@/components/admin/entity-manager";
import type { EntityRow, FieldDef } from "@/components/admin/entity-types";
import { saveCategory, deleteCategory } from "./actions";
import { AdminPageHeader } from "@/components/admin/admin-ui";

export const metadata: Metadata = { title: "Kategorien · Admin", robots: { index: false } };
export const dynamic = "force-dynamic";

const FIELDS: FieldDef[] = [
  { name: "name", label: "Name", type: "text", required: true, placeholder: "Musik" },
  {
    name: "description",
    label: "Beschreibung",
    type: "textarea",
    rows: 3,
    hint: "Erscheint als Untertitel auf der Kategorieseite.",
  },
  {
    name: "slug",
    label: "Slug",
    type: "text",
    side: true,
    hint: "Leer lassen, dann wird er aus dem Namen gebildet.",
  },
  {
    name: "order",
    label: "Reihenfolge",
    type: "number",
    side: true,
    min: 0,
    max: 999,
    defaultValue: 99,
    hint: "Kleinere Zahlen stehen weiter vorn.",
  },
];

export default async function Page() {
  // Ein ausgeblendeter Menuepunkt ist kein Schutz — die Seite prueft selbst.
  await requireCan("category", ["update"]);

  const items = await listCategories();

  const rows: EntityRow[] = items.map((item) => ({
    id: item.id,
    title: item.name,
    meta: `/${item.slug}`,
    badge: String(item.order),
    values: {
      name: item.name,
      slug: item.slug,
      description: item.description ?? "",
      order: item.order,
    },
  }));

  return (
    <>
      <AdminPageHeader
        title="Kategorien"
        description="Kategorien der News-Redaktion."
      />

      <EntityManager
        rows={rows}
        fields={FIELDS}
        saveAction={saveCategory}
        deleteAction={deleteCategory}
        singular="Kategorie"
        addLabel="Kategorie anlegen"
        emptyText="Noch keine Kategorie angelegt."
      />
    </>
  );
}
