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

      <section className="shell py-14 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-16">
          <div className="max-w-[68ch]">
            <article className="vfm-prose">
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
              <blockquote>
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
            </article>

            {/* Ausserhalb von .vfm-prose: dessen Link-Regeln wuerden sonst den
                Knopf unterstreichen. */}
            <div className="mt-6 flex flex-col items-start gap-5 rounded-2xl border border-border bg-surface p-6 sm:flex-row sm:items-center sm:justify-between">
              {/* Inline statt als PNG: ohne eigenen Hintergrund, und die Farben
                  folgen dem Modus wie im Header. */}
              <span role="img" aria-label="Das VoltFM-Logo" className="block">
                <LogoWordmark className="h-9 w-auto sm:h-11" />
              </span>
              <ButtonLink href="/logo/voltfm-logo.zip" external variant="outline" size="sm">
                <Icon icon={DownloadIcon} />
                Logo-Paket herunterladen
              </ButtonLink>
            </div>
          </div>

          <aside className="flex flex-col gap-4 self-start">
            <div className="rounded-2xl border border-border bg-surface p-6">
              <h2 className="font-wide text-lg font-bold text-foreground">Zahlen und Fakten</h2>
              <dl className="mt-4 flex flex-col divide-y divide-separator">
                {facts.map((fact) => (
                  <div key={fact.label} className="flex items-baseline justify-between gap-4 py-2.5">
                    <dt className="text-sm text-muted">{fact.label}</dt>
                    <dd className="text-right text-sm font-semibold text-foreground">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="flex flex-col items-start gap-3 rounded-2xl border border-border bg-surface p-6">
              <h2 className="font-wide text-lg font-bold text-foreground">Ansprechpartner</h2>
              <p className="text-sm leading-relaxed text-muted">
                <span className="font-semibold text-foreground">{operator.name}</span>
                <br />
                Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV
              </p>
              <p className="text-sm">
                <a
                  href={`mailto:${operator.email}`}
                  className="rounded-sm font-semibold break-all text-foreground underline decoration-accent-text decoration-2 underline-offset-4"
                >
                  {operator.email}
                </a>
              </p>
              <ButtonLink href={site.discordUrl} external variant="secondary" size="sm">
                <Icon icon={DiscordIcon} />
                Schneller über Discord
              </ButtonLink>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-6">
              <h2 className="font-wide text-lg font-bold text-foreground">Weiterführend</h2>
              <ul className="mt-3 flex flex-col gap-2 text-sm">
                <li>
                  <Link href="/ueber-uns" className="rounded-sm text-muted hover:text-foreground">
                    Über VoltFM
                  </Link>
                </li>
                <li>
                  <Link href="/moderatoren" className="rounded-sm text-muted hover:text-foreground">
                    Moderatorenprofile
                  </Link>
                </li>
                <li>
                  <Link href="/impressum" className="rounded-sm text-muted hover:text-foreground">
                    Impressum
                  </Link>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
