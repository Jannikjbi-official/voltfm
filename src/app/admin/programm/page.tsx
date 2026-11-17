import type { Metadata } from "next";
import { requireCan } from "@/lib/session";
import { adminListShows, listHosts } from "@/services/content";
import { WEEKDAY_LABELS } from "@/services/radio/schedule";
import { EntityManager } from "@/components/admin/entity-manager";
import type { EntityRow, FieldDef } from "@/components/admin/entity-types";
import { saveShow, deleteShow } from "./actions";
import { features } from "@/lib/site";
import { AdminPageHeader, AdminNotice } from "@/components/admin/admin-ui";

export const metadata: Metadata = { title: "Programm · Admin", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function Page() {
  // Ein ausgeblendeter Menuepunkt ist kein Schutz — die Seite prueft selbst.
  await requireCan("show", ["update"]);

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
    tone: item.active ? "success" : "default",
    image: item.image,
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
      <AdminPageHeader
        title="Programm"
        description="Sendungen aus dem CMS. Die tatsächlich laufende Sendung meldet laut.fm."
      />

      {/* Der Bereich bleibt bedienbar, damit vorhandene Sendungen erhalten
          bleiben und neue vorbereitet werden koennen — aber niemand soll
          glauben, hier Gepflegtes sei oeffentlich sichtbar. */}
      {!features.schedule && (
        <AdminNotice title="Der Sendeplan ist öffentlich abgeschaltet.">
          Was du hier anlegst, wird gespeichert, erscheint aber nicht auf der Website: Die
          Seite <code>/programm</code> zeigt stattdessen einen Hinweis, und der Menüpunkt ist
          ausgeblendet. Wieder einschalten lässt sich das über <code>features.schedule</code> in{" "}
          <code>src/lib/site.ts</code> — sinnvoll, sobald ein eigener Sendeserver läuft.
        </AdminNotice>
      )}

      <EntityManager
        rows={rows}
        fields={fields}
        saveAction={saveShow}
        deleteAction={deleteShow}
        singular="Sendung"
        addLabel="Sendung anlegen"
        emptyText="Noch keine Sendung angelegt."
        canCreate={features.schedule}
        createBlockedText="Neue Sendungen lassen sich anlegen, sobald der Sendeplan wieder aktiv ist. Vorhandene kannst du weiterhin bearbeiten und löschen — wähle dafür unten „Bearbeiten“."
      />
    </>
  );
}
