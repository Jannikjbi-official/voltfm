import type { Metadata } from "next";
import { requireCan } from "@/lib/session";
import { adminListPartners } from "@/services/content/partners";
import { EntityManager } from "@/components/admin/entity-manager";
import type { EntityRow, FieldDef } from "@/components/admin/entity-types";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { savePartner, deletePartner } from "./actions";

export const metadata: Metadata = { title: "Partner · Admin", robots: { index: false } };
export const dynamic = "force-dynamic";

const FIELDS: FieldDef[] = [
  { name: "name", label: "Name", type: "text", required: true, placeholder: "Toki" },
  {
    name: "kurz",
    label: "Kurztext",
    type: "textarea",
    required: true,
    rows: 2,
    hint: "Ein, zwei Sätze für die Partner-Liste. Höchstens 160 Zeichen.",
  },
  {
    name: "content",
    label: "Beschreibung",
    type: "rich",
    rows: 12,
    hint: "Optional. Erscheint auf der Detailseite des Partners.",
  },
  {
    name: "links",
    label: "Links",
    type: "socials",
    hint: "Twitch, YouTube, TikTok, Instagram, Discord oder Website.",
  },

  { name: "logo", label: "Logo (quadratisch)", type: "image", side: true },
  { name: "banner", label: "Banner (breit)", type: "image", side: true },
  { name: "order", label: "Reihenfolge", type: "number", side: true, min: 0, max: 999, defaultValue: 99 },
  { name: "slug", label: "Slug", type: "text", side: true, hint: "Leer lassen für automatisch." },
  { name: "active", label: "Aktiv (öffentlich sichtbar)", type: "checkbox", side: true, defaultValue: true },
];

export default async function Page() {
  // Ein ausgeblendeter Menuepunkt ist kein Schutz — die Seite prueft selbst.
  await requireCan("partner", ["update"]);

  const items = await adminListPartners();

  const rows: EntityRow[] = items.map((item) => ({
    id: item.id,
    title: item.name,
    meta: item.kurz,
    badge: item.active ? "Aktiv" : "Versteckt",
    tone: item.active ? "success" : "default",
    image: item.logo,
    values: {
      name: item.name,
      slug: item.slug,
      kurz: item.kurz,
      content: item.content ?? "",
      contentSource: item.contentSource ?? "",
      logo: item.logo ?? "",
      banner: item.banner ?? "",
      links: item.links.map((link) => `${link.label}|${link.url}`).join("\n"),
      order: item.order,
      active: item.active,
    },
  }));

  return (
    <>
      <AdminPageHeader title="Partner" description="Streamer und Projekte, mit denen VoltFM zusammenarbeitet." />

      <EntityManager
        rows={rows}
        fields={FIELDS}
        saveAction={savePartner}
        deleteAction={deletePartner}
        singular="Partner"
        addLabel="Partner anlegen"
        emptyText="Noch kein Partner angelegt."
      />
    </>
  );
}
