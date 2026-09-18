"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/common/button-link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient, useSession } from "@/lib/auth-client";
import {
  Icon,
  UserIcon,
  SettingsIcon,
  LogoutIcon,
  DashboardIcon,
} from "@/lib/icons";

const ADMIN_ROLES = new Set(["admin", "owner"]);

/**
 * Account entry point. This is a convenience surface only — it decides what to
 * *show*. Whether a user may actually reach /admin is re-checked server-side in
 * the admin layout, so hiding the link here is never the security boundary.
 */
export function AccountMenu() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  if (isPending) return <Skeleton style={{ width: 84, height: 34, borderRadius: 999 }} />;

  if (!session?.user) {
    return (
      <ButtonLink href="/login" variant="primary" mode="filled" size="sm">
        Anmelden
      </ButtonLink>
    );
  }

  const user = session.user as typeof session.user & {
    username?: string | null;
    role?: string | null;
  };

  const isAdmin = String(user.role ?? "")
    .split(",")
    .map((r) => r.trim())
    .some((r) => ADMIN_ROLES.has(r));

  const displayName = user.name || user.username || "Profil";
  const profileHref = user.username ? `/profil/${user.username}` : "/konto";

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="neutral" mode="ghost" size="sm" aria-label="Konto-Menü öffnen">
            <Avatar style={{ width: 26, height: 26 }}>
              {user.image && <AvatarImage src={user.image} alt="" />}
              <AvatarFallback>{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            {displayName}
          </Button>
        }
      />
      <DropdownMenuContent>
        <DropdownMenuItem render={<Link href={profileHref} />}>
          <Icon icon={UserIcon} />
          Profil
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/konto" />}>
          <Icon icon={SettingsIcon} />
          Kontoeinstellungen
        </DropdownMenuItem>
        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href="/admin" />}>
              <Icon icon={DashboardIcon} />
              Admin
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <Icon icon={LogoutIcon} />
          Abmelden
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
