import type { Metadata } from "next";

import { PageHeader } from "@/components/common/page-header";
import { ButtonLink } from "@/components/common/button-link";
import { EventCard } from "@/components/events/event-card";
import { SectionHeader } from "@/components/common/section-header";
import { EmptyState } from "@/components/common/empty-state";
import { Icon, DiscordIcon, MicIcon, HeartIcon, SendIcon } from "@/lib/icons";
import { listEvents } from "@/services/content";
import { site } from "@/lib/site";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Community",
  description:
    "Die VoltFM Community: Discord, Songwünsche, Community-Abende und alle Wege mitzumachen.",
  alternates: { canonical: "/community" },
};

export const revalidate = 600;

const WAYS = [
  {
    icon: DiscordIcon,
    title: "Im Discord mitreden",
    text: "Der Discord ist unser Wohnzimmer. Hier laufen Songwünsche, Feedback und die Planung der nächsten Sendungen zusammen — und während der Sendungen der Live-Chat.",
  },
  {
    icon: MicIcon,
    title: "Songs vorschlagen",
    text: "Jeder Vorschlag aus der Community landet bei Mochiko in der Musikredaktion und läuft mindestens einmal in einer Abendsendung, bevor wir über die Rotation entscheiden.",
  },
  {
    icon: HeartIcon,
    title: "Bei Events dabei sein",
    text: "Einmal im Monat gibt es den Community-Abend: offener Sprachkanal, offene Wunschliste, und das Programm macht ihr.",
  },
  {
    icon: SendIcon,
    title: "Feedback schicken",
    text: "Was nervt, was fehlt, was gut läuft: Über das Kontaktformular erreicht ihr uns direkt — und wir antworten wirklich.",
  },
];

export default async function CommunityPage() {
  const events = await listEvents("upcoming");

  return (
    <>
      <PageHeader
        eyebrow="Mitmachen"
        title="Die Community"
        description="VoltFM ist kein Sender, der in eine Richtung sendet. Fast alles, was bei uns läuft, kommt am Ende aus der Community zurück."
        breadcrumbs={[
          { href: "/", label: "Start" },
          { href: "/community", label: "Community" },
        ]}
        size="large"
        aside={
          <ButtonLink href={site.discordUrl} external variant="primary" mode="filled" size="md">
            <Icon icon={DiscordIcon} />
            Discord beitreten
          </ButtonLink>
        }
      />

      {/* --- Discord: one loud band, not a card ---------------------------- */}
      <section className={styles.hero}>
        <div className="shell">
          <div className={styles.heroInner}>
            <Icon icon={DiscordIcon} className={styles.heroIcon} />
            <h2 className={styles.heroTitle}>Alles passiert im Discord.</h2>
            <p className={styles.heroText}>
              Songwünsche, Live-Chat während der Sendungen, Community-Abende und
              die ehrlichen Diskussionen darüber, was wir besser machen können.
              Kein Konto auf dieser Website nötig — zwei Klicks, und du bist drin.
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
          title="Vier Wege, Teil von VoltFM zu werden"
        />

        <div className={styles.ways}>
          {WAYS.map((way) => (
            <article key={way.title} className={styles.way}>
              <Icon icon={way.icon} className={styles.wayIcon} />
              <h3 className={styles.wayTitle}>{way.title}</h3>
              <p className={styles.wayText}>{way.text}</p>
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
              Presseanfragen oder einfach eine Nachricht an die Redaktion.
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
