import Link from "next/link";
import Image from "next/image";
import { resolveHostImage } from "@/services/discord/avatar";
import { LogoIcon } from "@/components/layout/logo";
import type { HostDTO } from "@/services/content";

/**
 * Moderatoren-Teaser. Das Gesicht zuerst, denn um die Leute geht es.
 *
 * Das Bild wird hier aufgeloest und nicht von der Seite durchgereicht: sonst
 * muesste jede aufrufende Seite daran denken, und genau das war der Grund,
 * warum auf /moderatoren die Discord-Bilder fehlten. Die Discord-Abfrage
 * selbst liegt hinter Next' fetch-Cache, ein Bild wird also einmal pro Tag
 * geholt, nicht einmal pro Karte.
 *
 * Quadratisch statt Hochformat: Die Bilder kommen ueberwiegend von Discord,
 * und ein Discord-Avatar ist quadratisch. In ein 4:5-Portraet gezwungen wuerde
 * er oben und unten beschnitten. Es steht randlos oben in der Karte.
 */
export async function HostCard({ host }: { host: HostDTO }) {
  const image = await resolveHostImage(host);

  return (
    <article className="group surface-card hover-lift relative flex h-full flex-col overflow-hidden rounded-[var(--radius)] p-2">
      <div className="well relative grid aspect-square w-full shrink-0 place-items-center overflow-hidden rounded-[3px]">
        {image ? (
          <Image
            src={image}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, 25vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <HostLogoFallback />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 px-3 pt-4 pb-3">
        <h3 className="font-display text-[1.75rem] break-words text-foreground">
          <Link href={`/moderatoren/${host.slug}`} className="after:absolute after:inset-0">
            {host.name}
          </Link>
        </h3>
        <p className="font-mono text-xs lowercase text-muted">{host.role}</p>
        {/* Die Tagline ist der persoenlichere Satz — wenn es einen gibt, steht
            er statt des Anfangs der Biografie. */}
        <p className="line-clamp-3 text-sm leading-relaxed text-pretty text-muted">
          {host.tagline || host.bio}
        </p>

        {host.genres.length > 0 && (
          <ul className="mt-auto flex flex-wrap gap-1.5 pt-2" aria-label="Genres">
            {host.genres.slice(0, 3).map((genre) => (
              <li
                key={genre}
                className="rounded-[3px] bg-default px-2 py-0.5 font-mono text-[0.7rem] font-medium lowercase text-foreground"
              >
                {genre}
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}

/**
 * Wer kein Bild hinterlegt hat, bekommt das Senderlogo statt zweier Initialen.
 * Das ist ehrliche Markenkennzeichnung und kein erfundenes Portraet.
 */
function HostLogoFallback() {
  return (
    <span
      aria-hidden="true"
      className="grid size-full place-items-center bg-ink [--logo-mark:var(--volt)]"
    >
      <LogoIcon className="h-auto w-[42%]" />
    </span>
  );
}

/** Nur Bild und Name — fuer dichte Leisten und Sendungslisten. */
export async function HostChip({ host }: { host: HostDTO }) {
  const image = await resolveHostImage(host);

  return (
    <Link
      href={`/moderatoren/${host.slug}`}
      className="inline-flex items-center gap-2 rounded-[var(--radius)] bg-default py-1 pr-3 pl-1 text-sm font-semibold text-foreground transition-colors hover:bg-volt hover:text-graphite"
    >
      {image ? (
        <Image
          src={image}
          alt=""
          width={28}
          height={28}
          className="size-7 rounded-[3px] bg-surface-secondary object-cover"
        />
      ) : (
        <span
          aria-hidden="true"
          className="grid size-7 place-items-center rounded-[3px] bg-surface-secondary text-[0.6rem] font-bold text-muted"
        >
          {host.name.slice(0, 2).toUpperCase()}
        </span>
      )}
      <span>{host.name}</span>
    </Link>
  );
}
