import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/common/page-header";
import { ButtonLink } from "@/components/common/button-link";
import { Icon, DiscordIcon, MicIcon, NewsIcon, HeartIcon } from "@/lib/icons";
import { site } from "@/lib/site";
import styles from "./page.module.css";

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
    text: "Zuhören, im Discord mitreden, Songs vorschlagen, Freunden davon erzählen. Das klingt nach wenig, ist aber der Grund, warum es VoltFM noch gibt.",
  },
] as const;

const STEPS = [
  "Tritt unserem Discord bei — das ist unser Redaktionsraum.",
  "Sag im Vorstellungskanal kurz, was du machen willst.",
  "Wir melden uns, meistens noch am selben Tag, und klären den Rest.",
] as const;

export default function MitmachenPage() {
  return (
    <>
      <PageHeader
        eyebrow="Mitmachen"
        title="VoltFM ist kein Sender, der auf dich wartet."
        description="Er entsteht durch die Leute, die mitmachen. Platz ist genug — hier sind die Wege hinein."
        breadcrumbs={[
          { href: "/", label: "Start" },
          { href: "/mitmachen", label: "Mitmachen" },
        ]}
        size="large"
      />

      <section className="section shell">
        <div className={styles.ways}>
          {WAYS.map((way) => (
            <article key={way.title} className={styles.way}>
              <span className={styles.wayIcon} aria-hidden="true">
                <Icon icon={way.icon} />
              </span>
              <h2 className={styles.wayTitle}>{way.title}</h2>
              <p className={styles.wayText}>{way.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section shell">
        <div className={styles.how}>
          <div>
            <h2 className={styles.howTitle}>Wie es losgeht</h2>
            <ol className={styles.steps}>
              {STEPS.map((step, index) => (
                <li key={step} className={styles.step}>
                  <span className={styles.stepNumber}>{index + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            <ButtonLink href={site.discordUrl} external variant="primary" mode="filled" size="lg">
              <Icon icon={DiscordIcon} />
              Discord beitreten
            </ButtonLink>
          </div>

          <aside className={styles.honest}>
            <h2 className={styles.honestTitle}>Ehrlich gesagt</h2>
            <p>
              Wir sind ein kleines, nicht-kommerzielles Projekt. Es gibt kein
              Geld, keine Quote und keine Hörerzahlen, mit denen man angeben
              kann. Was es gibt: eigene Sendezeit, Leute, die zuhören, und
              niemanden, der dir vorschreibt, welchen Song du spielen musst.
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
