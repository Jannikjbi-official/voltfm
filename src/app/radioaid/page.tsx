import type { Metadata } from "next";
import Link from "next/link";
import { cn } from "@heroui/react";

import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { SectionHeader } from "@/components/common/section-header";
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

const sideBlock = "surface-card flex flex-col items-start gap-3 rounded-3xl p-6 sm:p-7";
const sideTitle = "text-xl font-bold tracking-tight text-foreground";

export default function RadioAidPage() {
  const { start, end, phase } = getRadioAidSchedule();

  const details = [
    { icon: CalendarIcon, label: "Termin", value: formatDate(start) },
    {
      icon: ClockIcon,
      label: "Sendezeit",
      value: `${formatTime(start)} Uhr bis ${formatTime(end)} Uhr am Folgetag`,
    },
    { icon: HeartIcon, label: "Zugunsten von", value: radioaid.organisation },
  ];

  return (
    <>
      {/* RadioAid ist eine fremde Aktion im VoltFM-Gewand: gleiche Farben,
          eigener Kopf mit Herz. */}
      <header className="shell pt-10 sm:pt-14">
        <Breadcrumbs
          items={[
            { href: "/", label: "Start" },
            { href: "/radioaid", label: "RadioAid" },
          ]}
        />

        <p className="mt-6 inline-flex items-center gap-2.5 rounded-full bg-default py-1 pr-3.5 pl-1 text-sm font-semibold text-foreground">
          <span
            aria-hidden="true"
            className="grid size-7 place-items-center rounded-full bg-volt text-xs text-ink"
          >
            <Icon icon={HeartIcon} />
          </span>
          Charity-Aktion der Radio-Community
        </p>

        <h1 className="mt-6 font-display text-[2.6rem] text-balance text-foreground sm:text-7xl lg:text-8xl">
          Wenn Radio{" "}
          <span className="box-decoration-clone rounded-2xl bg-volt px-3 text-ink">Gutes tut.</span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          Einmal im Jahr macht die Radio-Community 24 Stunden lang gemeinsam
          Programm für einen guten Zweck. VoltFM ist dabei.
        </p>
      </header>

      {/* --- Countdown und Eckdaten als Kacheln ----------------------------- */}
      <section className="shell pt-10 sm:pt-14">
        <div className="grid gap-3 lg:grid-cols-12">
          <div
            data-theme="dark"
            className="dark flex flex-col justify-center rounded-[var(--radius)] border border-border bg-surface p-6 text-foreground shadow-[var(--lift-shadow)] sm:p-10 lg:col-span-8"
          >
            <Countdown
              start={start.getTime()}
              end={end.getTime()}
              initialPhase={phase}
              label="Bis zum Sendestart"
            />
          </div>

          <dl className="grid gap-3 sm:grid-cols-3 lg:col-span-4 lg:grid-cols-1">
            {details.map((item) => (
              <div key={item.label} className="surface-card flex items-start gap-4 rounded-3xl p-5">
                <span
                  aria-hidden="true"
                  className="grid size-11 shrink-0 place-items-center rounded-2xl bg-default text-foreground"
                >
                  <Icon icon={item.icon} />
                </span>
                <div className="flex min-w-0 flex-col gap-0.5">
                  <dt className="text-sm text-muted">{item.label}</dt>
                  <dd className="font-semibold text-foreground">{item.value}</dd>
                </div>
              </div>
            ))}
          </dl>

          <div className="lg:col-span-12">
            <h2 className="sr-only">In Zahlen</h2>
            <dl className="grid grid-cols-3 gap-3">
              {FACTS.map((fact) => (
                <div
                  key={fact.label}
                  className="surface-card flex min-w-0 flex-col gap-2 rounded-3xl p-4 sm:p-6"
                >
                  <dt className="font-display text-xl text-foreground sm:text-5xl">{fact.value}</dt>
                  <dd className="text-xs text-muted sm:text-sm">{fact.label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* --- Text mit mitlaufender Randspalte ------------------------------- */}
      <section className="shell pt-16 sm:pt-24">
        <div className="grid items-start gap-3 lg:grid-cols-12">
          <article className="surface-card vfm-prose rounded-[var(--radius)] p-7 sm:p-12 lg:col-span-8 [&>h2:first-child]:mt-0">
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
          </article>

          <aside className="flex flex-col gap-3 lg:sticky lg:top-[calc(var(--header-height)+1.75rem)] lg:col-span-4">
            <div className={sideBlock}>
              <span
                aria-hidden="true"
                className="grid size-11 place-items-center rounded-2xl bg-volt text-ink"
              >
                <Icon icon={HeartIcon} />
              </span>
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
              <span
                aria-hidden="true"
                className="grid size-11 place-items-center rounded-2xl bg-default text-foreground"
              >
                <Icon icon={DiscordIcon} />
              </span>
              <h2 className={sideTitle}>Auf dem Laufenden bleiben</h2>
              <p className="text-sm leading-relaxed text-muted">
                Wir kündigen die Sendung rechtzeitig im Discord an — dort gibt es
                auch die Sendeplätze, sobald sie feststehen.
              </p>
              <ButtonLink href={site.discordUrl} external variant="tertiary" size="sm">
                <Icon icon={DiscordIcon} />
                Discord öffnen
              </ButtonLink>
            </div>
          </aside>
        </div>
      </section>

      {/* --- Unser Weg ------------------------------------------------------ */}
      <section className="shell pt-16 sm:pt-24">
        <SectionHeader title="Unser Weg mit RadioAid" />

        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {EDITIONS.map((edition) => {
            const upcoming = "upcoming" in edition;
            return (
              <li
                key={edition.year}
                className={cn(
                  "surface-card flex min-w-0 flex-col gap-3 rounded-3xl p-5 sm:p-6",
                  upcoming && "ring-2 ring-volt",
                )}
              >
                <span
                  className={cn(
                    "self-start rounded-full px-3 py-1 font-mono text-xs font-semibold",
                    upcoming ? "bg-volt text-ink" : "bg-surface-secondary text-foreground",
                  )}
                >
                  {edition.year}
                </span>
                <h3 className="text-lg font-bold tracking-tight text-foreground">{edition.title}</h3>
                {edition.text && <p className="text-sm leading-relaxed text-muted">{edition.text}</p>}
                {edition.org && (
                  <p className="mt-auto text-sm text-muted">Gesammelt wurde für {edition.org}</p>
                )}
              </li>
            );
          })}
        </ol>

        <p className="mt-6 text-sm leading-relaxed text-muted">
          RadioAid selbst gibt es schon länger als uns — die Chronik des Projekts steht im{" "}
          <a
            href="https://radioaid.de/blog/"
            target="_blank"
            rel="noreferrer noopener"
            className="relative rounded-sm font-medium text-foreground underline decoration-accent-text decoration-2 underline-offset-4"
          >
            RadioAid-Blog
            <span className="sr-only"> (öffnet einen neuen Tab)</span>
          </a>
          .
        </p>
      </section>
    </>
  );
}
