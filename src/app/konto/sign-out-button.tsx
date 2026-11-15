"use client";

import { useRouter } from "next/navigation";
import { Button } from "@heroui/react";
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
    <Button variant="danger-soft" onPress={handleSignOut}>
      <Icon icon={LogoutIcon} />
      Abmelden
    </Button>
  );
}
