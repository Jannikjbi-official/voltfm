import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/common/page-header";
import { LogoWordmark } from "@/components/layout/logo";
import { ButtonLink } from "@/components/common/button-link";
import { Icon, DiscordIcon, DownloadIcon } from "@/lib/icons";
import { listHosts } from "@/services/content";
import { operator, radio, site } from "@/lib/site";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Presse",
  description:
    "Kurzprofil, Zahlen, Logo und Ansprechpartner für Presseanfragen zu VoltFM.",
  alternates: { canonical: "/presse" },
};

export const revalidate = 3600;

export default async function PressePage() {
  const hosts = await listHosts();

  /* Nur belegbare Angaben. Hörerzahlen stehen bewusst nicht dabei: Die
     schwanken stündlich, und eine Momentaufnahme wäre als Kennzahl
     irreführend. */
  const facts = [
    { label: "Gegründet", value: "Januar 2021" },
    { label: "Sitz", value: "Hamburg" },
    { label: "Am Mikrofon", value: String(hosts.length) },
    { label: "Sendebetrieb", value: "24 / 7" },
    { label: "Ausstrahlung", value: radio.providerName },
    { label: "Finanzierung", value: "nicht-kommerziell" },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Presse"
        title="Pressebereich"
        description="Alles, was du für einen Beitrag über VoltFM brauchst — Kurzprofil, Zahlen, Logo und ein Ansprechpartner."
        breadcrumbs={[
          { href: "/", label: "Start" },
          { href: "/presse", label: "Presse" },
        ]}
        size="large"
      />

      <section className="section shell">
        <div className={styles.layout}>
          <article className={styles.prose}>
            <h2>Kurzprofil</h2>
            <p>
              VoltFM ist ein unabhängiges, nicht-kommerzielles Webradio aus
              Hamburg. Gestartet im Januar 2021 als laut.fm-Station jannikjbi.
              Jannik und Mochiko sind von Anfang an dabei und machen den Sender
              bis heute zu zweit.
            </p>
            <p>
              Ausgestrahlt wird über {radio.providerName}, das die Lizenzen mit
              den Verwertungsgesellschaften hält und über Werbung im Stream
              finanziert. VoltFM selbst verdient daran nichts, und es gibt keine
              Bezahlschranke. Gespielt wird derzeit der Musikpool von{" "}
              {radio.providerName}.
            </p>
            <p>
              Einmal im Jahr überträgt VoltFM{" "}
              <Link href="/radioaid">RadioAid</Link>, eine 24-stündige
              Charity-Sendung der laut.fm-Community. Seit 2022 ist der Sender
              jedes Mal dabei.
            </p>

            <h2>Zum Zitieren</h2>
            <blockquote className={styles.quote}>
              &bdquo;Ein Algorithmus kennt deinen Geschmack besser als jede
              Redaktion. Was er nicht kann: dafür sorgen, dass viele Menschen im
              selben Moment dasselbe hören.&ldquo;
            </blockquote>

            <h2>Logo</h2>
            <p>
              Das Logo darf im Zusammenhang mit Berichterstattung über VoltFM
              verwendet werden. Bitte nicht verzerren oder umfärben. Im Paket
              stecken Logo und Icon als PNG und SVG, jeweils für helle und
              dunkle Flächen.
            </p>
            <div className={styles.logoBox}>
              {/* Inline statt als PNG: ohne eigenen Hintergrund, und die Farben
                  folgen dem Modus wie im Header. */}
              <span role="img" aria-label="Das VoltFM-Logo" className={styles.logo}>
                <LogoWordmark className={styles.logoMark} />
              </span>
              <ButtonLink href="/logo/voltfm-logo.zip" external variant="neutral" mode="stroke" size="sm">
                <Icon icon={DownloadIcon} />
                Logo-Paket herunterladen
              </ButtonLink>
            </div>
          </article>

          <aside className={styles.side}>
            <div className={styles.block}>
              <h2 className={styles.blockTitle}>Zahlen und Fakten</h2>
              <dl className={styles.facts}>
                {facts.map((fact) => (
                  <div key={fact.label} className={styles.fact}>
                    <dt>{fact.label}</dt>
                    <dd>{fact.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className={styles.block}>
              <h2 className={styles.blockTitle}>Ansprechpartner</h2>
              <p className={styles.blockText}>
                {operator.name}
                <br />
                Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV
              </p>
              <p className={styles.blockText}>
                <a href={`mailto:${operator.email}`} className={styles.mail}>
                  {operator.email}
                </a>
              </p>
              <ButtonLink href={site.discordUrl} external variant="primary" mode="stroke" size="sm">
                <Icon icon={DiscordIcon} />
                Schneller über Discord
              </ButtonLink>
            </div>

            <div className={styles.block}>
              <h2 className={styles.blockTitle}>Weiterführend</h2>
              <ul className={styles.links}>
                <li>
                  <Link href="/ueber-uns">Über VoltFM</Link>
                </li>
                <li>
                  <Link href="/moderatoren">Moderatorenprofile</Link>
                </li>
                <li>
                  <Link href="/impressum">Impressum</Link>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
