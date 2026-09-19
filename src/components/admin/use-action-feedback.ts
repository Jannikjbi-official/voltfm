"use client";

import { useEffect, useRef } from "react";
import { notify } from "@/components/common/toaster";
import type { EntityFormState } from "./entity-types";

/**
 * Meldet das Ergebnis einer Server Action als Einblendung.
 *
 * Die Formulare zeigen ihre Rueckmeldung zwar auch als Hinweisleiste an, die
 * steht aber oben im Formular. Wer unten auf "Speichern" drueckt, sieht sie
 * gar nicht und weiss nicht, ob etwas passiert ist. Die Einblendung erscheint
 * unabhaengig von der Scrollposition.
 *
 * Doppelte Meldungen werden unterdrueckt: `useActionState` liefert denselben
 * Zustand bei jedem Rendern erneut, nicht nur nach einer Aktion.
 */
export function useActionFeedback(state: EntityFormState): void {
  const lastHandled = useRef<string>("");

  useEffect(() => {
    if (!state.message) return;

    const token = `${state.status}:${state.message}`;
    if (token === lastHandled.current) return;
    lastHandled.current = token;

    if (state.status === "success") notify.success(state.message);
    else if (state.status === "error") notify.error(state.message);
  }, [state]);
}
