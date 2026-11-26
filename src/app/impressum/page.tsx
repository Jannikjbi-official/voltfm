import type { Metadata } from "next";
import { PageHeader } from "@/components/common/page-header";
import { operator, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Impressum",
  description: "Anbieterkennzeichnung nach § 5 DDG.",
  alternates: { canonical: "/impressum" },
};

const SECTIONS = [
  { id: "angaben-gemaess-5-ddg", label: "Angaben gemäß § 5 DDG" },
  { id: "kontakt", label: "Kontakt" },
  { id: "verantwortlich-fuer-den-inhalt-nach-18-abs-2-mstv", label: "Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV" },
  { id: "haftung-fuer-inhalte", label: "Haftung für Inhalte" },
  { id: "haftung-fuer-links", label: "Haftung für Links" },
  { id: "musik-und-livestream", label: "Musik und Livestream" },
  { id: "urheberrecht", label: "Urheberrecht" },
  { id: "streitschlichtung", label: "Streitschlichtung" },
] as const;

/** Inhaltsverzeichnis am Rand: auf dem Desktop mitlaufend, am Handy ausgeblendet. */
function Contents({ sections }: { sections: readonly { id: string; label: string }[] }) {
  return (
    <nav
      aria-label="Auf dieser Seite"
      className="surface-card hidden rounded-3xl p-3 lg:sticky lg:top-[calc(var(--header-height)+1.75rem)] lg:col-span-4 lg:block xl:col-span-3"
    >
      <p className="px-3 pt-2 pb-2 text-sm font-semibold text-muted">Auf dieser Seite</p>
      <ul className="flex flex-col">
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className="block rounded-xl px-3 py-2 text-sm leading-snug text-foreground transition-colors hover:bg-default"
            >
              {section.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function ImpressumPage() {
  return (
    <>
      <PageHeader
        title="Impressum"
        breadcrumbs={[
          { href: "/", label: "Start" },
          { href: "/impressum", label: "Impressum" },
        ]}
      />

      <section className="shell">
        <div className="grid items-start gap-3 lg:grid-cols-12">
          <Contents sections={SECTIONS} />

          <article className="surface-card min-w-0 rounded-[var(--radius)] p-6 sm:p-12 lg:col-span-8 xl:col-span-9">
            <div className="vfm-prose max-w-[68ch] [&>h2:first-child]:mt-0 [&_h2]:scroll-mt-28">
              <h2 id="angaben-gemaess-5-ddg">Angaben gemäß § 5 DDG</h2>
              <p>
                VoltFM ist ein nicht-kommerzielles, privates Webradio-Projekt.
                <br />
                Es wird betrieben von:
              </p>
              <address className="rounded-2xl bg-surface-secondary px-5 py-4 not-italic leading-relaxed">
                {operator.name}
                <br />
                {operator.street}
                <br />
                {operator.postalCode} {operator.city}
                <br />
                {operator.country}
              </address>

              <h2 id="kontakt">Kontakt</h2>
              <p>
                E-Mail: <a href={`mailto:${operator.email}`}>{operator.email}</a>
                <br />
                Web: <a href={site.canonicalUrl}>voltfm.xyz</a>
                <br />
                Discord: <a href={site.discordUrl}>{site.discordUrl}</a>
              </p>
              {site.mailOutage && (
                <p className="rounded-2xl border border-warning/40 bg-warning-soft px-5 py-4 text-[0.9375rem] leading-relaxed">
                  <strong>Hinweis zur Erreichbarkeit:</strong> Unser Mailserver für die
                  Adressen auf den Domains voltfm.xyz und jannikjbi.de ist derzeit
                  ausgefallen. Nachrichten an {site.stationEmail} oder{" "}
                  {site.legacyEmail} kommen nicht an. Die oben genannte Adresse{" "}
                  {operator.email} funktioniert und ist der verbindliche Weg für
                  rechtliche Anliegen.
                </p>
              )}

              <h2 id="verantwortlich-fuer-den-inhalt-nach-18-abs-2-mstv">Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
              <address className="rounded-2xl bg-surface-secondary px-5 py-4 not-italic leading-relaxed">
                {operator.name}
                <br />
                {operator.street}
                <br />
                {operator.postalCode} {operator.city}
              </address>

              <h2 id="haftung-fuer-inhalte">Haftung für Inhalte</h2>
              <p>
                Als Diensteanbieter sind wir für eigene Inhalte auf diesen Seiten
                nach den allgemeinen Gesetzen verantwortlich. Wir sind jedoch nicht
                verpflichtet, übermittelte oder gespeicherte fremde Informationen zu
                überwachen.
              </p>

              <h2 id="haftung-fuer-links">Haftung für Links</h2>
              <p>
                Unser Angebot enthält Links zu externen Websites Dritter, auf deren
                Inhalte wir keinen Einfluss haben. Für die Inhalte der verlinkten
                Seiten ist stets der jeweilige Anbieter verantwortlich.
              </p>

              <h2 id="musik-und-livestream">Musik und Livestream</h2>
              <p>
                Das Programm von VoltFM wird über laut.fm ausgestrahlt. laut.fm hält
                die erforderlichen Lizenzen mit GEMA und GVL und trägt die
                Streamingkosten. Eingebettet wird der Stream auf dieser Website nicht:
                Der Play-Knopf öffnet den Webplayer von lautstation.de in einem neuen
                Fenster.
              </p>

              <h2 id="urheberrecht">Urheberrecht</h2>
              <p>
                Die auf dieser Website erstellten Inhalte und Werke unterliegen dem
                deutschen Urheberrecht. Beiträge Dritter sind als solche
                gekennzeichnet.
              </p>

              <h2 id="streitschlichtung">Streitschlichtung</h2>
              <p>
                Wir sind nicht bereit und nicht verpflichtet, an
                Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
                teilzunehmen.
              </p>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
