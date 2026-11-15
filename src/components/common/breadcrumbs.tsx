"use client";

import { Breadcrumbs as HeroBreadcrumbs } from "@heroui/react";

/**
 * Brotkrumen. Die Links laufen ueber React Aria und damit ueber den
 * RouterProvider (src/components/layout/providers.tsx) — kein Neuladen.
 * Der letzte Eintrag ist die aktuelle Seite und kein Link.
 */
export function Breadcrumbs({ items }: { items: { href: string; label: string }[] }) {
  return (
    /* Umbrechen statt ueberlaufen: Ein langer Artikeltitel als letzter
       Eintrag machte die Seite am Handy sonst breiter als den Bildschirm. */
    <HeroBreadcrumbs aria-label="Brotkrumen" className="flex-wrap text-sm">
      {items.map((crumb, index) => (
        <HeroBreadcrumbs.Item
          key={crumb.href}
          href={index === items.length - 1 ? undefined : crumb.href}
          className={index === items.length - 1 ? "min-w-0 shrink" : undefined}
        >
          {crumb.label}
        </HeroBreadcrumbs.Item>
      ))}
    </HeroBreadcrumbs>
  );
}
