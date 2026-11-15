"use client";

import { I18nProvider, RouterProvider } from "@heroui/react";
import { useRouter } from "next/navigation";

/*
 * React-Aria-Links (Brotkrumen, Menueeintraege mit `href`) navigieren ueber
 * den Next-Router statt die Seite neu zu laden. `routerOptions` wird damit
 * typsicher an `router.push` durchgereicht.
 */
declare module "react-aria-components" {
  interface RouterConfig {
    routerOptions: NonNullable<Parameters<ReturnType<typeof useRouter>["push"]>[1]>;
  }
}

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <RouterProvider navigate={router.push}>
      {/* Datumsfelder, Zahlen und Ansagen der Screenreader auf Deutsch. */}
      <I18nProvider locale="de-DE">{children}</I18nProvider>
    </RouterProvider>
  );
}
