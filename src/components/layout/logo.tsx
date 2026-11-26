import Link from "next/link";
import { useId } from "react";

/*
 * Die Formen stammen unveraendert aus public/logo/voltfm-play-logo-*.svg. Sie
 * stehen hier inline statt als <img>, damit die Farben aus den Tokens kommen
 * (--logo-* in src/styles/theme.css):
 * im Dunkelmodus Gelb und Off-White wie in der Vorlage "dunkel", im Hellmodus
 * durchgehend dunkel wie in "auf-weiss".
 */

/** Das Play-Dreieck, im 512er-Raster der Icon-Datei. */
const PLAY = "M150 108 Q150 78 177 92 L418 232 Q444 256 418 280 L177 420 Q150 434 150 404 Z";
/** Der Blitz, der aus dem Dreieck ausgeschnitten wird. */
const BOLT = "292,92 196,262 254,262 214,420 326,236 266,236 312,92";
const VOLT = "M203.27 58.75L237.77 138.55L272.27 58.75L308.87 58.75L257.27 171.25L217.52 171.25L165.92 58.75M384.47 173.80Q364.22 173.80 349 166.45Q333.77 159.10 325.30 145.90Q316.82 132.70 316.82 115Q316.82 97.30 325.30 84.10Q333.77 70.90 349 63.55Q364.22 56.20 384.47 56.20Q404.72 56.20 419.95 63.55Q435.17 70.90 443.65 84.10Q452.12 97.30 452.12 115Q452.12 132.70 443.65 145.90Q435.17 159.10 419.95 166.45Q404.72 173.80 384.47 173.80M384.47 142.75Q394.52 142.75 401.80 139.38Q409.07 136 412.97 129.78Q416.87 123.55 416.87 115Q416.87 106.45 412.97 100.23Q409.07 94 401.80 90.63Q394.52 87.25 384.47 87.25Q374.42 87.25 367.15 90.63Q359.87 94 355.97 100.23Q352.07 106.45 352.07 115Q352.07 123.55 355.97 129.78Q359.87 136 367.15 139.38Q374.42 142.75 384.47 142.75M469.97 58.75L504.92 58.75L504.92 140.20L573.02 140.20L573.02 171.25L469.97 171.25M582.02 89.80L582.02 58.75L700.37 58.75L700.37 89.80L658.67 89.80L658.67 171.25L623.72 171.25L623.72 89.80";
const FM = "M716.12 58.75L817.97 58.75L817.97 88L751.07 88L751.07 103.75L815.12 103.75L815.12 133L751.07 133L751.07 171.25L716.12 171.25M951.17 58.75L1005.17 58.75L1005.17 171.25L971.87 171.25L971.87 89.20L938.12 171.25L903.32 171.25L869.42 89.35L869.42 171.25L836.27 171.25L836.27 58.75L890.12 58.75L920.72 136.60";

/**
 * Das Play-Icon allein. Die Maske braucht eine eindeutige ID: Header und
 * Footer zeigen das Logo gleichzeitig, und zwei gleiche IDs auf einer Seite
 * wuerden sich gegenseitig verdecken.
 */
function PlayMark() {
  const mask = useId();
  return (
    <>
      <defs>
        <mask id={mask} maskUnits="userSpaceOnUse" x="0" y="0" width="512" height="512">
          <rect width="512" height="512" fill="#fff" />
          <polygon
            points={BOLT}
            fill="#000"
            stroke="#000"
            strokeWidth="8"
            strokeLinejoin="round"
          />
        </mask>
      </defs>
      <path mask={`url(#${mask})`} d={PLAY} className="fill-[var(--logo-mark)]" />
    </>
  );
}

/** Nur das Icon, z. B. als Platzhalter fuer ein fehlendes Profilbild. */
export function LogoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="140 70 314 374" className={className} aria-hidden="true" focusable="false">
      <PlayMark />
    </svg>
  );
}

/** Play-Icon plus "VOLTFM", ohne Link — z. B. auf den Titelbildern der News. */
export function LogoWordmark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 34 1006 160" className={className} aria-hidden="true" focusable="false">
      <g transform="translate(-67.3828125,0) scale(0.44921875)">
        <PlayMark />
      </g>
      <path d={VOLT} className="fill-[var(--logo-word)]" />
      <path d={FM} className="fill-[var(--logo-accent)]" />
    </svg>
  );
}

/** Weihnachtsmuetze bis Silvester: 01.01.2027 00:00 deutscher Zeit = 31.12.2026 23:00 UTC. */
const SANTA_HAT_UNTIL = Date.UTC(2026, 11, 31, 23, 0);

/** Die Muetze sitzt schraeg auf der oberen Ecke des Play-Dreiecks. Rein dekorativ. */
function SantaHat({ compact }: { compact: boolean }) {
  return (
    <svg
      viewBox="0 0 64 56"
      aria-hidden="true"
      focusable="false"
      className={
        compact
          ? "pointer-events-none absolute -left-[8px] -top-[13px] h-[22px] w-auto -rotate-[20deg]"
          : "pointer-events-none absolute -left-[8px] -top-[12px] h-[19px] w-auto -rotate-[20deg] min-[380px]:-top-[13px] min-[380px]:h-[22px]"
      }
    >
      <path d="M9 46 Q16 16 42 8 Q55 5 58 19 Q50 14 44 22 L56 46 Z" fill="#d62828" />
      <path d="M17 40 Q22 24 36 15" stroke="#a51d1d" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.6" />
      <rect x="3" y="41" width="58" height="13" rx="6.5" fill="#f4f1ea" />
      <circle cx="58" cy="20" r="6.5" fill="#f4f1ea" />
    </svg>
  );
}

/**
 * Die Wortmarke als Link zur Startseite. Sie ist dekorativ — den Namen
 * traegt das aria-label des Links. Bis Silvester mit Weihnachtsmuetze.
 */
export function Logo({ compact = false }: { compact?: boolean }) {
  const xmas = Date.now() < SANTA_HAT_UNTIL;
  return (
    <Link
      href="/"
      /* Zum Antippen hoeher als die Wortmarke selbst. */
      className="inline-flex min-h-11 shrink-0 items-center rounded-md"
      aria-label="VoltFM — zur Startseite"
    >
      <span className="relative inline-block">
        {compact ? (
          <LogoIcon className="block h-8 w-auto" />
        ) : (
          <LogoWordmark className="block h-[22px] w-auto min-[380px]:h-[26px]" />
        )}
        {xmas ? <SantaHat compact={compact} /> : null}
      </span>
    </Link>
  );
}
