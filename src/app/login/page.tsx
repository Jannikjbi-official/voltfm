import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { getCurrentUser } from "@/lib/session";
import { serverEnv } from "@/lib/env";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Anmelden",
  description: "Melde dich bei VoltFM an — mit Discord, Passkey oder Username.",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const [user, { redirect: target }] = await Promise.all([getCurrentUser(), searchParams]);

  // Already signed in: nothing to do here.
  if (user) {
    redirect(target?.startsWith("/") ? target : "/");
  }

  return (
    <Suspense fallback={null}>
      <LoginForm discordEnabled={serverEnv.discordEnabled} />
    </Suspense>
  );
}
