"use client";

import { StackedToastProvider, stackedToast } from "@/components/ui/toast";

/**
 * App-wide toast host. Mounted once in the root layout; anything can raise a
 * toast with `notify`.
 */
export function Toaster({ children }: { children?: React.ReactNode }) {
  return (
    <StackedToastProvider position="bottom-right">{children}</StackedToastProvider>
  );
}

export const notify = stackedToast;
