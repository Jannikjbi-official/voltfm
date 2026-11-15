import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/session";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "Registrieren",
  description: "Erstelle dein VoltFM Konto — für Profil, Favoriten und Community.",
  robots: { index: false, follow: false },
};

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect("/");

  return <RegisterForm />;
}
