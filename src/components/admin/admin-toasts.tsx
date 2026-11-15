"use client";

import { ToastProvider } from "@heroui/react";

/**
 * Der Ort fuer Einblendungen im Admin (siehe use-action-feedback.ts).
 * Oben rechts, wo der Blick nach dem Speichern ohnehin hingeht.
 */
export function AdminToasts() {
  return <ToastProvider placement="top end" />;
}
