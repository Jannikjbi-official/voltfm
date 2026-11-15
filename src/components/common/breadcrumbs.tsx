"use client";

import { Breadcrumbs as HeroBreadcrumbs } from "@heroui/react";

/**
 * Brotkrumen. Die Links laufen ueber React Aria und damit ueber den
 * RouterProvider (src/components/layout/providers.tsx) — kein Neuladen.
 * Der letzte Eintrag ist die aktuelle Seite und kein Link.
 */
export function Breadcrumbs({ items }: { items: { href: string; label: string }[] }) {
  return (
    <HeroBreadcrumbs aria-label="Brotkrumen" className="text-sm">
      {items.map((crumb, index) => (
        <HeroBreadcrumbs.Item
          key={crumb.href}
          href={index === items.length - 1 ? undefined : crumb.href}
        >
          {crumb.label}
        </HeroBreadcrumbs.Item>
      ))}
    </HeroBreadcrumbs>
  );
}
