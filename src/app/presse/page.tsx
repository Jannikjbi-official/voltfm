import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/common/page-header";
import { LogoWordmark } from "@/components/layout/logo";
import { ButtonLink } from "@/components/common/button-link";
import { Icon, DiscordIcon, DownloadIcon } from "@/lib/icons";
import { listHosts } from "@/services/content";
import { operator, radio, site } from "@/lib/site";

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
        title="Pressebereich"
        description="Alles, was du für einen Beitrag über VoltFM brauchst — Kurzprofil, Zahlen, Logo und ein Ansprechpartner."
        breadcrumbs={[
          { href: "/", label: "Start" },
          { href: "/presse", label: "Presse" },
        ]}
        size="large"
      />

      {/* Ein Raster aus Karten statt einer Textspalte mit Randleiste: Wer
          fuer einen Beitrag recherchiert, sucht eine Angabe und nicht den
          Lesefluss. */}
      <section className="shell pt-2">
        <div className="grid gap-2 lg:grid-cols-12">
          <article className="surface-card rounded-[var(--radius)] p-6 sm:p-10 lg:col-span-7">
            <p className="font-meta text-muted">steckbrief</p>
            <h2 className="mt-2 font-display text-[2rem] text-foreground sm:text-4xl">Kurzprofil</h2>
            <div className="vfm-prose mt-5 [&>p:first-child]:mt-0">
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
            </div>
          </article>

          {/* Die Eckdaten als Anzeige: Beschriftung oben, Wert in Punktmatrix. */}
          <div className="display-panel display-dots flex flex-col rounded-[var(--radius)] lg:col-span-5">
            <h2 className="sr-only">Zahlen und Fakten</h2>
            <dl className="grid flex-1 grid-cols-2">
              {facts.map((fact, index) => (
                <div
                  key={fact.label}
                  className={
                    "flex min-w-0 flex-col justify-between gap-5 border-white/10 p-5 sm:p-6 " +
                    (index % 2 === 1 ? "border-l " : "") +
                    (index > 1 ? "border-t" : "")
                  }
                >
                  <dt className="font-meta text-display-muted">{fact.label}</dt>
                  <dd className="font-dot text-base leading-tight break-words text-volt sm:text-xl">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Das Zitat als gelbe Platte mit Tinte darauf. */}
          <figure className="key rounded-[var(--radius)] bg-volt p-6 text-graphite active:translate-y-0 sm:p-12 lg:col-span-12">
            <h2 className="font-mono text-xs lowercase text-graphite/70">zum zitieren</h2>
            <blockquote className="mt-4 max-w-4xl font-display text-[1.7rem] leading-[1.15] text-balance sm:text-5xl">
              &bdquo;Ein Algorithmus kennt deinen Geschmack besser als jede
              Redaktion. Was er nicht kann: dafür sorgen, dass viele Menschen im
              selben Moment dasselbe hören.&ldquo;
            </blockquote>
          </figure>

          <div className="surface-card flex flex-col gap-6 rounded-[var(--radius)] p-6 sm:p-10 lg:col-span-7">
            <div>
              <h2 className="font-display text-[2rem] text-foreground sm:text-4xl">Logo</h2>
              <p className="mt-3 max-w-xl leading-relaxed text-muted">
                Das Logo darf im Zusammenhang mit Berichterstattung über VoltFM
                verwendet werden. Bitte nicht verzerren oder umfärben. Im Paket
                stecken Logo und Icon als PNG und SVG, jeweils für helle und
                dunkle Flächen.
              </p>
            </div>

            {/* Inline statt als PNG: ohne eigenen Hintergrund, und die Farben
                folgen dem Modus wie im Header. */}
            <div className="well grid min-h-40 place-items-center rounded-[var(--radius)] px-6 py-10">
              <span role="img" aria-label="Das VoltFM-Logo" className="block">
                <LogoWordmark className="h-auto w-full max-w-[16rem] sm:max-w-sm" />
              </span>
            </div>

            <ButtonLink href="/logo/voltfm-logo.zip" external variant="primary" className="self-start">
              <Icon icon={DownloadIcon} />
              Logo-Paket herunterladen
            </ButtonLink>
          </div>

          <div className="flex flex-col gap-2 lg:col-span-5">
            <div className="surface-card flex flex-1 flex-col items-start gap-4 rounded-[var(--radius)] p-6 sm:p-8">
              <p className="flex items-center gap-2 font-meta text-muted">
                <span className="led" aria-hidden="true" />
                presseleitung
              </p>
              <h2 className="font-display text-[2rem] text-foreground sm:text-4xl">Ansprechpartner</h2>
              <p className="leading-relaxed text-muted">
                <span className="font-semibold text-foreground">{operator.name}</span>
                <br />
                Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV
              </p>
              <a
                href={`mailto:${operator.email}`}
                className="well w-full rounded-[var(--radius)] px-4 py-3 font-mono text-sm font-semibold break-all text-foreground underline-offset-4 hover:underline sm:text-base"
              >
                {operator.email}
              </a>
              <ButtonLink href={site.discordUrl} external variant="tertiary" className="mt-auto">
                <Icon icon={DiscordIcon} />
                Schneller über Discord
              </ButtonLink>
            </div>

            <nav aria-labelledby="presse-weiter" className="surface-card rounded-[var(--radius)] p-5">
              <h2 id="presse-weiter" className="font-meta text-muted">
                Weiterführend
              </h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {[
                  { href: "/ueber-uns", label: "Über VoltFM" },
                  { href: "/moderatoren", label: "Moderatorenprofile" },
                  { href: "/impressum", label: "Impressum" },
                ].map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="key inline-flex rounded-[var(--radius)] bg-surface px-3.5 py-1.5 text-sm font-semibold text-foreground ring-1 ring-border transition-colors hover:bg-volt hover:text-graphite"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </section>
    </>
  );
}
