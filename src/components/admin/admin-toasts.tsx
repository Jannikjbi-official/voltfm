"use client";

import { ToastProvider } from "@heroui/react";

/**
 * Der Ort fuer Einblendungen im Admin (siehe use-action-feedback.ts).
 * Oben rechts: Unten liegt die Player-Leiste.
 */
export function AdminToasts() {
  return <ToastProvider placement="top end" />;
}
