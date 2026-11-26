import type { Metadata } from "next";
import Link from "next/link";

import { ButtonLink } from "@/components/common/button-link";
import { HostCard } from "@/components/common/host-card";
import { SectionHeader } from "@/components/common/section-header";
import { EmptyState } from "@/components/common/empty-state";
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
      {/* --- Kopfbereich: eine Platte, daneben das Display mit den Eckdaten --- */}
      <header className="shell pt-2">
        <div className="grid gap-2 lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)]">
          <div className="surface-card rounded-[var(--radius)] px-5 pt-5 pb-8 sm:px-8 sm:pt-6 sm:pb-10">
            <Breadcrumbs
              items={[
                { href: "/", label: "Start" },
                { href: "/ueber-uns", label: "Über VoltFM" },
              ]}
            />

            <h1 className="mt-8 max-w-5xl font-display text-[2.6rem] text-balance break-words text-foreground sm:mt-12 sm:text-7xl lg:text-[5.25rem]">
              Radio, dem man anhört,{" "}
              <span className="box-decoration-clone rounded-[var(--radius)] bg-volt px-2 text-graphite">
                dass jemand da ist.
              </span>
            </h1>

            {/* Hamburg ist die Angabe, die oeffentlich stehen soll — die
                ladungsfaehige Anschrift steht im Impressum und nur dort
                (`operator` in lib/site.ts). Nicht gegen "Norddeutschland"
                o. Ae. tauschen; das ist so gewollt. */}
            <div className="mt-8 flex max-w-2xl flex-col gap-3 text-lg leading-relaxed text-muted">
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
          </div>

          {/* Eckdaten als Anzeige: Zahl in Punktmatrix, Beschriftung darunter. */}
          <dl className="display-panel display-dots grid grid-cols-3 rounded-[var(--radius)] lg:grid-cols-1">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={cn(
                  "flex min-w-0 flex-col-reverse justify-end gap-2 p-4 sm:p-6 lg:justify-center",
                  index > 0 && "border-l border-white/10 lg:border-t lg:border-l-0",
                )}
              >
                <dt className="font-meta text-display-muted">{stat.label}</dt>
                <dd className="font-dot text-lg leading-none break-words text-volt sm:text-4xl">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      {/* --- Mission: eine grosse Aussage ------------------------------------ */}
      <section className="shell pt-12 sm:pt-16">
        <div className="surface-card grid items-start gap-8 rounded-[var(--radius)] p-6 sm:p-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
          <div>
            <p className="font-meta text-muted">wofür wir senden</p>
            <p className="mt-3 font-display text-[2.1rem] text-balance text-foreground sm:text-5xl">
              {site.tagline}
            </p>
          </div>
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
      <section className="shell pt-12 sm:pt-16">
        <SectionHeader
          title="Wie es dazu kam"
          description="Seit Januar 2021: ein paar Namen, ein Umweg über einen eigenen Server, eine Station."
        />

        {entries.length === 0 ? (
          <EmptyState title="Die Zeitleiste wird gerade eingepflegt." />
        ) : (
          <ol className="flex flex-col gap-2">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className={cn(
                  "surface-card grid grid-cols-[4.25rem_minmax(0,1fr)] gap-2 rounded-[var(--radius)] p-2 sm:grid-cols-[7rem_minmax(0,1fr)]",
                  entry.current && "border-volt ring-1 ring-volt",
                )}
              >
                {/* Das Jahr als kleine Anzeige links an der Platte. */}
                <span className="display-panel flex flex-col items-center justify-start gap-2 rounded-[3px] px-1 py-4">
                  <span className={cn("font-dot text-lg leading-none sm:text-2xl", entry.current ? "text-volt" : "text-display-foreground")}>
                    {entry.year}
                  </span>
                  {entry.current && (
                    <span className="flex items-center gap-1.5 font-meta text-display-muted">
                      <span className="led" aria-hidden="true" />
                      jetzt
                    </span>
                  )}
                </span>

                <div className="flex min-w-0 flex-col gap-2 px-2 py-3 sm:px-4 sm:py-4">
                  <p className="font-meta text-muted">{entry.kicker}</p>
                  <h3 className="font-wide text-xl font-bold text-balance text-foreground sm:text-2xl">
                    {entry.title}
                  </h3>
                  <p className="leading-relaxed text-pretty text-muted">{entry.text}</p>
                  {entry.href && (
                    <Link
                      href={entry.href}
                      className="key mt-2 inline-flex self-start rounded-[var(--radius)] bg-surface px-3.5 py-1.5 text-sm font-semibold text-foreground ring-1 ring-border transition-colors hover:bg-volt hover:text-graphite"
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
      <section className="shell pt-12 sm:pt-16">
        <SectionHeader
          title="Wer VoltFM macht"
          action={{ href: "/moderatoren", label: "Alle Profile" }}
        />
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {hosts.map((host) => (
            <HostCard key={host.id} host={host} />
          ))}
        </div>
      </section>

      {/* --- Ausblick: das Display mit dem, was noch nicht laeuft ----------- */}
      <section className="shell pt-12 sm:pt-16">
        <div className="display-panel display-dots rounded-[var(--radius)] p-6 sm:p-10">
          <p className="flex items-center gap-2 font-meta text-display-muted">
            <span className="led" aria-hidden="true" />
            in arbeit
          </p>
          <h2 className="mt-4 font-display text-[2.1rem] text-balance text-display-foreground sm:text-5xl">
            Was als Nächstes kommt
          </h2>

          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-display-muted">
            Nichts davon hat ein Datum. Wir haben im August einen eigenen
            Sendeweg getestet und ihn an den Kosten scheitern sehen — seitdem
            versprechen wir nichts mehr, was wir nicht halten können.
          </p>

          <ul className="mt-8 grid gap-2 md:grid-cols-3">
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
            ].map((item, index) => (
              <li key={item.title} className="rounded-[3px] border border-white/10 p-5">
                <p className="font-dot text-sm text-volt" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-3 font-wide text-lg font-bold text-display-foreground">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-display-muted">{item.text}</p>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/radio" variant="primary">
              Jetzt live hören
            </ButtonLink>
            <a
              href={site.discordUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="key inline-flex items-center rounded-[var(--radius)] bg-white/10 px-4 py-2 text-sm font-semibold text-display-foreground ring-1 ring-white/15 transition-colors hover:bg-volt hover:text-graphite"
            >
              Discord beitreten
              <span className="sr-only"> (öffnet einen neuen Tab)</span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
