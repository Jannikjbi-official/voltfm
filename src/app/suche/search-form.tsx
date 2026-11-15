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
    <form action="/suche" method="get" role="search" className="max-w-3xl">
      {/* Eine Suchleiste wie in einer App: Feld und Knopf in einer Pille. */}
      <div className="surface-card flex items-center gap-2 rounded-full p-1.5 pl-5 transition-shadow focus-within:shadow-[var(--lift-shadow)] focus-within:ring-2 focus-within:ring-[var(--focus)]">
        <Icon icon={SearchIcon} className="pointer-events-none shrink-0 text-base text-muted" />
        <input
          ref={inputRef}
          type="search"
          name="q"
          defaultValue={initialQuery}
          placeholder="News, Events, Moderatoren …"
          aria-label="Suchbegriff"
          autoFocus={!initialQuery}
          className="h-12 min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-field-placeholder sm:h-14 sm:text-lg"
        />
        <Button type="submit" variant="primary" size="lg" className="h-12 shrink-0 sm:h-14 sm:px-7">
          Suchen
        </Button>
      </div>
      <p className="mt-3 hidden pl-5 text-sm text-muted sm:block">
        Tipp: Drück{" "}
        <Kbd>
          <Kbd.Content>/</Kbd.Content>
        </Kbd>
        , um direkt ins Suchfeld zu springen.
      </p>
    </form>
  );
}
