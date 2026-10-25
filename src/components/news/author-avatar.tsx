import Image from "next/image";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import styles from "./author-avatar.module.css";

const PX = { sm: 22, md: 40 } as const;

/**
 * Das Bild neben dem Autorennamen — in der Regel das Discord-Profilbild aus
 * dem Moderatorenprofil (siehe resolveHostImage).
 *
 * Bewusst kein OlyxUI-AvatarImage: Das laedt das Bild erst im Browser und
 * zeigt bis dahin die Initialen, im Server-HTML also immer "JA". Mit
 * next/image steht das Bild schon im ausgelieferten HTML, in passender Groesse
 * statt der 512 Pixel, die Discord liefert. Die Initialen bleiben fuer
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

  if (image) {
    return (
      <Image
        src={image}
        alt=""
        width={px}
        height={px}
        className={styles.image}
        data-size={size}
      />
    );
  }

  return (
    <Avatar size={px}>
      <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
    </Avatar>
  );
}
