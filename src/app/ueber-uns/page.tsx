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
      <header className="shell pt-10 sm:pt-14">
        <Breadcrumbs
          items={[
            { href: "/", label: "Start" },
            { href: "/ueber-uns", label: "Über VoltFM" },
          ]}
        />

        <h1 className="mt-6 max-w-5xl font-display text-[2.6rem] text-balance text-foreground sm:text-7xl lg:text-8xl">
          Radio, dem man anhört,{" "}
          <span className="box-decoration-clone rounded-2xl bg-volt px-3 text-ink">dass jemand da ist.</span>
        </h1>

        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end">
          {/* Hamburg ist die Angabe, die oeffentlich stehen soll — die
              ladungsfaehige Anschrift steht im Impressum und nur dort
              (`operator` in lib/site.ts). Nicht gegen "Norddeutschland"
              o. Ae. tauschen; das ist so gewollt. */}
          <div className="flex max-w-2xl flex-col gap-3 text-lg leading-relaxed text-muted">
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

          <dl className="grid grid-cols-3 gap-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="surface-card flex min-w-0 flex-col-reverse gap-2 rounded-2xl p-4 sm:p-5"
              >
                <dt className="text-xs text-muted sm:text-sm">{stat.label}</dt>
                <dd className="truncate font-display text-2xl text-foreground sm:text-4xl">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      {/* --- Mission: eine grosse Aussage ------------------------------------ */}
      <section className="shell pt-16 sm:pt-24">
        <div className="surface-card grid items-start gap-8 rounded-[2rem] p-7 sm:p-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
          <p className="font-display text-[2.1rem] text-balance text-foreground sm:text-5xl">
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
      <section className="shell pt-16 sm:pt-24">
        <SectionHeader
          title="Wie es dazu kam"
          description="Seit Januar 2021: ein paar Namen, ein Umweg über einen eigenen Server, eine Station."
        />

        {entries.length === 0 ? (
          <p className="text-muted">Die Zeitleiste wird gerade eingepflegt.</p>
        ) : (
          <ol className="relative flex flex-col gap-3 before:absolute before:top-6 before:bottom-6 before:left-[1.4rem] before:w-px before:bg-separator sm:before:left-[2.9rem]">
            {entries.map((entry) => (
              <li key={entry.id} className="relative grid grid-cols-[2.8rem_minmax(0,1fr)] gap-x-4 sm:grid-cols-[5.8rem_minmax(0,1fr)] sm:gap-x-6">
                {/* Das Jahr als Marke auf der Schiene. */}
                <span
                  className={cn(
                    "relative z-10 mt-4 grid h-11 place-items-center self-start rounded-full font-mono text-xs font-semibold sm:h-12 sm:text-sm",
                    entry.current ? "bg-volt text-ink" : "bg-surface-secondary text-foreground",
                  )}
                >
                  {entry.year}
                </span>

                <div
                  className={cn(
                    "surface-card flex min-w-0 flex-col gap-2 rounded-3xl p-5 sm:p-7",
                    entry.current && "ring-2 ring-volt",
                  )}
                >
                  <p className="text-sm text-muted">{entry.kicker}</p>
                  <h3 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                    {entry.title}
                  </h3>
                  <p className="leading-relaxed text-muted">{entry.text}</p>
                  {entry.href && (
                    <Link
                      href={entry.href}
                      className="mt-1 self-start rounded-full bg-default px-4 py-1.5 text-sm font-semibold text-foreground transition-colors hover:bg-volt hover:text-ink"
                    >
                      {entry.linkLabel ?? "Mehr erfahren"}
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* --- Team ---------------------------------------------------------- */}
      <section className="shell pt-16 sm:pt-24">
        <SectionHeader
          title="Wer VoltFM macht"
          action={{ href: "/moderatoren", label: "Alle Profile" }}
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {hosts.map((host) => (
            <HostCard key={host.id} host={host} />
          ))}
        </div>
      </section>

      {/* --- Ausblick ------------------------------------------------------ */}
      <section className="shell pt-16 sm:pt-24">
        <div
          data-theme="dark"
          className="dark rounded-[2rem] border border-border bg-surface p-7 text-foreground shadow-[var(--lift-shadow)] sm:p-12"
        >
          <h2 className="font-display text-[2.1rem] text-foreground sm:text-5xl">Was als Nächstes kommt</h2>

          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
            Nichts davon hat ein Datum. Wir haben im August einen eigenen
            Sendeweg getestet und ihn an den Kosten scheitern sehen — seitdem
            versprechen wir nichts mehr, was wir nicht halten können.
          </p>

          <ul className="mt-8 grid gap-3 md:grid-cols-3">
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
              <li key={item.title} className="rounded-2xl bg-default p-5">
                <h3 className="text-lg font-bold tracking-tight text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.text}</p>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/radio" variant="primary">
              Jetzt live hören
            </ButtonLink>
            <ButtonLink href={site.discordUrl} external variant="tertiary">
              Discord beitreten
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
