"use client";

import { usePathname } from "next/navigation";

/**
 * Kopfzeile, Footer und Player-Leiste der Website — ausser im Admin.
 *
 * Das Admin ist eine eigene App mit Seitenleiste und Kopfleiste
 * (src/app/admin/layout.tsx). Der Pfad ist beim Rendern auf dem Server
 * schon bekannt, also sehen Server und Browser dasselbe.
 */
export function SiteChrome({
  header,
  footer,
  player,
  children,
}: {
  header: React.ReactNode;
  footer: React.ReactNode;
  player: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const admin = pathname === "/admin" || pathname.startsWith("/admin/");

  if (admin) return <>{children}</>;

  return (
    <>
      <a href="#main" className="skip-link">
        Zum Inhalt springen
      </a>
      {header}
      <main id="main">{children}</main>
      {footer}
      {player}
    </>
  );
}
