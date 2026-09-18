import type { Metadata } from "next";
import { adminListShows, listHosts } from "@/services/content";
import { WEEKDAY_LABELS } from "@/services/radio/schedule";
import { EntityManager } from "@/components/admin/entity-manager";
import type { EntityRow, FieldDef } from "@/components/admin/entity-types";
import { saveShow, deleteShow } from "./actions";
import styles from "../page.module.css";

export const metadata: Metadata = { title: "Programm · Admin", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function Page() {
  const [items, hostList] = await Promise.all([adminListShows(), listHosts(true)]);

  const hostHint =
    hostList.length > 0
      ? `Slugs per Komma. Verfügbar: ${hostList.map((host) => host.slug).join(", ")}`
      : "Slugs der Moderatoren, per Komma getrennt.";

  const fields: FieldDef[] = [
    { name: "title", label: "Titel", type: "text", required: true, placeholder: "Morningshow" },
    {
      name: "description",
      label: "Beschreibung",
      type: "textarea",
      required: true,
      rows: 6,
      hint: "Mindestens 10 Zeichen.",
    },
    { name: "hostSlugs", label: "Moderatoren", type: "text", hint: hostHint },

    {
      name: "weekday",
      label: "Wochentag",
      type: "select",
      required: true,
      side: true,
      defaultValue: 1,
      options: WEEKDAY_LABELS.map((label, index) => ({ value: String(index), label })),
    },
    { name: "startTime", label: "Beginn", type: "time", required: true, side: true, defaultValue: "20:00" },
    { name: "endTime", label: "Ende", type: "time", required: true, side: true, defaultValue: "22:00" },
    { name: "image", label: "Sendungsbild", type: "image", side: true },
    { name: "slug", label: "Slug", type: "text", side: true, hint: "Leer lassen für automatisch." },
    { name: "active", label: "Aktiv (im Programm sichtbar)", type: "checkbox", side: true, defaultValue: true },
  ];

  const rows: EntityRow[] = items.map((item) => ({
    id: item.id,
    title: item.title,
    meta: `${WEEKDAY_LABELS[item.weekday]}, ${item.startTime}–${item.endTime} Uhr`,
    badge: item.active ? "Aktiv" : "Versteckt",
    values: {
      title: item.title,
      slug: item.slug,
      description: item.description,
      image: item.image ?? "",
      hostSlugs: item.hostSlugs.join(", "),
      weekday: item.weekday,
      startTime: item.startTime,
      endTime: item.endTime,
      active: item.active,
    },
  }));

  return (
    <>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Programm</h1>
          <p className={styles.subtitle}>
            Sendungen aus dem CMS. Die tatsächlich laufende Sendung meldet laut.fm.
          </p>
        </div>
      </header>

      <EntityManager
        rows={rows}
        fields={fields}
        saveAction={saveShow}
        deleteAction={deleteShow}
        singular="Sendung"
        addLabel="Sendung anlegen"
        emptyText="Noch keine Sendung angelegt."
      />
    </>
  );
}
