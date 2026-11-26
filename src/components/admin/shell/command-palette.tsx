"use client";

import { useId, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Modal, cn } from "@heroui/react";
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
        {/* Die Palette ist ein Display: schwarz, eingelassen, die Auswahl gelb. */}
        <Modal.Dialog
          aria-label="Befehle"
          className="display-panel gap-0 overflow-hidden rounded-[var(--radius)] bg-display p-0 text-display-foreground sm:mt-[12vh]"
        >
          <div className="display-dots flex items-center gap-3 border-b border-display-muted/25 px-4">
            <span aria-hidden="true" className="led shrink-0" />
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
              className="h-14 min-w-0 flex-1 bg-transparent font-mono text-[0.95rem] text-display-foreground caret-volt outline-none placeholder:text-display-muted"
            />
            <Icon icon={SearchIcon} className="shrink-0 text-sm text-display-muted sm:hidden" />
            <kbd className="hidden rounded-[3px] border border-display-muted/40 px-1.5 py-px font-mono text-[0.65rem] text-display-muted sm:inline-flex">
              Esc
            </kbd>
          </div>

          <div
            id={listId}
            role="listbox"
            aria-label="Ergebnisse"
            className="max-h-[min(60vh,28rem)] overflow-y-auto p-2 [scrollbar-color:var(--display-muted)_transparent]"
          >
            {results.length === 0 ? (
              <p className="px-3 py-8 text-center font-mono text-sm text-display-muted">Nichts gefunden.</p>
            ) : (
              groups.map(([group, items]) => (
                <div key={group} role="group" aria-label={group} className="py-1">
                  <p className="px-3 pt-2 pb-1 font-meta text-display-muted">{group}</p>
                  {items.map(({ entry, index }) => (
                    <div
                      key={entry.id}
                      id={`${listId}-${entry.id}`}
                      role="option"
                      aria-selected={index === active}
                      onMouseMove={() => setActive(index)}
                      onClick={() => execute(entry)}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-[calc(var(--radius)-2px)] px-3 py-2 text-sm",
                        index === active
                          ? "bg-[color-mix(in_oklab,var(--display-foreground)_9%,transparent)] font-semibold text-volt"
                          : "text-display-foreground",
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          "grid size-7 shrink-0 place-items-center rounded-[3px] text-xs",
                          index === active
                            ? "bg-volt text-graphite"
                            : "bg-[color-mix(in_oklab,var(--display-foreground)_8%,transparent)] text-display-muted",
                        )}
                      >
                        <Icon icon={entry.icon} />
                      </span>
                      <span className="min-w-0 flex-1 truncate">{entry.label}</span>
                      {index === active && (
                        <span aria-hidden="true" className="font-mono text-[0.7rem] text-display-muted">
                          ↵
                        </span>
                      )}
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
