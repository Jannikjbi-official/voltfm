import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImagePlaceholder } from "@/components/common/image-placeholder";
import type { HostDTO } from "@/services/content";
import styles from "./host-card.module.css";

/** Moderator teaser. Portrait-led, because the people are the point. */
export function HostCard({ host }: { host: HostDTO }) {
  return (
    <article className={styles.card}>
      <div className={styles.portrait}>
        {host.image ? (
          <Image src={host.image} alt="" fill sizes="(max-width: 900px) 50vw, 25vw" className={styles.image} />
        ) : (
          <ImagePlaceholder label={host.name} ratio="auto" className={styles.portraitFallback} />
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

/** Avatar-only variant used in dense strips and show listings. */
export function HostChip({ host }: { host: HostDTO }) {
  return (
    <Link href={`/moderatoren/${host.slug}`} className={styles.chip}>
      <Avatar style={{ width: 28, height: 28 }}>
        {host.image && <AvatarImage src={host.image} alt="" />}
        <AvatarFallback>{host.name.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <span>{host.name}</span>
    </Link>
  );
}
