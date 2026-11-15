import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/common/page-header";
import { ButtonLink } from "@/components/common/button-link";
import { Icon, DiscordIcon, MicIcon, NewsIcon, HeartIcon, ExternalLinkIcon } from "@/lib/icons";
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

      <section className="shell py-14 sm:py-20">
        <ul className="grid gap-4 md:grid-cols-3">
          {WAYS.map((way) => (
            <li
              key={way.title}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-6 sm:p-7"
            >
              <span
                className="grid size-11 place-items-center rounded-full bg-surface-secondary text-lg text-foreground"
                aria-hidden="true"
              >
                <Icon icon={way.icon} />
              </span>
              <h2 className="mt-2 font-wide text-xl font-bold text-foreground">{way.title}</h2>
              <p className="text-pretty leading-relaxed text-muted">{way.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="shell pb-6">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-16">
          <div>
            <h2 className="font-display text-3xl text-foreground sm:text-4xl">Wie es losgeht</h2>
            <ol className="mt-8 flex flex-col gap-5">
              {STEPS.map((step, index) => (
                <li key={step} className="flex items-start gap-4">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-volt font-wide text-sm font-bold text-ink">
                    {index + 1}
                  </span>
                  <span className="pt-1.5 text-lg leading-snug text-foreground">{step}</span>
                </li>
              ))}
            </ol>
            <div className="mt-10 flex flex-wrap gap-3">
              <ButtonLink href={site.applyUrl} external variant="primary" size="lg">
                Zum Bewerbungsportal
                <Icon icon={ExternalLinkIcon} />
              </ButtonLink>
              <ButtonLink href={site.discordUrl} external variant="outline" size="lg">
                <Icon icon={DiscordIcon} />
                Erst mal fragen
              </ButtonLink>
            </div>
          </div>

          <aside className="flex flex-col gap-4 self-start rounded-3xl bg-surface-secondary p-6 text-pretty leading-relaxed text-muted sm:p-8 [&_a]:font-medium [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4">
            <h2 className="font-wide text-xl font-bold text-foreground">Ehrlich gesagt</h2>
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
    </>
  );
}
