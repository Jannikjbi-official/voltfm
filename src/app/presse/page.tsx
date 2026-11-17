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
      <section className="shell">
        <div className="grid gap-3 lg:grid-cols-12">
          <article className="surface-card rounded-[2rem] p-7 sm:p-10 lg:col-span-7">
            <h2 className="font-display text-[2rem] text-foreground sm:text-4xl">Kurzprofil</h2>
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

          <div className="flex flex-col gap-3 lg:col-span-5">
            <h2 className="sr-only">Zahlen und Fakten</h2>
            <dl className="grid flex-1 grid-cols-2 gap-3">
              {facts.map((fact) => (
                <div
                  key={fact.label}
                  className="surface-card flex min-w-0 flex-col justify-between gap-6 rounded-3xl p-5"
                >
                  <dt className="text-sm text-muted">{fact.label}</dt>
                  <dd className="font-display text-xl break-words text-foreground sm:text-2xl">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Das Zitat als gelbe Flaeche mit Tinte darauf. */}
          <figure className="rounded-[2rem] bg-volt p-7 text-ink sm:p-12 lg:col-span-12">
            <h2 className="text-sm font-semibold text-ink/70">Zum Zitieren</h2>
            <blockquote className="mt-4 max-w-4xl font-display text-[1.7rem] leading-[1.15] text-balance sm:text-5xl">
              &bdquo;Ein Algorithmus kennt deinen Geschmack besser als jede
              Redaktion. Was er nicht kann: dafür sorgen, dass viele Menschen im
              selben Moment dasselbe hören.&ldquo;
            </blockquote>
          </figure>

          <div className="surface-card flex flex-col gap-6 rounded-[2rem] p-7 sm:p-10 lg:col-span-7">
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
            <div className="grid min-h-40 place-items-center rounded-3xl bg-surface-secondary px-6 py-10">
              <span role="img" aria-label="Das VoltFM-Logo" className="block">
                <LogoWordmark className="h-auto w-full max-w-[16rem] sm:max-w-sm" />
              </span>
            </div>

            <ButtonLink href="/logo/voltfm-logo.zip" external variant="primary" className="self-start">
              <Icon icon={DownloadIcon} />
              Logo-Paket herunterladen
            </ButtonLink>
          </div>

          <div className="flex flex-col gap-3 lg:col-span-5">
            <div
              data-theme="dark"
              className="dark flex flex-1 flex-col items-start gap-4 rounded-[2rem] border border-border bg-surface p-7 text-foreground shadow-[var(--lift-shadow)] sm:p-9"
            >
              <h2 className="font-display text-[2rem] text-foreground sm:text-4xl">Ansprechpartner</h2>
              <p className="leading-relaxed text-muted">
                <span className="font-semibold text-foreground">{operator.name}</span>
                <br />
                Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV
              </p>
              <a
                href={`mailto:${operator.email}`}
                className="rounded-sm text-lg font-semibold break-all text-volt underline-offset-4 hover:underline"
              >
                {operator.email}
              </a>
              <ButtonLink href={site.discordUrl} external variant="tertiary" className="mt-auto">
                <Icon icon={DiscordIcon} />
                Schneller über Discord
              </ButtonLink>
            </div>

            <nav aria-labelledby="presse-weiter" className="surface-card rounded-3xl p-5">
              <h2 id="presse-weiter" className="text-sm font-semibold text-muted">
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
                      className="inline-flex rounded-full bg-default px-4 py-1.5 text-sm font-semibold text-foreground transition-colors hover:bg-volt hover:text-ink"
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
