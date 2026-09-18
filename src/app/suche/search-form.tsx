"use client";

import { useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icon, SearchIcon } from "@/lib/icons";
import styles from "./page.module.css";

/**
 * The search box.
 *
 * A plain GET form, so a search is a normal navigation with a shareable URL and
 * it works without JavaScript. The only client-side behaviour is the "/"
 * shortcut and autofocus.
 */
export function SearchForm({ initialQuery }: { initialQuery: string }) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "/") return;

      // Don't steal the key while someone is typing into another field.
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
    <form action="/suche" method="get" role="search" className={styles.form}>
      <Input
        ref={inputRef}
        type="search"
        name="q"
        defaultValue={initialQuery}
        placeholder="News, Events, Moderatoren …"
        aria-label="Suchbegriff"
        autoFocus={!initialQuery}
        className={styles.input}
      />
      <Button type="submit" variant="primary" mode="filled" size="md">
        <Icon icon={SearchIcon} />
        Suchen
      </Button>
      <p className={styles.hint}>
        Tipp: Drück <kbd>/</kbd>, um direkt ins Suchfeld zu springen.
      </p>
    </form>
  );
}
