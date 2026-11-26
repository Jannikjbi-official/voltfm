"use client";

import { Accordion } from "@heroui/react";

/**
 * Die Fragen als HeroUI-Accordion: Bedienung per Tab und Enter/Leertaste
 * sowie aria-expanded kommen von React Aria. Mehrere Antworten duerfen gleichzeitig
 * offen sein — wer vergleicht, soll nicht hin und her klappen muessen.
 */
export function FaqList({ items }: { items: { question: string; answer: React.ReactNode }[] }) {
  return (
    <Accordion allowsMultipleExpanded hideSeparator className="flex w-full flex-col gap-2">
      {items.map((item, index) => (
        <Accordion.Item
          key={item.question}
          id={item.question}
          className="group surface-card overflow-hidden rounded-[var(--radius)] transition-colors data-[expanded=true]:border-volt"
        >
          <Accordion.Heading>
            <Accordion.Trigger className="gap-4 px-4 py-4 text-left font-wide text-lg font-bold text-foreground hover:bg-transparent sm:px-6 sm:py-5 sm:text-xl">
              {/* Nummer wie auf einer Senderwahltaste. */}
              <span
                aria-hidden="true"
                className="well grid h-8 w-10 shrink-0 place-items-center rounded-[3px] font-dot text-sm text-muted group-data-[expanded=true]:bg-volt group-data-[expanded=true]:text-graphite group-data-[expanded=true]:shadow-none"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0 flex-1">{item.question}</span>
              <Accordion.Indicator />
            </Accordion.Trigger>
          </Accordion.Heading>
          <Accordion.Panel>
            <Accordion.Body className="max-w-[64ch] pb-3 pl-1 text-base leading-relaxed text-muted sm:pl-[3.75rem] [&_a]:font-semibold [&_a]:text-accent-text [&_a]:underline [&_a]:underline-offset-4">
              {item.answer}
            </Accordion.Body>
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion>
  );
}
