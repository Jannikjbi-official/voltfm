import Image from "next/image";
import { Avatar, cn } from "@heroui/react";

const PX = { sm: 22, md: 40 } as const;

/**
 * Das Bild neben dem Autorennamen — in der Regel das Discord-Profilbild aus
 * dem Moderatorenprofil (siehe resolveHostImage).
 *
 * Das Bild kommt bewusst ueber next/image statt Avatar.Image: Es steht so
 * schon im ausgelieferten HTML, in passender Groesse statt der 512 Pixel, die
 * Discord liefert. Die HeroUI-Avatar-Flaeche mit Initialen bleibt fuer
 * Autoren ohne Profil.
 */
export function AuthorAvatar({
  name,
  image,
  size = "sm",
}: {
  name: string;
  image?: string | null;
  size?: keyof typeof PX;
}) {
  const px = PX[size];
  const box = size === "sm" ? "size-[22px]" : "size-10";

  if (image) {
    return (
      <Image
        src={image}
        alt=""
        width={px}
        height={px}
        className={cn(box, "shrink-0 rounded-full bg-surface-secondary object-cover")}
      />
    );
  }

  return (
    <Avatar size="sm" className={cn(box, "shrink-0")}>
      <Avatar.Fallback className={size === "sm" ? "text-[0.55rem]" : "text-xs"}>
        {name.slice(0, 2).toUpperCase()}
      </Avatar.Fallback>
    </Avatar>
  );
}
