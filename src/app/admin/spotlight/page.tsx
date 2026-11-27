import type { Metadata } from "next";
import { requireCan } from "@/lib/session";
import { adminListSpotlights } from "@/services/content/spotlights";
import { SPOTLIGHT_ARTEN, currentMonat, formatMonat } from "@/lib/spotlight";
import { EntityManager } from "@/components/admin/entity-manager";
import type { EntityRow, FieldDef } from "@/components/admin/entity-types";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { saveSpotlight, deleteSpotlight } from "./actions";

export const metadata: Metadata = { title: "Im Fokus · Admin", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function Page() {
  // Ein ausgeblendeter Menuepunkt ist kein Schutz — die Seite prueft selbst.
  await requireCan("spotlight", ["update"]);

  const items = await adminListSpotlights();

  const fields: FieldDef[] = [
    { name: "name", label: "Name", type: "text", required: true, placeholder: "Wer steht im Fokus?" },
    {
      name: "kurz",
      label: "Kurztext",
      type: "textarea",
      required: true,
      rows: 2,
      hint: "Ein, zwei Sätze für die Übersicht. Höchstens 200 Zeichen.",
    },
    {
      name: "content",
      label: "Porträt",
      type: "rich",
      rows: 14,
      hint: "Optional. Erscheint auf der eigenen Seite des Porträts.",
    },

    {
      name: "art",
      label: "Wer",
      type: "select",
      required: true,
      side: true,
      options: [
        { value: "team", label: SPOTLIGHT_ARTEN.team },
        { value: "hoerer", label: SPOTLIGHT_ARTEN.hoerer },
      ],
    },
    {
      name: "monat",
      label: "Monat",
      type: "text",
      required: true,
      side: true,
      placeholder: "2026-11",
      defaultValue: currentMonat(),
      hint: "Als JJJJ-MM. Das neueste steht groß auf /spotlight.",
    },
    { name: "bild", label: "Bild", type: "image", side: true },
    { name: "slug", label: "Slug", type: "text", side: true, hint: "Leer lassen für automatisch." },
    { name: "active", label: "Aktiv (öffentlich sichtbar)", type: "checkbox", side: true, defaultValue: true },
  ];

  const rows: EntityRow[] = items.map((item) => ({
    id: item.id,
    title: item.name,
    meta: `${formatMonat(item.monat)}, ${SPOTLIGHT_ARTEN[item.art] ?? item.art}`,
    badge: item.active ? "Aktiv" : "Versteckt",
    tone: item.active ? "success" : "default",
    image: item.bild,
    values: {
      name: item.name,
      slug: item.slug,
      art: item.art,
      kurz: item.kurz,
      content: item.content ?? "",
      contentSource: item.contentSource ?? "",
      bild: item.bild ?? "",
      monat: item.monat,
      active: item.active,
    },
  }));

  return (
    <>
      <AdminPageHeader
        title="Im Fokus"
        description="Kurze Porträts von Leuten aus dem Team und aus der Hörerschaft, öffentlich auf /spotlight."
      />

      <EntityManager
        rows={rows}
        fields={fields}
        saveAction={saveSpotlight}
        deleteAction={deleteSpotlight}
        singular="Porträt"
        addLabel="Porträt anlegen"
        emptyText="Noch kein Porträt angelegt."
      />
    </>
  );
}
