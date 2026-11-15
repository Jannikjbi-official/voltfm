import type { Metadata } from "next";
import { requireCan } from "@/lib/session";
import { adminListEvents, listCategories } from "@/services/content";
import { formatDateTime, toStationTimeInput } from "@/lib/format";
import { EntityManager } from "@/components/admin/entity-manager";
import type { EntityRow, FieldDef } from "@/components/admin/entity-types";
import { saveEvent, deleteEvent } from "./actions";
import { AdminPageHeader } from "@/components/admin/admin-ui";

export const metadata: Metadata = { title: "Events · Admin", robots: { index: false } };
export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  upcoming: "Geplant",
  live: "Läuft",
  past: "Vorbei",
  cancelled: "Abgesagt",
};

export default async function Page() {
  // Ein ausgeblendeter Menuepunkt ist kein Schutz — die Seite prueft selbst.
  await requireCan("event", ["update"]);

  const [items, cats] = await Promise.all([adminListEvents(), listCategories()]);

  /* The category is a free-text field on the event, but offering the existing
     categories keeps the spelling consistent across the list. */
  const categoryOptions = cats.map((cat) => ({ value: cat.name, label: cat.name }));

  const fields: FieldDef[] = [
    { name: "title", label: "Titel", type: "text", required: true, placeholder: "VoltFM Sommerfest" },
    {
      name: "description",
      label: "Kurzbeschreibung",
      type: "textarea",
      required: true,
      rows: 3,
      hint: "Steht in der Event-Liste und in der Vorschau beim Teilen.",
    },
    {
      name: "content",
      label: "Ausführlicher Text",
      type: "rich",
      rows: 12,
      hint: "Optional. Erscheint auf der Detailseite des Events.",
    },
    { name: "location", label: "Ort", type: "text", required: true, placeholder: "Hamburg, Kulturetage" },
    { name: "url", label: "Externer Link", type: "text", placeholder: "https://…" },

    { name: "startsAt", label: "Beginn", type: "datetime", required: true, side: true },
    { name: "endsAt", label: "Ende", type: "datetime", side: true, hint: "Optional." },
    categoryOptions.length > 0
      ? { name: "category", label: "Kategorie", type: "select", required: true, side: true, options: categoryOptions }
      : { name: "category", label: "Kategorie", type: "text", required: true, side: true, placeholder: "Party" },
    {
      name: "status",
      label: "Status",
      type: "select",
      side: true,
      /* "Vorbei" steht bewusst nicht zur Auswahl: Das ergibt sich aus dem
         Datum und wird beim Anzeigen abgeleitet. */
      options: [
        { value: "upcoming", label: "Geplant" },
        { value: "live", label: "Läuft gerade" },
        { value: "cancelled", label: "Abgesagt" },
      ],
      hint: "„Vorbei“ ergibt sich automatisch aus dem Datum.",
    },
    { name: "image", label: "Titelbild", type: "image", side: true },
    { name: "slug", label: "Slug", type: "text", side: true, hint: "Leer lassen für automatisch." },
  ];

  const rows: EntityRow[] = items.map((item) => ({
    id: item.id,
    title: item.title,
    meta: `${formatDateTime(item.startsAt)}, ${item.location}`,
    badge: STATUS_LABELS[item.status] ?? item.status,
    values: {
      title: item.title,
      slug: item.slug,
      description: item.description,
      content: item.content ?? "",
      startsAt: toStationTimeInput(item.startsAt),
      endsAt: toStationTimeInput(item.endsAt),
      location: item.location,
      category: item.category,
      // Alte Datensaetze koennen noch "past" tragen; das Feld kennt es nicht mehr.
      status: item.status === "past" ? "upcoming" : item.status,
      image: item.image ?? "",
      url: item.url ?? "",
    },
  }));

  return (
    <>
      <AdminPageHeader
        title="Events"
        description="Alle Termine, kommende und vergangene."
      />

      <EntityManager
        rows={rows}
        fields={fields}
        saveAction={saveEvent}
        deleteAction={deleteEvent}
        singular="Event"
        addLabel="Event anlegen"
        emptyText="Noch kein Event angelegt."
      />
    </>
  );
}
