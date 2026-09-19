import type { Metadata } from "next";
import { listTimeline } from "@/services/content";
import { EntityManager } from "@/components/admin/entity-manager";
import type { EntityRow, FieldDef } from "@/components/admin/entity-types";
import { saveTimelineEntry, deleteTimelineEntry } from "./actions";
import styles from "../page.module.css";

export const metadata: Metadata = { title: "Zeitleiste · Admin", robots: { index: false } };
export const dynamic = "force-dynamic";

const FIELDS: FieldDef[] = [
  {
    name: "title",
    label: "Überschrift",
    type: "text",
    required: true,
    placeholder: "Jemand drückt auf Play",
  },
  {
    name: "text",
    label: "Text",
    type: "textarea",
    required: true,
    rows: 5,
    hint: "Zwei bis drei Sätze. Was ist in diesem Abschnitt passiert?",
  },
  {
    name: "year",
    label: "Jahresangabe",
    type: "text",
    required: true,
    side: true,
    placeholder: "Jan 2021",
    hint: "Freier Text — auch „danach“ oder „2023–2025“ ist erlaubt.",
  },
  {
    name: "kicker",
    label: "Zeile darüber",
    type: "text",
    required: true,
    side: true,
    placeholder: "Der Anfang",
    hint: "Kurz und in Großbuchstaben dargestellt.",
  },
  {
    name: "order",
    label: "Reihenfolge",
    type: "number",
    side: true,
    min: 0,
    max: 999,
    defaultValue: 99,
    hint: "Kleinere Zahlen stehen weiter oben.",
  },
  {
    name: "href",
    label: "Link auf",
    type: "text",
    side: true,
    placeholder: "/radioaid",
    hint: "Optional, nur eigene Seiten (muss mit „/“ beginnen).",
  },
  {
    name: "linkLabel",
    label: "Beschriftung des Links",
    type: "text",
    side: true,
    placeholder: "Alle Ausgaben ansehen",
  },
  {
    name: "current",
    label: "Als aktuellen Stand hervorheben",
    type: "checkbox",
    side: true,
  },
];

export default async function Page() {
  const items = await listTimeline();

  const rows: EntityRow[] = items.map((item) => ({
    id: item.id,
    title: `${item.year} — ${item.title}`,
    meta: item.kicker,
    badge: item.current ? "Aktuell" : String(item.order),
    values: {
      year: item.year,
      kicker: item.kicker,
      title: item.title,
      text: item.text,
      href: item.href ?? "",
      linkLabel: item.linkLabel ?? "",
      order: item.order,
      current: item.current,
    },
  }));

  return (
    <>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Zeitleiste</h1>
          <p className={styles.subtitle}>
            Die Geschichte von VoltFM auf der Seite „Über uns“.
          </p>
        </div>
      </header>

      <EntityManager
        rows={rows}
        fields={FIELDS}
        saveAction={saveTimelineEntry}
        deleteAction={deleteTimelineEntry}
        singular="Eintrag"
        addLabel="Eintrag anlegen"
        emptyText="Noch kein Eintrag angelegt."
      />
    </>
  );
}
