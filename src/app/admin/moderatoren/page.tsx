import type { Metadata } from "next";
import { requireCan } from "@/lib/session";
import { listHosts } from "@/services/content";
import { EntityManager } from "@/components/admin/entity-manager";
import type { EntityRow, FieldDef } from "@/components/admin/entity-types";
import { saveHost, deleteHost } from "./actions";
import styles from "../page.module.css";

export const metadata: Metadata = { title: "Moderatoren · Admin", robots: { index: false } };
export const dynamic = "force-dynamic";

const FIELDS: FieldDef[] = [
  { name: "name", label: "Name", type: "text", required: true, placeholder: "Max Mustermann" },
  { name: "role", label: "Rolle", type: "text", required: true, placeholder: "Moderator & Musikredaktion" },
  {
    name: "tagline",
    label: "Ein Satz zur Person",
    type: "text",
    placeholder: "Spielt nachts, was tagsüber niemand traut",
    hint: "Steht direkt unter dem Namen. Kürzer und persönlicher als die Rolle.",
  },
  {
    name: "bio",
    label: "Über die Person",
    type: "textarea",
    required: true,
    rows: 8,
    hint: "Mindestens 20 Zeichen. Wird auf der Profilseite angezeigt.",
  },
  {
    name: "quote",
    label: "Motto oder Lieblingssatz",
    type: "textarea",
    rows: 2,
    hint: "Wird auf der Profilseite groß hervorgehoben. Optional.",
  },
  {
    name: "socials",
    label: "Social Links",
    type: "textarea",
    rows: 4,
    placeholder: "Instagram|https://instagram.com/…",
    hint: "Eine Zeile pro Link, Format: Label|https://…",
  },
  {
    name: "showSlugs",
    label: "Sendungen",
    type: "text",
    placeholder: "morningshow, nachtschicht",
    hint: "Slugs der Sendungen, per Komma getrennt.",
  },

  { name: "image", label: "Profilbild", type: "image", side: true },
  {
    name: "discordUserId",
    label: "Discord-ID",
    type: "text",
    side: true,
    hint: "Nur Ziffern. Dient als Fallback für das Profilbild.",
  },
  {
    name: "profileLayout",
    label: "Profil-Layout",
    type: "select",
    side: true,
    options: [
      { value: "spotlight", label: "Spotlight" },
      { value: "editorial", label: "Editorial" },
      { value: "stage", label: "Stage" },
      { value: "zine", label: "Zine" },
    ],
  },
  {
    name: "accentHue",
    label: "Akzentfarbe (Hue)",
    type: "number",
    side: true,
    min: 0,
    max: 360,
    hint: "0–360. Leer lassen für das VoltFM-Standardviolett.",
  },
  {
    name: "genres",
    label: "Musikrichtungen",
    type: "text",
    side: true,
    placeholder: "EDM, House, Techno",
    hint: "Per Komma getrennt.",
  },
  { name: "location", label: "Sitzt in", type: "text", side: true, placeholder: "Hamburg" },
  {
    name: "joinedAt",
    label: "Dabei seit",
    type: "text",
    side: true,
    placeholder: "2021-01-15",
    hint: "Format JJJJ-MM-TT. Optional.",
  },
  { name: "order", label: "Reihenfolge", type: "number", side: true, min: 0, max: 999, defaultValue: 99 },
  { name: "slug", label: "Slug", type: "text", side: true, hint: "Leer lassen für automatisch." },
  { name: "active", label: "Aktiv (öffentlich sichtbar)", type: "checkbox", side: true, defaultValue: true },
];

export default async function Page() {
  // Ein ausgeblendeter Menuepunkt ist kein Schutz — die Seite prueft selbst.
  await requireCan("host", ["update"]);

  const items = await listHosts(true);

  const rows: EntityRow[] = items.map((item) => ({
    id: item.id,
    title: item.name,
    meta: item.role,
    badge: item.active ? "Aktiv" : "Versteckt",
    values: {
      name: item.name,
      slug: item.slug,
      role: item.role,
      tagline: item.tagline ?? "",
      bio: item.bio,
      quote: item.quote ?? "",
      genres: item.genres.join(", "),
      location: item.location ?? "",
      joinedAt: item.joinedAt ? String(item.joinedAt).slice(0, 10) : "",
      image: item.image ?? "",
      discordUserId: item.discordUserId ?? "",
      profileLayout: item.profileLayout ?? "spotlight",
      accentHue: item.accentHue ?? "",
      showSlugs: item.showSlugs.join(", "),
      socials: item.socials.map((social) => `${social.label}|${social.url}`).join("\n"),
      order: item.order,
      active: item.active,
    },
  }));

  return (
    <>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Moderatoren</h1>
          <p className={styles.subtitle}>Profile und Sendungszuordnung.</p>
        </div>
      </header>

      <EntityManager
        rows={rows}
        fields={FIELDS}
        saveAction={saveHost}
        deleteAction={deleteHost}
        singular="Moderator"
        addLabel="Moderator anlegen"
        emptyText="Noch kein Moderator angelegt."
      />
    </>
  );
}
