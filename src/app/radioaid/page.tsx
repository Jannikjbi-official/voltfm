import type { Metadata } from "next";
import Link from "next/link";
import { cn } from "@heroui/react";

import { Breadcrumbs } from "@/components/common/breadcrumbs";

import { ButtonLink } from "@/components/common/button-link";
import { Icon, ExternalLinkIcon, DiscordIcon, HeartIcon, CalendarIcon, ClockIcon } from "@/lib/icons";
import { formatDate, formatTime } from "@/lib/format";
import { radioaid, getRadioAidSchedule } from "@/lib/radioaid";
import { site } from "@/lib/site";
import { Countdown } from "./countdown";

/**
 * RadioAid — die jaehrliche Charity-Sendung aus der laut.fm-Community, die
 * VoltFM mit ausstrahlt.
 *
 * Termin, Dauer und Empfaenger stehen in `src/lib/radioaid.ts`, damit die
 * Navigation dieselbe Quelle liest und beide nicht auseinanderlaufen koennen.
 */

/**
 * Unser eigener Weg mit RadioAid — nicht die Chronik des Projekts.
 *
 * `org` nennt nur den Empfaenger des jeweiligen Jahres als Einordnung; die
 * Ueberschrift jedes Eintrags beschreibt, was bei uns passiert ist. Was wir in
 * einem Jahr konkret beigetragen haben, gehoert in `text` — steht dort nichts,
 * ist es schlicht noch nicht aufgeschrieben.
 */
const EDITIONS = [
  {
    year: "Jan 2021",
    title: "Die Station geht an den Start",
    text: "Jannik legt seine laut.fm-Station an — damals unter dem Namen jannikjbi. RadioAid ist zu dem Zeitpunkt noch kein Thema.",
    org: null,
  },
  {
    year: "2022",
    title: "Zum ersten Mal dabei",
    text: "Wir übernehmen die 24-Stunden-Sendung erstmals in unser Programm. Die Station heißt zu der Zeit noch nicht VoltFM.",
    org: "Tafeln Deutschland",
  },
  { year: "2023", title: "Wieder mit an Bord", text: null, org: "Deutsche Depressionshilfe" },
  { year: "2024", title: "Wieder mit an Bord", text: null, org: "Ambulantes Kinderhospiz München" },
  { year: "2025", title: "Wieder mit an Bord", text: null, org: "Hamburger Kinderwünsche e. V." },
  {
    year: "2026",
    title: "Erstmals als VoltFM mit eigener Seite",
    text: "Fünfte Teilnahme — und die erste, bei der wir eine richtige Website haben, um vorher darauf hinzuweisen.",
    org: "Seelenpflaster e. V.",
    upcoming: true,
  },
] as const;

const FACTS = [
  { value: "8", label: "Jahre RadioAid" },
  { value: "24 h", label: "Livesendung am Stück" },
  { value: "39.425 €", label: "bisher gesammelt" },
] as const;

export const metadata: Metadata = {
  title: "RadioAid",
  description:
    "24 Stunden Charity-Radio: VoltFM überträgt RadioAid zugunsten von Seelenpflaster e. V. Countdown, Infos und wie du mitmachst.",
  alternates: { canonical: "/radioaid" },
};

const sideBlock = "flex flex-col items-start gap-3 rounded-2xl border border-border bg-surface p-6";
const sideTitle = "font-wide text-lg font-bold text-foreground";

export default function RadioAidPage() {
  const { start, end, phase } = getRadioAidSchedule();

  return (
    <>
      {/* RadioAid ist eine fremde Aktion im VoltFM-Gewand: gleiche Farben,
          eigener Kopf mit Herz. */}
      <header className="border-b border-separator bg-surface-secondary/60">
        <div className="shell pt-8 pb-12 sm:pt-10 sm:pb-16">
          <Breadcrumbs
            items={[
              { href: "/", label: "Start" },
              { href: "/radioaid", label: "RadioAid" },
            ]}
          />

          <p className="mt-6 inline-flex items-center gap-2.5 rounded-full border border-border bg-surface py-1 pr-3.5 pl-1 text-sm font-semibold text-foreground">
            <span
              aria-hidden="true"
              className="grid size-7 place-items-center rounded-full bg-volt text-xs text-ink"
            >
              <Icon icon={HeartIcon} />
            </span>
            Charity-Aktion der Radio-Community
          </p>

          <h1 className="mt-6 font-display text-[2.5rem] leading-[0.95] text-balance text-foreground sm:text-6xl lg:text-7xl">
            Wenn Radio
            <br />
            <span className="text-accent-text">Gutes tut.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
            Einmal im Jahr macht die Radio-Community 24 Stunden lang gemeinsam
            Programm für einen guten Zweck. VoltFM ist dabei.
          </p>
        </div>
      </header>

      <section className="shell pt-12 sm:pt-16">
        <div className="grid gap-6 rounded-3xl border border-border bg-surface p-6 sm:p-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-center lg:gap-12 lg:p-10">
          <Countdown
            start={start.getTime()}
            end={end.getTime()}
            initialPhase={phase}
            label="Bis zum Sendestart"
          />

          <dl className="flex flex-col divide-y divide-separator rounded-2xl bg-surface-secondary px-5">
            <div className="flex flex-col gap-0.5 py-3.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
              <dt className="inline-flex items-center gap-2 text-sm text-muted">
                <Icon icon={CalendarIcon} /> Termin
              </dt>
              <dd className="font-semibold text-foreground sm:text-right">{formatDate(start)}</dd>
            </div>
            <div className="flex flex-col gap-0.5 py-3.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
              <dt className="inline-flex items-center gap-2 text-sm text-muted">
                <Icon icon={ClockIcon} /> Sendezeit
              </dt>
              <dd className="font-semibold text-foreground sm:text-right">
                {formatTime(start)} Uhr bis {formatTime(end)} Uhr am Folgetag
              </dd>
            </div>
            <div className="flex flex-col gap-0.5 py-3.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
              <dt className="inline-flex items-center gap-2 text-sm text-muted">
                <Icon icon={HeartIcon} /> Zugunsten von
              </dt>
              <dd className="font-semibold text-foreground sm:text-right">{radioaid.organisation}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="shell py-14 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-16">
          <div className="max-w-[68ch]">
            <article className="vfm-prose">
              <h2>Was ist RadioAid?</h2>
              <p>
                RadioAid ist ein Gemeinschaftsprojekt, das aus der laut.fm-Community
                entstanden ist und inzwischen allen Radiostationen offensteht. Einmal
                im Jahr unterstützt es mit einer Charity-Radio-Show eine wohltätige
                Organisation bei ihrer Arbeit.
              </p>
              <p>
                Die Sendung läuft <strong>24 Stunden am Stück</strong> und wird von
                wechselnden Moderatorinnen, Moderatoren und Stationen gestaltet.
                Jede Station darf sie kostenfrei ausstrahlen — es geht nicht um
                Reichweite für einen Sender, sondern darum, möglichst viele Ohren zu
                erreichen.
              </p>
              <p>
                Ziel ist, die Hörerinnen und Hörer über die ausgewählte Organisation
                zu informieren, konkrete Wege der Unterstützung zu zeigen und zum
                Spenden zu motivieren.
              </p>

              <h2>Wem es dieses Jahr hilft</h2>
              <p>
                Die Spenden gehen an <strong>{radioaid.organisation}</strong>. Der
                Verein verfolgt seit August 2021 das Ziel, Kindern in besonders
                schweren Lebenssituationen mit personalisierter
                &bdquo;Seelenpflaster&ldquo;-Post eine Freude zu machen: ein kleines
                Überraschungsgeschenk, eine Grußkarte, adressiert an genau dieses
                Kind.
              </p>
              <p>
                Das Ziel ist bewusst unbescheiden formuliert — ein breites Grinsen im
                Gesicht der Kinder. Der Alltag ist schwer genug.
              </p>

              <h2>Was VoltFM macht</h2>
              <p>
                Wir übernehmen die Sendung in voller Länge in unser Programm. Wer am{" "}
                {formatDate(start, "short")} bei uns einschaltet, hört RadioAid — und
                erfährt zwischendurch, wie gespendet werden kann.
              </p>

              <h2>Wir sind seit 2022 dabei</h2>
              <p>
                Jannik ist <strong>seit 2022</strong> bei RadioAid — die
                laut.fm-Station selbst gibt es seit <strong>Januar 2021</strong>, das
                erste Mal mitgemacht hat er also im Jahr danach. Nur hieß die
                Station in dieser Zeit nicht durchgehend VoltFM.
              </p>
              <p>
                Angefangen hat sie als <strong>jannikjbi</strong>, dann kam{" "}
                <strong>jannikjbiFM</strong>, danach etliche weitere Namen, die
                ausprobiert und wieder verworfen wurden —
                aus Langeweile und weil damals schlicht nicht klar war, was bei den
                Hörern ankommt. Geblieben sind am Ende zwei Dinge: der Sendername{" "}
                <strong>VoltFM</strong> und die laut.fm-Station{" "}
                <strong>{site.station}</strong>, die noch aus dem Januar 2021 stammt.
                Warum wir sie behalten haben, steht{" "}
                <Link href="/news/voltfm-geht-weiter-neue-webseite">
                  in diesem Beitrag
                </Link>
                .
              </p>

              <h2>Unser Weg mit RadioAid</h2>
            </article>

            {/* Ausserhalb von .vfm-prose: eigene Liste, keine Aufzaehlung. */}
            <ol className="mt-6 flex flex-col gap-3">
              {EDITIONS.map((edition) => {
                const upcoming = "upcoming" in edition;
                return (
                  <li
                    key={edition.year}
                    className={cn(
                      "grid grid-cols-[5.5rem_minmax(0,1fr)] gap-4 rounded-2xl border p-4 sm:p-5",
                      upcoming ? "border-accent-text/50 bg-surface" : "border-border bg-surface",
                    )}
                  >
                    <span
                      className={cn(
                        "font-display text-lg leading-tight",
                        upcoming ? "text-accent-text" : "text-foreground",
                      )}
                    >
                      {edition.year}
                    </span>
                    <div className="flex min-w-0 flex-col gap-1">
                      <p className="font-semibold text-foreground">{edition.title}</p>
                      {edition.text && (
                        <p className="text-sm leading-relaxed text-muted">{edition.text}</p>
                      )}
                      {edition.org && (
                        <p className="text-sm text-muted">Gesammelt wurde für {edition.org}</p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
            <p className="mt-5 text-sm leading-relaxed text-muted">
              RadioAid selbst gibt es schon länger als uns — die Chronik des Projekts steht im{" "}
              <a
                href="https://radioaid.de/blog/"
                target="_blank"
                rel="noreferrer noopener"
                className="rounded-sm font-medium text-foreground underline underline-offset-4"
              >
                RadioAid-Blog
                <span className="sr-only"> (öffnet einen neuen Tab)</span>
              </a>
              .
            </p>
          </div>

          <aside className="flex flex-col gap-4 self-start">
            <div className={sideBlock}>
              <h2 className={sideTitle}>Mitmachen</h2>
              <p className="text-sm leading-relaxed text-muted">
                Du hast selbst einen Sender, willst moderieren oder einfach nur
                Werbung machen? Bei RadioAid kann jede Station mitmachen — die
                Sendung wird kostenfrei zur Verfügung gestellt.
              </p>
              <ButtonLink href={radioaid.website} external variant="primary" size="sm">
                Zu RadioAid
                <Icon icon={ExternalLinkIcon} />
              </ButtonLink>
            </div>

            <div className={sideBlock}>
              <h2 className={sideTitle}>In Zahlen</h2>
              <dl className="flex w-full flex-col gap-4">
                {FACTS.map((fact) => (
                  <div key={fact.label} className="flex flex-col">
                    <dt className="font-display text-3xl leading-none text-foreground">{fact.value}</dt>
                    <dd className="mt-1 text-sm text-muted">{fact.label}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className={sideBlock}>
              <h2 className={sideTitle}>Auf dem Laufenden bleiben</h2>
              <p className="text-sm leading-relaxed text-muted">
                Wir kündigen die Sendung rechtzeitig im Discord an — dort gibt es
                auch die Sendeplätze, sobald sie feststehen.
              </p>
              <ButtonLink href={site.discordUrl} external variant="outline" size="sm">
                <Icon icon={DiscordIcon} />
                Discord öffnen
              </ButtonLink>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
