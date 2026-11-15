import Link from "next/link";
import Image from "next/image";
import { Chip } from "@heroui/react";
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
 * Rund statt Hochformat: Die Bilder kommen ueberwiegend von Discord, und ein
 * Discord-Avatar ist quadratisch. In ein 4:5-Portraet gezwungen wuerde er
 * oben und unten beschnitten.
 */
export async function HostCard({ host }: { host: HostDTO }) {
  const image = await resolveHostImage(host);

  return (
    <article className="group relative flex h-full flex-col gap-5 rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-[color-mix(in_oklab,var(--foreground)_28%,transparent)]">
      <div className="relative grid size-24 shrink-0 place-items-center overflow-hidden rounded-full bg-surface-secondary">
        {image ? (
          <Image
            src={image}
            alt=""
            fill
            sizes="96px"
            className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <HostLogoFallback />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2">
        <h3 className="font-wide text-xl leading-tight font-bold text-foreground">
          <Link
            href={`/moderatoren/${host.slug}`}
            className="rounded-sm decoration-accent-text decoration-2 underline-offset-4 after:absolute after:inset-0 after:rounded-2xl group-hover:underline"
          >
            {host.name}
          </Link>
        </h3>
        <p className="text-sm font-semibold text-accent-text">{host.role}</p>
        {/* Die Tagline ist der persoenlichere Satz — wenn es einen gibt, steht
            er statt des Anfangs der Biografie. */}
        <p className="line-clamp-3 text-sm leading-relaxed text-pretty text-muted">
          {host.tagline || host.bio}
        </p>

        {host.genres.length > 0 && (
          <ul className="mt-auto flex flex-wrap gap-1.5 pt-2" aria-label="Genres">
            {host.genres.slice(0, 3).map((genre) => (
              <li key={genre}>
                <Chip size="sm" variant="soft">
                  {genre}
                </Chip>
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
      className="inline-flex items-center gap-2 rounded-full border border-border bg-surface py-1 pr-3 pl-1 text-sm font-medium text-foreground transition-colors hover:bg-default"
    >
      {image ? (
        <Image
          src={image}
          alt=""
          width={28}
          height={28}
          className="size-7 rounded-full bg-surface-secondary object-cover"
        />
      ) : (
        <span
          aria-hidden="true"
          className="grid size-7 place-items-center rounded-full bg-default text-[0.6rem] font-bold text-muted"
        >
          {host.name.slice(0, 2).toUpperCase()}
        </span>
      )}
      <span>{host.name}</span>
    </Link>
  );
}
