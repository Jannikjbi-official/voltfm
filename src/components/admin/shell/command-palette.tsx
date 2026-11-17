"use client";

import { useId, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Kbd, Modal, cn } from "@heroui/react";
import { Icon, SearchIcon, type IconDefinition } from "@/lib/icons";

export interface PaletteEntry {
  id: string;
  label: string;
  group: string;
  icon: IconDefinition;
  href?: string;
  /** Statt eines Links etwas tun (z. B. Design wechseln). */
  run?: () => void;
  /** Zusaetzliche Suchwoerter. */
  keywords?: string;
}

/** Normalisiert fuer die Suche: klein, ohne Umlaut-Unterschiede. */
function fold(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/**
 * Die Befehlspalette (Strg+K bzw. ⌘K): Bereiche oeffnen, etwas anlegen,
 * Design wechseln — alles per Tastatur.
 *
 * Eine Combobox mit Liste nach WAI-ARIA: Das Eingabefeld behaelt den Fokus,
 * die Pfeiltasten bewegen die Auswahl (aria-activedescendant), Enter fuehrt
 * aus, Escape schliesst.
 */
export function CommandPalette({
  open,
  onOpenChange,
  entries,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entries: PaletteEntry[];
}) {
  const router = useRouter();
  const listId = useId();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const results = useMemo(() => {
    const q = fold(query.trim());
    if (!q) return entries;
    return entries.filter((entry) => fold(`${entry.label} ${entry.group} ${entry.keywords ?? ""}`).includes(q));
  }, [entries, query]);

  const groups = useMemo(() => {
    const map = new Map<string, { entry: PaletteEntry; index: number }[]>();
    results.forEach((entry, index) => {
      map.set(entry.group, [...(map.get(entry.group) ?? []), { entry, index }]);
    });
    return [...map];
  }, [results]);

  function close() {
    onOpenChange(false);
    setQuery("");
    setActive(0);
  }

  function execute(entry: PaletteEntry | undefined) {
    if (!entry) return;
    close();
    if (entry.run) entry.run();
    else if (entry.href) router.push(entry.href);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((current) => (results.length ? (current + 1) % results.length : 0));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((current) => (results.length ? (current - 1 + results.length) % results.length : 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      execute(results[active]);
    }
  }

  const activeId = results[active] ? `${listId}-${results[active].id}` : undefined;

  return (
    <Modal.Backdrop
      isOpen={open}
      onOpenChange={(next) => (next ? onOpenChange(true) : close())}
    >
      <Modal.Container placement="top" size="md">
        <Modal.Dialog aria-label="Befehle" className="gap-0 overflow-hidden p-0 sm:mt-[12vh]">
          <div className="flex items-center gap-3 border-b border-separator px-4">
            <Icon icon={SearchIcon} className="shrink-0 text-sm text-muted" />
            <input
              autoFocus
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActive(0);
              }}
              onKeyDown={onKeyDown}
              placeholder="Bereich oder Aktion suchen …"
              role="combobox"
              aria-expanded="true"
              aria-controls={listId}
              aria-activedescendant={activeId}
              aria-label="Bereich oder Aktion suchen"
              className="h-14 min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-field-placeholder"
            />
            <Kbd className="hidden sm:inline-flex">Esc</Kbd>
          </div>

          <div id={listId} role="listbox" aria-label="Ergebnisse" className="max-h-[min(60vh,28rem)] overflow-y-auto p-2">
            {results.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-muted">Nichts gefunden.</p>
            ) : (
              groups.map(([group, items]) => (
                <div key={group} role="group" aria-label={group} className="py-1">
                  <p className="px-3 pt-2 pb-1 text-xs font-medium text-muted">{group}</p>
                  {items.map(({ entry, index }) => (
                    <div
                      key={entry.id}
                      id={`${listId}-${entry.id}`}
                      role="option"
                      aria-selected={index === active}
                      onMouseMove={() => setActive(index)}
                      onClick={() => execute(entry)}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground",
                        index === active && "bg-default font-semibold",
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          "grid size-7 shrink-0 place-items-center rounded-lg text-xs",
                          index === active ? "bg-volt text-ink" : "bg-surface-secondary text-muted",
                        )}
                      >
                        <Icon icon={entry.icon} />
                      </span>
                      {entry.label}
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
