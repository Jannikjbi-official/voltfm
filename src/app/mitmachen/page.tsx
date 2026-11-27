import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/common/page-header";
import { ButtonLink } from "@/components/common/button-link";
import { Icon, DiscordIcon, MicIcon, NewsIcon, HeartIcon, ExternalLinkIcon, IdeaIcon } from "@/lib/icons";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Mitmachen",
  description:
    "Moderieren, schreiben oder einfach dabei sein: So wirst du Teil von VoltFM.",
  alternates: { canonical: "/mitmachen" },
};

const WAYS = [
  {
    icon: MicIcon,
    title: "Ans Mikrofon",
    text: "Eine eigene Sendung, ein festes Thema oder erstmal eine Probeaufnahme. Vorerfahrung brauchst du nicht — ein halbwegs brauchbares Mikrofon und Verlässlichkeit schon.",
  },
  {
    icon: NewsIcon,
    title: "Schreiben",
    text: "Musiktipps, Rezensionen, Blicke hinter die Kulissen. Wer regelmäßig schreibt, bekommt einen eigenen Zugang zur Redaktion und ein Profil hier auf der Seite.",
  },
  {
    icon: HeartIcon,
    title: "Einfach dabei sein",
    text: "Zuhören, im Discord mitreden, Songs vorschlagen, Freunden davon erzählen. Dafür brauchst du keine Bewerbung — komm einfach vorbei.",
  },
] as const;

const STEPS = [
  "Öffne unser Bewerbungsportal.",
  "Such dir die Stelle aus, auf die du Lust hast.",
  "Füll die Bewerbung aus — bei manchen Stellen gehört ein kleiner Test dazu.",
  "Wir schauen sie uns an und melden uns bei dir.",
] as const;

export default function MitmachenPage() {
  return (
    <>
      <PageHeader
        title="VoltFM ist kein Sender, der auf dich wartet."
        description="Er entsteht durch die Leute, die mitmachen. Platz ist genug — hier sind die Wege hinein."
        breadcrumbs={[
          { href: "/", label: "Start" },
          { href: "/mitmachen", label: "Mitmachen" },
        ]}
        size="large"
      />

      <section className="shell pt-2">
        <ul className="grid gap-2 md:grid-cols-3">
          {WAYS.map((way) => (
            <li key={way.title} className="surface-card flex flex-col gap-3 rounded-[var(--radius)] p-5 sm:p-7">
              <span
                className="well grid size-12 place-items-center rounded-[var(--radius)] text-lg text-foreground"
                aria-hidden="true"
              >
                <Icon icon={way.icon} />
              </span>
              <h2 className="mt-2 font-wide text-xl font-bold text-foreground sm:text-2xl">{way.title}</h2>
              <p className="text-pretty leading-relaxed text-muted">{way.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="shell pt-12 sm:pt-16">
        <div className="grid gap-2 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="surface-card rounded-[var(--radius)] p-5 sm:p-8">
            <h2 className="font-display text-[2.25rem] text-foreground sm:text-5xl">Wie es losgeht</h2>
            <ol className="well mt-6 flex flex-col gap-1 rounded-[var(--radius)] p-1.5">
              {STEPS.map((step, index) => (
                <li key={step} className="flex items-center gap-4 rounded-[3px] bg-surface p-3 sm:p-4">
                  <span className="display-panel grid size-10 shrink-0 place-items-center rounded-[3px] font-dot text-base text-volt">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-base leading-snug font-medium text-foreground sm:text-lg">{step}</span>
                </li>
              ))}
            </ol>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href={site.applyUrl} external variant="primary" size="lg">
                Zum Bewerbungsportal
                <Icon icon={ExternalLinkIcon} />
              </ButtonLink>
              <ButtonLink href={site.discordUrl} external variant="tertiary" size="lg">
                <Icon icon={DiscordIcon} />
                Erst mal fragen
              </ButtonLink>
            </div>
          </div>

          <aside className="display-panel display-dots flex flex-col gap-4 rounded-[var(--radius)] p-6 text-pretty leading-relaxed text-display-muted sm:p-8 [&_a]:font-semibold [&_a]:text-volt [&_a]:underline [&_a]:underline-offset-4">
            <p className="font-meta text-display-muted">klartext</p>
            <h2 className="font-display text-[2rem] text-display-foreground sm:text-4xl">Ehrlich gesagt</h2>
            <p>
              Wir sind ein kleines, nicht-kommerzielles Projekt. Es gibt kein
              Geld und keine Quote. Was es gibt: eigene Sendezeit, Leute, die
              zuhören, und niemanden, der dir vorschreibt, welchen Song du
              spielen musst.
            </p>
            <p>
              Bei einigen Stellen gehört ein kleiner Test dazu — nichts
              Schlimmes, es geht nur darum zu sehen, ob die Aufgabe zu dir passt.
            </p>
            <p>
              Wenn du wissen willst, wer schon dabei ist, schau bei den{" "}
              <Link href="/moderatoren">Moderatoren</Link> vorbei. Offene Fragen
              beantwortet vielleicht schon die <Link href="/faq">FAQ</Link>.
            </p>
          </aside>
        </div>
      </section>

      {/* Ideen, Feedback und Bugs sammelt das VoltFM-Portal, nicht diese Seite. */}
      <section id="ideen" aria-labelledby="ideen-title" className="shell scroll-mt-28 pt-12 sm:pt-16">
        <div className="display-panel display-dots flex flex-col gap-6 rounded-[var(--radius)] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-10">
          <div className="flex flex-col gap-3">
            <p className="flex items-center gap-2 font-meta text-display-muted">
              <span className="led" aria-hidden="true" />
              ideen / portal
            </p>
            <h2 id="ideen-title" className="font-display text-[2.1rem] text-display-foreground sm:text-5xl">
              Deine Ideen
            </h2>
            <p className="max-w-2xl text-pretty leading-relaxed text-display-muted">
              Ein Song, der fehlt, eine Sendung, eine Playlist oder etwas, das nervt: Ideen,
              Feedback und Bugs sammeln wir im VoltFM-Portal. Dort siehst du auch, was aus
              deiner Idee geworden ist.
            </p>
          </div>
          <ButtonLink href={site.ideasUrl} external variant="primary" size="lg">
            <Icon icon={IdeaIcon} />
            Idee einreichen
            <Icon icon={ExternalLinkIcon} />
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
