"use client";

import { useEffect, useState } from "react";

import { Button } from "@heroui/react";
import { Icon, CopyIcon, CheckIcon } from "@/lib/icons";

/**
 * Kopiert ein Beispiel in die Zwischenablage.
 *
 * Die Rückmeldung steht im Knopf selbst und verschwindet nach zwei Sekunden —
 * eine Meldung am Bildschirmrand wäre für „drei Zeilen kopiert" zu viel.
 *
 * `navigator.clipboard` gibt es nur in sicheren Kontexten — über HTTP auf
 * einer anderen Maschine als localhost fehlt es. Dafür der alte Weg über ein
 * kurzzeitig eingehängtes Textfeld. Und wenn auch der nicht greift, sagt der
 * Knopf es, statt so zu tun, als wäre etwas kopiert worden.
 */

/** Der Weg, den es schon vor `navigator.clipboard` gab. */
function copyByTextarea(text: string): boolean {
  const field = document.createElement("textarea");
  field.value = text;
  // Ausserhalb des Sichtfelds, aber nicht `display: none` — sonst laesst es
  // sich nicht markieren.
  field.style.position = "fixed";
  field.style.top = "-1000px";
  field.setAttribute("readonly", "");
  document.body.append(field);

  try {
    field.select();
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    field.remove();
  }
}
export function CopyButton({ source, label }: { source: string; label: string }) {
  const [state, setState] = useState<"idle" | "done" | "failed">("idle");

  useEffect(() => {
    if (state === "idle") return;
    const timer = setTimeout(() => setState("idle"), 2000);
    return () => clearTimeout(timer);
  }, [state]);

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      isIconOnly
      /* Sitzt auf dem schwarzen Display des Beispiels. */
      className="text-display-muted hover:bg-transparent hover:text-volt"
      /* Nur das Sinnbild: Ein beschrifteter Knopf haette bei einzeiligen
         Beispielen das Ende der Zeile verdeckt. */
      aria-label={
        state === "done"
          ? `${label} wurde kopiert`
          : state === "failed"
            ? `${label} konnte nicht kopiert werden`
            : `${label} kopieren`
      }
      onPress={async () => {
        try {
          await navigator.clipboard.writeText(source);
          setState("done");
        } catch {
          setState(copyByTextarea(source) ? "done" : "failed");
        }
      }}
    >
      <Icon icon={state === "done" ? CheckIcon : CopyIcon} />
    </Button>
  );
}
