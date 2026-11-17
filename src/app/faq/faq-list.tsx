"use client";

import { Accordion } from "@heroui/react";

/**
 * Die Fragen als HeroUI-Accordion: Bedienung per Tab und Enter/Leertaste
 * sowie aria-expanded kommen von React Aria. Mehrere Antworten duerfen gleichzeitig
 * offen sein — wer vergleicht, soll nicht hin und her klappen muessen.
 */
export function FaqList({ items }: { items: { question: string; answer: React.ReactNode }[] }) {
  return (
    <Accordion allowsMultipleExpanded hideSeparator className="flex w-full flex-col gap-3">
      {items.map((item) => (
        <Accordion.Item
          key={item.question}
          id={item.question}
          className="surface-card overflow-hidden rounded-2xl transition-shadow data-[expanded=true]:shadow-[var(--lift-shadow)]"
        >
          <Accordion.Heading>
            <Accordion.Trigger className="gap-4 px-5 py-5 text-left text-lg font-bold tracking-tight text-foreground hover:bg-transparent sm:px-6 sm:text-xl">
              {item.question}
              <Accordion.Indicator />
            </Accordion.Trigger>
          </Accordion.Heading>
          <Accordion.Panel>
            <Accordion.Body className="max-w-[64ch] px-1 pb-2 text-base leading-relaxed text-muted sm:px-2 [&_a]:font-semibold [&_a]:text-accent-text [&_a]:underline-offset-4 hover:[&_a]:underline">
              {item.answer}
            </Accordion.Body>
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion>
  );
}
