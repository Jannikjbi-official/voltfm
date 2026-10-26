import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/common/page-header";
import { ButtonLink } from "@/components/common/button-link";
import { EventCard } from "@/components/events/event-card";
import { SectionHeader } from "@/components/common/section-header";
import { EmptyState } from "@/components/common/empty-state";
import { Icon, ArrowRightIcon, DiscordIcon, InstagramIcon, MicIcon, HeartIcon, SendIcon } from "@/lib/icons";
import { listEvents } from "@/services/content";
import { operator, site } from "@/lib/site";
import styles from "./page.module.css";

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
        eyebrow="Mitmachen"
        title="Die Community"
        description="Zwei Leute machen den Sender, der Rest passiert im Discord. Da erfährst du alles zuerst und erreichst uns direkt."
        breadcrumbs={[
          { href: "/", label: "Start" },
          { href: "/community", label: "Community" },
        ]}
        size="large"
        aside={
          <>
            <ButtonLink href={site.discordUrl} external variant="primary" mode="filled" size="md">
              <Icon icon={DiscordIcon} />
              Discord beitreten
            </ButtonLink>
            <ButtonLink href={site.instagramUrl} external variant="neutral" mode="stroke" size="md">
              <Icon icon={InstagramIcon} />
              Instagram
            </ButtonLink>
          </>
        }
      />

      {/* --- Discord: one loud band, not a card ---------------------------- */}
      <section className={styles.hero}>
        <div className="shell">
          <div className={styles.heroInner}>
            <Icon icon={DiscordIcon} className={styles.heroIcon} />
            <h2 className={styles.heroTitle}>Alles passiert im Discord.</h2>
            <p className={styles.heroText}>
              Hier erfährst du zuerst, was ansteht, und hier sagst du uns, was dir
              fehlt. Zwei Klicks, kein Konto auf dieser Seite.
            </p>
            <ButtonLink href={site.discordUrl} external variant="primary" mode="filled" size="lg">
              Zum VoltFM Discord
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* --- Ways to take part -------------------------------------------- */}
      <section className="section shell">
        <SectionHeader
          eyebrow="Mitmachen"
          title="So bist du dabei"
        />

        <div className={styles.ways}>
          {WAYS.map((way) => (
            <article key={way.title} className={styles.way}>
              <Icon icon={way.icon} className={styles.wayIcon} />
              <h3 className={styles.wayTitle}>{way.title}</h3>
              <p className={styles.wayText}>{way.text}</p>
              {way.link && (
                <Link href={way.link.href} className={styles.wayLink}>
                  {way.link.label}
                  <Icon icon={ArrowRightIcon} />
                </Link>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* --- Community events --------------------------------------------- */}
      <section className={styles.eventsSection}>
        <div className="shell">
          <SectionHeader
            eyebrow="Termine"
            title="Als Nächstes"
            action={{ href: "/events", label: "Alle Events" }}
          />

          {events.length > 0 ? (
            <div className={styles.eventList}>
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
        </div>
      </section>

      {/* --- Contact hand-off --------------------------------------------- */}
      <section className="section shell">
        <div className={styles.contact}>
          <div>
            <h2 className={styles.contactTitle}>Lieber direkt an uns?</h2>
            <p className={styles.contactText}>
              Für alles, was nicht in den Discord gehört: Feedback, Kooperationen,
              Presseanfragen oder einfach eine Nachricht an uns.
            </p>
          </div>
          <ButtonLink href="/kontakt" variant="neutral" mode="stroke" size="md">
            Kontakt aufnehmen
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
