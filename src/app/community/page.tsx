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

      {/* --- Discord: die grosse dunkle Karte ------------------------------- */}
      <section className="shell">
        <div
          data-theme="dark"
          className="dark relative overflow-hidden rounded-[var(--radius)] border border-border bg-surface px-7 py-10 text-foreground shadow-[var(--lift-shadow)] sm:px-12 sm:py-14"
        >
          <span
            aria-hidden="true"
            className="grid size-14 place-items-center rounded-2xl bg-volt text-2xl text-ink"
          >
            <Icon icon={DiscordIcon} />
          </span>
          <h2 className="mt-6 max-w-2xl font-display text-[2.2rem] text-balance text-volt sm:text-6xl">
            Alles passiert im Discord.
          </h2>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-paper/75">
            Hier erfährst du zuerst, was ansteht, und hier sagst du uns, was dir
            fehlt. Zwei Klicks, kein Konto auf dieser Seite.
          </p>
          <div className="mt-8">
            <ButtonLink href={site.discordUrl} external variant="primary" size="lg">
              Zum VoltFM Discord
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* --- Wege, dabei zu sein --------------------------------------------- */}
      <section className="shell pt-16 sm:pt-24">
        <SectionHeader title="So bist du dabei" />

        <ul className="grid gap-4 sm:grid-cols-2">
          {WAYS.map((way) => (
            <li
              key={way.title}
              className="surface-card hover-lift flex flex-col gap-3 rounded-3xl p-6 sm:p-8"
            >
              <span
                aria-hidden="true"
                className="grid size-12 place-items-center rounded-2xl bg-default text-lg text-foreground"
              >
                <Icon icon={way.icon} />
              </span>
              <h3 className="mt-2 text-xl font-bold tracking-tight text-foreground sm:text-2xl">{way.title}</h3>
              <p className="text-pretty leading-relaxed text-muted">{way.text}</p>
              {way.link && (
                <Link
                  href={way.link.href}
                  className="mt-auto self-start rounded-full bg-default px-4 py-1.5 text-sm font-semibold text-foreground transition-colors hover:bg-volt hover:text-ink"
                >
                  {way.link.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* --- Termine --------------------------------------------------------- */}
      <section className="shell pt-16 sm:pt-24">
        <SectionHeader title="Als Nächstes" action={{ href: "/events", label: "Alle Events" }} />

        {events.length > 0 ? (
          <div className="-mx-3 grid gap-2 md:grid-cols-2 lg:grid-cols-3">
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
      <section className="shell pt-16 sm:pt-24">
        <div className="surface-card flex flex-col gap-6 rounded-[var(--radius)] p-7 sm:flex-row sm:items-center sm:justify-between sm:p-10">
          <div className="max-w-xl">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Lieber direkt an uns?</h2>
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
