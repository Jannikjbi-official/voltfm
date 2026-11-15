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
 * er oben und unten beschnitten. Im Plakat-Look steht es randlos oben in der
 * Karte, mit Kante darunter.
 */
export async function HostCard({ host }: { host: HostDTO }) {
  const image = await resolveHostImage(host);

  return (
    <article className="group relative flex h-full flex-col border-2 border-border bg-surface transition-[box-shadow,transform] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_var(--hard-shadow)] motion-reduce:transition-none motion-reduce:hover:translate-x-0 motion-reduce:hover:translate-y-0">
      <div className="relative grid aspect-square w-full shrink-0 place-items-center overflow-hidden border-b-2 border-border bg-surface-secondary">
        {image ? (
          <Image
            src={image}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, 25vw"
            className="object-cover grayscale-[0.25] transition-[filter] group-hover:grayscale-0"
          />
        ) : (
          <HostLogoFallback />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="font-display text-[2rem] break-words text-foreground">
          <Link href={`/moderatoren/${host.slug}`} className="after:absolute after:inset-0">
            {host.name}
          </Link>
        </h3>
        <p className="font-mono text-xs font-semibold text-accent-text">{host.role}</p>
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
                className="border-[1.5px] border-foreground px-1.5 py-0.5 font-mono text-[0.7rem] font-semibold text-foreground"
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
      className="inline-flex items-center gap-2 border-2 border-border bg-surface py-1 pr-3 pl-1 font-wide text-sm font-bold text-foreground transition-colors hover:bg-volt hover:text-ink"
    >
      {image ? (
        <Image
          src={image}
          alt=""
          width={28}
          height={28}
          className="size-7 bg-surface-secondary object-cover"
        />
      ) : (
        <span
          aria-hidden="true"
          className="grid size-7 place-items-center bg-default font-mono text-[0.6rem] font-bold text-muted"
        >
          {host.name.slice(0, 2).toUpperCase()}
        </span>
      )}
      <span>{host.name}</span>
    </Link>
  );
}
