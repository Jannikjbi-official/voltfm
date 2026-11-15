import type { Metadata } from "next";
import Link from "next/link";

import { ButtonLink } from "@/components/common/button-link";
import { HostCard } from "@/components/common/host-card";
import { SectionHeader } from "@/components/common/section-header";
import { listHosts, listTimeline } from "@/services/content";
import { cn } from "@heroui/react";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Über VoltFM",
  description:
    "Wie aus einer laut.fm-Station in Hamburg VoltFM wurde, und woran wir gerade arbeiten.",
  alternates: { canonical: "/ueber-uns" },
};

export const revalidate = 3600;

export default async function UeberUnsPage() {
  const [hosts, entries] = await Promise.all([listHosts(), listTimeline()]);

  const stats = [
    { label: "Auf Sendung seit", value: "2021" },
    { label: "Am Mikrofon", value: String(hosts.length) },
    { label: "Zu hören über", value: "laut.fm" },
  ];

  return (
    <>
      {/* --- Kopfbereich --------------------------------------------------- */}
      <header className="border-b border-separator">
        <div className="shell pt-8 pb-12 sm:pt-10 sm:pb-16">
          <Breadcrumbs
            items={[
              { href: "/", label: "Start" },
              { href: "/ueber-uns", label: "Über VoltFM" },
            ]}
          />

          <h1 className="mt-6 max-w-4xl font-display text-[2.5rem] leading-[0.95] text-balance text-foreground sm:text-6xl lg:text-7xl">
            Radio, dem man anhört,
            <br />
            <span className="text-accent-text">dass jemand da ist.</span>
          </h1>

          {/* Hamburg ist die Angabe, die oeffentlich stehen soll — die
              ladungsfaehige Anschrift steht im Impressum und nur dort
              (`operator` in lib/site.ts). Nicht gegen "Norddeutschland"
              o. Ae. tauschen; das ist so gewollt. */}
          <div className="mt-6 flex max-w-2xl flex-col gap-3 text-lg leading-relaxed text-muted">
            <p>
              VoltFM ist ein unabhängiges Webradio aus Hamburg. Kein Sender einer
              Kette, kein Unternehmen dahinter — ein paar Leute, die Radio machen
              wollen.
            </p>
            {/* Stand frueher im Hero der Startseite. Hier gehoert der Satz hin:
                Er erklaert, was VoltFM gerade ist. */}
            <p>
              Zwei Leute, ein Sender, seit 2021. Gerade läuft rund um die Uhr der
              Musikpool von laut.fm, wir arbeiten an mehr.
            </p>
          </div>

          <dl className="mt-10 grid max-w-2xl grid-cols-3 gap-4 border-t border-separator pt-6 sm:gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="flex min-w-0 flex-col-reverse gap-1">
                <dt className="text-sm text-muted">{stat.label}</dt>
                <dd className="truncate font-display text-2xl leading-none text-foreground sm:text-4xl">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      {/* --- Mission: eine grosse Aussage ------------------------------------ */}
      <section className="shell py-14 sm:py-20">
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
          <p className="font-display text-3xl leading-[1.02] text-balance text-foreground sm:text-5xl">
            {site.tagline}
          </p>
          <div className="flex flex-col gap-5 text-lg leading-relaxed text-muted">
            <p>
              Es gibt ein Argument gegen Radio, das schwer zu widerlegen ist: Ein
              Algorithmus kennt deinen Geschmack besser als jede Redaktion. Er
              weiß, welchen Song du übersprungen hast und welchen du dreimal
              hintereinander gehört hast.
            </p>
            <p>
              Was er nicht kann: dafür sorgen, dass viele Menschen im selben
              Moment dasselbe hören. Genau daraus entsteht alles, was uns an
              VoltFM wichtig ist — die Reaktionen im Discord, das gemeinsame
              Aufregen über eine Songauswahl, das Gefühl, nicht allein in einer
              Playlist zu sitzen.
            </p>
            <p>
              Dazu gehört auch, dass mal ein Song läuft, den du nicht magst. Eine
              Redaktion, die sich nicht traut danebenzuliegen, ist auch nur ein
              schlechterer Algorithmus.
            </p>
          </div>
        </div>
      </section>

      {/* --- Zeitleiste ------------------------------------------------------ */}
      <section className="border-y border-separator bg-surface-secondary/50">
        <div className="shell py-14 sm:py-20">
          <SectionHeader
            title="Wie es dazu kam"
            description="Seit Januar 2021: ein paar Namen, ein Umweg über einen eigenen Server, eine Station."
          />

          {entries.length === 0 ? (
            <p className="text-muted">Die Zeitleiste wird gerade eingepflegt.</p>
          ) : (
            <ol className="relative flex flex-col gap-4 before:absolute before:top-3 before:bottom-3 before:left-[0.4375rem] before:w-0.5 before:bg-border sm:before:left-[7.4375rem]">
              {entries.map((entry) => (
                <li
                  key={entry.id}
                  className="relative grid grid-cols-[1rem_minmax(0,1fr)] gap-x-4 sm:grid-cols-[6rem_1rem_minmax(0,1fr)] sm:gap-x-4"
                >
                  {/* Jahr und Stichwort links neben der Schiene (am Handy darueber). */}
                  <div className="col-start-2 flex items-baseline gap-3 sm:col-start-1 sm:row-start-1 sm:flex-col sm:items-end sm:gap-1 sm:pt-5 sm:text-right">
                    <span
                      className={cn(
                        "font-display text-xl leading-none sm:text-2xl",
                        entry.current ? "text-accent-text" : "text-foreground",
                      )}
                    >
                      {entry.year}
                    </span>
                    <span className="text-sm text-muted">{entry.kicker}</span>
                  </div>

                  {/* Der Punkt auf der Schiene. */}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "relative col-start-1 row-span-2 row-start-1 mt-1 size-4 rounded-full border-2 sm:col-start-2 sm:mt-6",
                      entry.current
                        ? "border-volt bg-volt shadow-[0_0_0_5px_color-mix(in_oklab,var(--volt)_22%,transparent)]"
                        : "border-border bg-background",
                    )}
                  />

                  <div
                    className={cn(
                      "col-start-2 mt-2 flex min-w-0 flex-col gap-2 rounded-2xl border bg-surface p-5 sm:col-start-3 sm:row-start-1 sm:mt-0 sm:p-6",
                      entry.current ? "border-accent-text/40" : "border-border",
                    )}
                  >
                    <h3 className="font-wide text-lg font-bold text-foreground sm:text-xl">
                      {entry.title}
                    </h3>
                    <p className="leading-relaxed text-muted">{entry.text}</p>
                    {entry.href && (
                      <Link
                        href={entry.href}
                        className="self-start rounded-sm pt-1 text-sm font-semibold text-foreground underline decoration-accent-text decoration-2 underline-offset-4 hover:decoration-foreground"
                      >
                        {entry.linkLabel ?? "Mehr erfahren"}
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>

      {/* --- Team ---------------------------------------------------------- */}
      <section className="shell py-14 sm:py-20">
        <SectionHeader
          title="Wer VoltFM macht"
          action={{ href: "/moderatoren", label: "Alle Profile" }}
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {hosts.map((host) => (
            <HostCard key={host.id} host={host} />
          ))}
        </div>
      </section>

      {/* --- Ausblick ------------------------------------------------------ */}
      <section className="shell">
        <div className="rounded-3xl border border-border bg-surface p-6 sm:p-10 lg:p-12">
          <h2 className="font-display text-3xl leading-[1.02] text-foreground sm:text-4xl">
            Was als Nächstes kommt
          </h2>

          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
            Nichts davon hat ein Datum. Wir haben im August einen eigenen
            Sendeweg getestet und ihn an den Kosten scheitern sehen — seitdem
            versprechen wir nichts mehr, was wir nicht halten können.
          </p>

          <ul className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Rund um die Uhr live",
                text: "Heute läuft der Musikpool von laut.fm. Mit einer eigenen Software, die von unserem Server auf laut.fm sendet, käme eigene Musik dazu — und feste Sendezeiten, auf die Verlass ist.",
              },
              {
                title: "Songwünsche",
                text: "Wünsche, die tatsächlich in der laufenden Sendung landen statt in einer Liste, die niemand liest. Hängt am selben Schritt.",
              },
              {
                title: "Der Sendeplan zurück",
                text: "Solange die Zeiten nicht verlässlich sind, steht lieber keiner da als ein falscher.",
              },
            ].map((item) => (
              <li key={item.title} className="rounded-2xl bg-surface-secondary p-5">
                <h3 className="font-wide text-lg font-bold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.text}</p>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/radio" variant="primary">
              Jetzt live hören
            </ButtonLink>
            <ButtonLink href={site.discordUrl} external variant="outline">
              Discord beitreten
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
