"use client";

import { useEffect, useRef } from "react";
import { Button, Kbd } from "@heroui/react";
import { Icon, SearchIcon } from "@/lib/icons";

/**
 * Das Suchfeld.
 *
 * Ein schlichtes GET-Formular: Eine Suche ist eine normale Navigation mit
 * teilbarer Adresse und funktioniert ohne JavaScript. Im Browser kommen nur
 * die Taste "/" und der Autofokus dazu.
 */
export function SearchForm({ initialQuery }: { initialQuery: string }) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "/") return;

      // Nicht die Taste klauen, waehrend jemand in ein anderes Feld tippt.
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) return;

      event.preventDefault();
      inputRef.current?.focus();
      inputRef.current?.select();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <form action="/suche" method="get" role="search" className="max-w-2xl">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <Icon
            icon={SearchIcon}
            className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-sm text-muted"
          />
          <input
            ref={inputRef}
            type="search"
            name="q"
            defaultValue={initialQuery}
            placeholder="News, Events, Moderatoren …"
            aria-label="Suchbegriff"
            autoFocus={!initialQuery}
            className="input h-12 w-full pl-10 text-base"
          />
        </div>
        <Button type="submit" variant="primary" size="lg" className="h-12">
          Suchen
        </Button>
      </div>
      <p className="mt-3 hidden text-sm text-muted sm:block">
        Tipp: Drück{" "}
        <Kbd>
          <Kbd.Content>/</Kbd.Content>
        </Kbd>
        , um direkt ins Suchfeld zu springen.
      </p>
    </form>
  );
}
