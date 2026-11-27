import type { Metadata } from "next";

import { PageHeader } from "@/components/common/page-header";
import { changelog } from "@/lib/changelog";

export const metadata: Metadata = {
  title: "Was ist neu",
  description: "Was sich an der Website von VoltFM zuletzt geändert hat.",
  alternates: { canonical: "/neu" },
};

/** "2026-11-26" → "26.11.2026", ohne Umweg ueber Date und Zeitzonen. */
function toGermanDate(iso: string): string {
  const [year, month, day] = iso.split("-");
  return `${day}.${month}.${year}`;
}

export default function NeuPage() {
  return (
    <>
      <PageHeader
        title="Was ist neu"
        description="Was sich an dieser Website geändert hat, neueste Änderungen zuerst."
        breadcrumbs={[
          { href: "/", label: "Start" },
          { href: "/neu", label: "Was ist neu" },
        ]}
        size="large"
      />

      <section className="shell pt-2" aria-label="Änderungen">
        <ol className="flex flex-col gap-2">
          {changelog.map((entry) => (
            <li
              key={entry.date}
              className="surface-card grid gap-2 rounded-[var(--radius)] p-2 sm:grid-cols-[12rem_minmax(0,1fr)]"
            >
              <div className="display-panel display-dots flex items-center rounded-[3px] px-4 py-3 sm:flex-col sm:items-start sm:justify-center">
                <time dateTime={entry.date} className="font-dot text-xl leading-none text-volt sm:text-2xl">
                  {toGermanDate(entry.date)}
                </time>
              </div>
              <div className="px-3 py-3 sm:px-4">
                <h2 className="font-wide text-xl font-bold text-foreground sm:text-2xl">{entry.title}</h2>
                <ul className="mt-3 flex list-disc flex-col gap-1.5 pl-5 leading-relaxed text-muted marker:text-border">
                  {entry.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
