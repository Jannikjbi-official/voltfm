import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/common/page-header";
import { ButtonLink } from "@/components/common/button-link";
import { EventCard } from "@/components/events/event-card";
import { SectionHeader } from "@/components/common/section-header";
import { EmptyState } from "@/components/common/empty-state";
import { Icon, DiscordIcon, InstagramIcon, MicIcon, HeartIcon, SendIcon } from "@/lib/icons";
import { listEvents } from "@/services/content";
import { operator, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Community",
  description: "Die VoltFM-Community: unser Discord, RadioAid und wie du mitmachen kannst.",
  alternates: { canonical: "/community" },
};

export const revalidate = 600;

/* Nur Wege, die es gerade wirklich gibt. Songwuensche, Live-Chat zu Sendungen
   und Community-Abende standen hier frueher — nichts davon findet statt. */
const WAYS = [
  {
    icon: DiscordIcon,
    title: "Im Discord mitreden",
    text: "Schreib einfach rein. Neuigkeiten kündigen wir dort zuerst an, und Fragen beantworten wir dort am schnellsten.",
  },
  {
    icon: MicIcon,
    title: "Selbst mitmachen",
    text: "Wenn du selbst etwas beitragen willst: Offene Stellen stehen in unserem Bewerbungsportal.",
    link: { href: "/mitmachen", label: "Zum Mitmachen" },
  },
  {
    icon: HeartIcon,
    title: "RadioAid",
    text: "Einmal im Jahr übertragen wir RadioAid, 24 Stunden Charity-Radio. Termin und Infos stehen auf der RadioAid-Seite.",
    link: { href: "/radioaid", label: "Zu RadioAid" },
  },
  {
    icon: SendIcon,
    title: "Feedback schicken",
    text: `Was nervt, was fehlt, was gut läuft: Mach ein Ticket im Discord auf oder schreib an ${operator.email}. Wir antworten, auch wenn es ein paar Tage dauert.`,
  },
];

export default async function CommunityPage() {
  const events = await listEvents("upcoming");

  return (
    <>
      <PageHeader
        title="Die Community"
        description="Zwei Leute machen den Sender, der Rest passiert im Discord. Da erfährst du alles zuerst und erreichst uns direkt."
        breadcrumbs={[
          { href: "/", label: "Start" },
          { href: "/community", label: "Community" },
        ]}
        size="large"
        aside={
          <>
            <ButtonLink href={site.discordUrl} external variant="primary">
              <Icon icon={DiscordIcon} />
              Discord beitreten
            </ButtonLink>
            <ButtonLink href={site.instagramUrl} external variant="tertiary">
              <Icon icon={InstagramIcon} />
              Instagram
            </ButtonLink>
          </>
        }
      />

      {/* --- Discord: das grosse Display ----------------------------------- */}
      <section className="shell pt-2">
        <div className="display-panel display-dots grid gap-8 rounded-[var(--radius)] p-6 sm:p-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <p className="flex items-center gap-2 font-meta text-display-muted">
              <span className="led" aria-hidden="true" />
              treffpunkt
            </p>
            <h2 className="mt-5 max-w-2xl font-display text-[2.2rem] text-balance text-volt sm:text-6xl">
              Alles passiert im Discord.
            </h2>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-display-muted">
              Hier erfährst du zuerst, was ansteht, und hier sagst du uns, was dir
              fehlt. Zwei Klicks, kein Konto auf dieser Seite.
            </p>
          </div>
          <div className="flex flex-col items-start gap-4">
            <span
              aria-hidden="true"
              className="key hidden size-16 place-items-center rounded-[var(--radius)] bg-volt text-3xl text-graphite lg:grid"
            >
              <Icon icon={DiscordIcon} />
            </span>
            <ButtonLink href={site.discordUrl} external variant="primary" size="lg">
              Zum VoltFM Discord
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* --- Wege, dabei zu sein --------------------------------------------- */}
      <section className="shell pt-12 sm:pt-16">
        <SectionHeader title="So bist du dabei" />

        <ul className="grid gap-2 sm:grid-cols-2">
          {WAYS.map((way) => (
            <li
              key={way.title}
              className="surface-card flex flex-col gap-3 rounded-[var(--radius)] p-2"
            >
              <div className="flex flex-1 flex-col gap-3 px-3 pt-3 pb-2 sm:px-5 sm:pt-5">
                <span
                  aria-hidden="true"
                  className="well grid size-12 place-items-center rounded-[var(--radius)] text-lg text-foreground"
                >
                  <Icon icon={way.icon} />
                </span>
                <h3 className="mt-2 font-wide text-xl font-bold text-foreground sm:text-2xl">{way.title}</h3>
                <p className="text-pretty leading-relaxed text-muted">{way.text}</p>
                {way.link && (
                  <Link
                    href={way.link.href}
                    className="key mt-auto inline-flex self-start rounded-[var(--radius)] bg-surface px-3.5 py-1.5 text-sm font-semibold text-foreground ring-1 ring-border transition-colors hover:bg-volt hover:text-graphite"
                  >
                    {way.link.label}
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* --- Termine --------------------------------------------------------- */}
      <section className="shell pt-12 sm:pt-16">
        <SectionHeader title="Als Nächstes" action={{ href: "/events", label: "Alle Events" }} />

        {events.length > 0 ? (
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {events.slice(0, 3).map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Gerade ist nichts geplant"
            description="Neue Termine kündigen wir zuerst im Discord an."
          />
        )}
      </section>

      {/* --- Direkt an uns --------------------------------------------------- */}
      <section className="shell pt-12 sm:pt-16">
        <div className="surface-card flex flex-col gap-6 rounded-[var(--radius)] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="max-w-xl">
            <p className="font-meta text-muted">direktleitung</p>
            <h2 className="mt-2 font-wide text-2xl font-bold text-foreground">Lieber direkt an uns?</h2>
            <p className="mt-2 leading-relaxed text-muted">
              Für alles, was nicht in den Discord gehört: Feedback, Kooperationen,
              Presseanfragen oder einfach eine Nachricht an uns.
            </p>
          </div>
          <ButtonLink href="/kontakt" variant="tertiary" className="shrink-0">
            Kontakt aufnehmen
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
