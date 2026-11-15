"use client";

import { Accordion } from "@heroui/react";

/**
 * Die Fragen als HeroUI-Accordion: Bedienung per Tab und Enter/Leertaste
 * sowie aria-expanded kommen von React Aria. Mehrere Antworten duerfen gleichzeitig
 * offen sein — wer vergleicht, soll nicht hin und her klappen muessen.
 */
export function FaqList({ items }: { items: { question: string; answer: React.ReactNode }[] }) {
  return (
    <Accordion allowsMultipleExpanded className="w-full">
      {items.map((item) => (
        <Accordion.Item key={item.question} id={item.question}>
          <Accordion.Heading>
            <Accordion.Trigger className="py-5 text-left font-wide text-lg font-bold text-foreground sm:text-xl">
              {item.question}
              <Accordion.Indicator />
            </Accordion.Trigger>
          </Accordion.Heading>
          <Accordion.Panel>
            <Accordion.Body className="max-w-[64ch] pb-6 text-base leading-relaxed text-muted [&_a]:text-foreground [&_a]:underline [&_a]:decoration-accent-text [&_a]:decoration-2 [&_a]:underline-offset-4 hover:[&_a]:decoration-foreground">
              {item.answer}
            </Accordion.Body>
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion>
  );
}
