"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Icon, LogoutIcon } from "@/lib/icons";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <Button variant="error" mode="stroke" size="md" onClick={handleSignOut}>
      <Icon icon={LogoutIcon} />
      Abmelden
    </Button>
  );
}
