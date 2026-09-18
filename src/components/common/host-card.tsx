import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { resolveHostImage } from "@/services/discord/avatar";
import type { HostDTO } from "@/services/content";
import styles from "./host-card.module.css";

/**
 * Moderator teaser. Portrait-led, because the people are the point.
 *
 * Das Bild wird hier aufgeloest und nicht von der Seite durchgereicht: sonst
 * muesste jede der vier aufrufenden Seiten daran denken, und genau das war der
 * Grund, warum auf /moderatoren die Discord-Bilder fehlten, obwohl das
 * Einzelprofil sie laengst anzeigte. Die Discord-Abfrage selbst liegt hinter
 * Next' fetch-Cache, ein Bild wird also einmal pro Tag geholt, nicht einmal
 * pro Karte.
 */
export async function HostCard({ host }: { host: HostDTO }) {
  const image = await resolveHostImage(host);

  return (
    <article className={styles.card}>
      <div className={styles.portrait}>
        {image ? (
          <Image
            src={image}
            alt=""
            fill
            sizes="(max-width: 900px) 40vw, 220px"
            className={styles.image}
          />
        ) : (
          <HostLogoFallback />
        )}
      </div>

      <div className={styles.body}>
        <h3 className={styles.name}>
          <Link href={`/moderatoren/${host.slug}`} className={styles.link}>
            {host.name}
          </Link>
        </h3>
        <p className={styles.role}>{host.role}</p>
        <p className={styles.bio}>{host.bio}</p>
      </div>
    </article>
  );
}

/**
 * Wer kein Bild hinterlegt hat, bekommt das Senderlogo statt zweier Initialen.
 * Das ist ehrliche Markenkennzeichnung und kein erfundenes Portraet — ein
 * Gesicht, das es nicht gibt, gehoert hier nicht hin.
 */
function HostLogoFallback() {
  return (
    <span className={styles.logoFallback} aria-hidden="true">
      <Image src="/voltfm-logo.webp" alt="" width={120} height={120} className={styles.logoImage} />
    </span>
  );
}

/** Avatar-only variant used in dense strips and show listings. */
export async function HostChip({ host }: { host: HostDTO }) {
  const image = await resolveHostImage(host);

  return (
    <Link href={`/moderatoren/${host.slug}`} className={styles.chip}>
      <Avatar style={{ width: 28, height: 28 }}>
        {image && <AvatarImage src={image} alt="" />}
        <AvatarFallback>{host.name.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <span>{host.name}</span>
    </Link>
  );
}
