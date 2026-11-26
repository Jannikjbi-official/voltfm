import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/common/page-header";
import { ButtonLink } from "@/components/common/button-link";
import { Icon, DiscordIcon, MicIcon, NewsIcon, HeartIcon, ExternalLinkIcon } from "@/lib/icons";
import { site } from "@/lib/site";
import { formatDate } from "@/lib/format";
import { IDEA_KIND_LIST, IDEA_KINDS, type Idea } from "@/lib/ideas";
import { getPublicIdeas } from "@/services/discord/ideas";
import { IdeaForm } from "./idea-form";

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

export default async function MitmachenPage() {
  // Nur freigegebene Einträge (Admin → Ideen); die Texte kommen live aus dem Discord.
  const ideas = await getPublicIdeas();

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

      <section className="shell">
        <ul className="grid gap-4 md:grid-cols-3">
          {WAYS.map((way) => (
            <li key={way.title} className="surface-card hover-lift flex flex-col gap-3 rounded-3xl p-6 sm:p-8">
              <span
                className="grid size-12 place-items-center rounded-2xl bg-default text-lg text-foreground"
                aria-hidden="true"
              >
                <Icon icon={way.icon} />
              </span>
              <h2 className="mt-2 text-xl font-bold tracking-tight text-foreground sm:text-2xl">{way.title}</h2>
              <p className="text-pretty leading-relaxed text-muted">{way.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="shell pt-16 sm:pt-24">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-12">
          <div>
            <h2 className="font-display text-[2.25rem] text-foreground sm:text-5xl">Wie es losgeht</h2>
            <ol className="mt-8 flex flex-col gap-3">
              {STEPS.map((step, index) => (
                <li key={step} className="surface-card flex items-center gap-4 rounded-2xl p-4 sm:p-5">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-volt font-mono text-sm font-semibold text-ink">
                    {index + 1}
                  </span>
                  <span className="text-base leading-snug font-medium text-foreground sm:text-lg">{step}</span>
                </li>
              ))}
            </ol>
            <div className="mt-10 flex flex-wrap gap-3">
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

          <aside
            data-theme="dark"
            className="dark flex flex-col gap-4 self-start rounded-[var(--radius)] border border-border bg-surface p-7 text-pretty leading-relaxed text-muted shadow-[var(--lift-shadow)] sm:p-9 [&_a]:font-semibold [&_a]:text-volt [&_a]:underline-offset-4 hover:[&_a]:underline"
          >
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Ehrlich gesagt</h2>
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

      <section id="ideen" aria-labelledby="ideen-title" className="shell scroll-mt-28 pt-16 sm:pt-24">
        <div className="max-w-2xl">
          <h2 id="ideen-title" className="font-display text-[2.25rem] text-foreground sm:text-5xl">
            Deine Ideen
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted">
            Ein Song, der fehlt, eine Sendung, eine Playlist: Schreib es hier oder direkt im
            Discord. Eine Auswahl zeigen wir hier.
          </p>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12">
          <div className="self-start">
            <IdeaForm />
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:gap-8">
            {IDEA_KIND_LIST.map((kind) => (
              <IdeaList key={kind} title={IDEA_KINDS[kind].plural} ideas={ideas[kind]} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

/** Freigegebene Einträge einer Art. Kein Profilbild: das käme von Discords Servern. */
function IdeaList({ title, ideas }: { title: string; ideas: Idea[] }) {
  return (
    <div className="min-w-0">
      <h3 className="text-xl font-bold tracking-tight text-foreground">{title}</h3>
      {ideas.length === 0 ? (
        <p className="mt-4 rounded-3xl border border-dashed border-border p-6 text-sm text-muted">
          Noch nichts ausgewählt.
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {ideas.map((idea) => (
            <li key={idea.id} className="surface-card rounded-3xl p-5">
              <p className="leading-relaxed break-words whitespace-pre-line text-foreground">{idea.text}</p>
              <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted">
                <span className="font-semibold text-foreground">{idea.author}</span>
                <span className="font-mono text-xs leading-5">{formatDate(idea.createdAt, "short")}</span>
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
