"use client";

import { useRouter } from "next/navigation";
import { Avatar, Button, Dropdown, Label, Separator, Skeleton } from "@heroui/react";
import { ButtonLink } from "@/components/common/button-link";
import { authClient, useSession } from "@/lib/auth-client";
import type { AccountAvatar } from "@/services/content/account";
import { Icon, UserIcon, SettingsIcon, LogoutIcon, DashboardIcon } from "@/lib/icons";

/**
 * Der Einstieg ins Konto. Das ist nur Bequemlichkeit — es entscheidet, was
 * *angezeigt* wird. Ob jemand /admin wirklich erreicht, prueft das
 * Admin-Layout auf dem Server noch einmal.
 *
 * Die Sitzung kennt nur der Browser. Bis sie geladen ist (auch beim ersten
 * Rendern auf dem Server), steht ein Platzhalter da — so sehen Server und
 * Browser beim Hydrieren dasselbe.
 */
export function AccountMenu({
  account,
  onNavigate,
}: {
  account: AccountAvatar;
  /** Schliesst z. B. den Handy-Drawer, wenn ein Eintrag gewaehlt wird. */
  onNavigate?: () => void;
}) {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  if (isPending) return <Skeleton className="h-9 w-24" />;

  if (!session?.user) {
    return (
      <ButtonLink href="/login" variant="outline" size="sm" onClick={onNavigate}>
        Anmelden
      </ButtonLink>
    );
  }

  const user = session.user as typeof session.user & {
    username?: string | null;
    role?: string | null;
  };

  const displayName = user.name || user.username || "Profil";

  /* Ein oeffentliches Profil gibt es nur fuer Moderatorinnen und Moderatoren.
     Alle anderen landen in den Kontoeinstellungen. */
  const profileHref = account.hostSlug ? `/moderatoren/${account.hostSlug}` : "/konto";
  const avatar = user.image || account.image;

  async function handleSignOut() {
    onNavigate?.();
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <Dropdown>
      <Button variant="ghost" size="sm" className="gap-2 pl-1" aria-label="Konto-Menü öffnen">
        <Avatar size="sm" className="size-7">
          {avatar && <Avatar.Image src={avatar} alt="" />}
          <Avatar.Fallback className="text-xs">{displayName.slice(0, 2).toUpperCase()}</Avatar.Fallback>
        </Avatar>
        <span className="max-w-[10rem] truncate">{displayName}</span>
      </Button>
      <Dropdown.Popover placement="bottom end" className="min-w-56">
        <div className="px-3 pt-3 pb-2">
          <p className="truncate text-sm font-semibold text-foreground">{displayName}</p>
          {user.username && <p className="truncate text-xs text-muted">@{user.username}</p>}
        </div>
        <Separator />
        <Dropdown.Menu
          aria-label="Konto"
          onAction={(key) => {
            if (key === "logout") void handleSignOut();
            else onNavigate?.();
          }}
        >
          <Dropdown.Item id="profile" href={profileHref} textValue="Profil">
            <Icon icon={UserIcon} className="size-4 text-muted" />
            <Label>{account.hostSlug ? "Mein Profil" : "Konto"}</Label>
          </Dropdown.Item>
          <Dropdown.Item id="settings" href="/konto" textValue="Kontoeinstellungen">
            <Icon icon={SettingsIcon} className="size-4 text-muted" />
            <Label>Kontoeinstellungen</Label>
          </Dropdown.Item>
          {account.isAdmin ? (
            <Dropdown.Item id="admin" href="/admin" textValue="Admin">
              <Icon icon={DashboardIcon} className="size-4 text-muted" />
              <Label>Admin</Label>
            </Dropdown.Item>
          ) : null}
          <Dropdown.Item id="logout" textValue="Abmelden" variant="danger">
            <Icon icon={LogoutIcon} className="size-4" />
            <Label>Abmelden</Label>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
