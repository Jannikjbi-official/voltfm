import type { Metadata } from "next";
import { buttonVariants } from "@heroui/react";

import { PageHeader } from "@/components/common/page-header";
import { ButtonLink } from "@/components/common/button-link";
import { Icon, DiscordIcon, DownloadIcon } from "@/lib/icons";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Overlay für Streamer",
  description:
    "Ein VoltFM-Overlay für OBS und Streamlabs: Alle paar Minuten erscheint eine VoltFM-Karte in einer Ecke deines Streams.",
  alternates: { canonical: "/overlay" },
};

const DOWNLOAD = "/downloads/voltfm-overlay.zip";
const PREVIEW = "/downloads/voltfm-overlay-vorschau.mp4";

/** Aus LIESMICH.txt im Paket — dieselben Schritte, dieselbe Reihenfolge. */
const STEPS = [
  "Lade das Paket herunter, entpacke es und leg den Ordner „VoltFM-Overlay“ irgendwo auf deinem PC ab, wo er bleibt.",
  "In OBS: Quellen, dann +, dann „Browser“.",
  "Setz den Haken bei „Lokale Datei“ und wähle „voltfm-overlay.html“ aus.",
  "Trag als Breite 1920 und als Höhe 1080 ein.",
  "Lass die Quelle ganz oben in der Liste, damit sie über allem liegt.",
];

/** Die Einstellungen ganz oben in voltfm-overlay.html, mit ihren Vorgaben. */
const SETTINGS: { name: string; value: string; text: string }[] = [
  { name: "alleMinuten", value: "5", text: "Wie oft die Karte kommt, in Minuten." },
  { name: "sichtbarSekunden", value: "24", text: "Wie lange sie stehen bleibt. Die Texte teilen sich die Zeit." },
  { name: "ersteNachSekunden", value: "5", text: "Wann sie nach dem Laden zum ersten Mal erscheint." },
  { name: "ecke", value: "unten-links", text: "Oder unten-rechts, oben-links, oben-rechts." },
  { name: "abstand", value: "56", text: "Abstand zum Bildrand in Pixeln." },
  { name: "groesse", value: "1", text: "0.8 ist kleiner, 1.2 größer." },
  { name: "lasche", value: "Jetzt reinhören", text: "Der Text in der gelben Lasche oben." },
  { name: "texte", value: "3 Texte", text: "Bis zu drei Texte mit je einer kleinen, großen und unteren Zeile." },
  { name: "test", value: "false", text: "Auf true gestellt kommt die Karte alle 40 Sekunden, zum Einrichten." },
];

export default function OverlayPage() {
  return (
    <>
      <PageHeader
        title="Overlay für Streamer"
        description="Eine VoltFM-Karte für deinen Stream: Alle paar Minuten erscheint sie in einer Ecke, zeigt nacheinander bis zu drei kurze Texte über VoltFM und verschwindet wieder."
        breadcrumbs={[
          { href: "/", label: "Start" },
          { href: "/overlay", label: "Overlay" },
        ]}
        size="large"
        aside={
          <a href={DOWNLOAD} download className={buttonVariants({ variant: "primary", size: "lg" })}>
            <Icon icon={DownloadIcon} />
            Overlay herunterladen
          </a>
        }
      />

      <section className="shell pt-2">
        <div className="grid gap-2 lg:grid-cols-12">
          {/* Eigene Datei vom eigenen Server — kein Dritter, also kein Hinweis
              vorab. Ohne Autoplay; das Video hat ohnehin keinen Ton. */}
          <figure className="display-panel flex flex-col gap-3 rounded-[var(--radius)] p-2 lg:col-span-8">
            <video
              src={PREVIEW}
              controls
              muted
              loop
              playsInline
              preload="metadata"
              className="aspect-video w-full rounded-[3px] bg-black"
            >
              Dein Browser kann das Vorschauvideo nicht abspielen.{" "}
              <a href={PREVIEW}>Video herunterladen</a>
            </video>
            <figcaption className="px-3 pb-2 font-meta text-display-muted">vorschau: ein durchlauf</figcaption>
          </figure>

          <div className="surface-card flex flex-col gap-4 rounded-[var(--radius)] p-6 sm:p-8 lg:col-span-4">
            <p className="font-meta text-muted">was es macht</p>
            <h2 className="font-display text-[2rem] text-foreground sm:text-4xl">Kurz erklärt</h2>
            <ul className="flex flex-col gap-3 leading-relaxed text-muted">
              <li>Die Karte fliegt alle fünf Minuten unten links ins Bild, das lässt sich ändern.</li>
              <li>Sie bleibt 24 Sekunden stehen und zeigt nacheinander bis zu drei kurze Texte.</li>
              <li>Der Hintergrund ist durchsichtig, es gibt keinen Ton.</li>
              <li>
                Es lädt keine Daten von anderen Seiten. Nur die Schrift kommt von Google
                Fonts, dafür braucht OBS Internet.
              </li>
            </ul>
          </div>

          <div className="surface-card rounded-[var(--radius)] p-6 sm:p-10 lg:col-span-12">
            <p className="font-meta text-muted">einrichten in obs</p>
            <h2 className="mt-2 font-display text-[2rem] text-foreground sm:text-4xl">In fünf Schritten</h2>
            <ol className="mt-6 grid gap-2 md:grid-cols-5">
              {STEPS.map((step, index) => (
                <li key={step} className="well flex flex-col gap-4 rounded-[var(--radius)] p-5">
                  <span className="font-dot text-2xl leading-none text-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="leading-relaxed text-foreground">{step}</span>
                </li>
              ))}
            </ol>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Die Karte erscheint zum ersten Mal 5 Sekunden nach dem Laden. In Streamlabs
              geht es genauso, dort heißt die Quelle &bdquo;Browser-Quelle&ldquo;.
            </p>
          </div>

          <div className="surface-card rounded-[var(--radius)] p-6 sm:p-10 lg:col-span-8">
            <p className="font-meta text-muted">anpassen</p>
            <h2 className="mt-2 font-display text-[2rem] text-foreground sm:text-4xl">Einstellungen</h2>
            <p className="mt-3 max-w-2xl leading-relaxed text-muted">
              Öffne &bdquo;voltfm-overlay.html&ldquo; mit einem Texteditor. Ganz oben stehen die
              Einstellungen. Speichern, dann in OBS bei der Quelle auf &bdquo;Aktualisieren&ldquo;
              klicken.
            </p>
            <dl className="mt-6 grid gap-2 sm:grid-cols-2">
              {SETTINGS.map((setting) => (
                <div key={setting.name} className="well flex min-w-0 flex-col gap-1 rounded-[var(--radius)] px-4 py-3">
                  <dt className="flex flex-wrap items-baseline gap-2">
                    <code className="font-mono text-sm font-semibold text-foreground">{setting.name}</code>
                    <span className="rounded-[3px] bg-default px-2 py-0.5 font-mono text-[0.7rem] lowercase text-muted">
                      {setting.value}
                    </span>
                  </dt>
                  <dd className="text-sm leading-relaxed text-muted">{setting.text}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Einzelne Werte lassen sich auch an die Adresse hängen, etwa{" "}
              <code className="font-mono text-foreground break-all">?ecke=unten-rechts&amp;alleMinuten=3</code>.
            </p>
          </div>

          <div className="flex flex-col gap-2 lg:col-span-4">
            <div className="key flex flex-1 flex-col items-start gap-4 rounded-[var(--radius)] bg-volt p-6 text-graphite active:translate-y-0 sm:p-8">
              <p className="font-mono text-xs lowercase text-graphite/70">download</p>
              <h2 className="font-display text-[2rem] sm:text-4xl">Das Paket</h2>
              <p className="leading-relaxed">
                Eine ZIP-Datei mit der Overlay-Datei, einer Anleitung und dem Vorschauvideo.
              </p>
              <a
                href={DOWNLOAD}
                download
                className="key mt-auto inline-flex items-center gap-2 rounded-[var(--radius)] bg-graphite px-5 py-3 font-semibold text-display-foreground"
              >
                <Icon icon={DownloadIcon} />
                voltfm-overlay.zip
              </a>
            </div>
            <div className="surface-card flex flex-col items-start gap-4 rounded-[var(--radius)] p-6 sm:p-8">
              <p className="font-meta text-muted">hilfe</p>
              <p className="leading-relaxed text-muted">
                Hängt etwas? Öffne ein Ticket im Discord ({site.supportChannelHint}).
              </p>
              <ButtonLink href={site.discordUrl} external variant="secondary" size="sm">
                <Icon icon={DiscordIcon} />
                Zum Discord
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
