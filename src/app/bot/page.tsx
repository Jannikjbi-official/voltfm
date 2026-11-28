import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/common/page-header";
import { ButtonLink } from "@/components/common/button-link";
import { Icon, DiscordIcon, ExternalLinkIcon } from "@/lib/icons";
import { radioBot, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Discord-Bot",
  description: "VoltFM Radio für deinen Discord-Server: Livestream im Sprachkanal, Song-Ansagen, 24/7-Modus und mehr.",
  alternates: { canonical: "/bot" },
};

const BEFEHLE = [
  ["/radio play", "VoltFM in deinem Sprachkanal abspielen, auch in Stage-Kanälen"],
  ["/radio stop", "Radio stoppen"],
  ["/radio jetzt", "Laufender Song mit Cover, Hörerzahl und den letzten Titeln"],
  ["/radio verlauf", "Die letzten 10 Songs"],
  ["/radio sendung", "Welche Sendung läuft, was kommt danach"],
  ["/radio wunsch", "Dir einen Song wünschen"],
  ["/einstellungen", "24/7-Modus, Song-Ansagen, DJ-Rolle, Kanalstatus (mit „Server verwalten“)"],
] as const;

export default function BotPage() {
  return (
    <>
      <PageHeader
        title="VoltFM auf deinem Discord-Server"
        description="Der Bot „VoltFM Radio“ spielt unseren Livestream in deinem Sprachkanal. Kostenlos, ohne Werbung, in einer Minute eingerichtet."
        breadcrumbs={[
          { href: "/", label: "Start" },
          { href: "/bot", label: "Discord-Bot" },
        ]}
        size="large"
      />

      <section className="shell pt-2">
        <div className="grid gap-2 lg:grid-cols-12">
          <div className="display-panel display-dots flex flex-col items-start gap-6 rounded-[var(--radius)] p-6 sm:p-10 lg:col-span-5">
            <p className="flex items-center gap-2 font-meta text-display-muted">
              <span className="led" aria-hidden="true" />
              discord / bot
            </p>
            <h2 className="font-display text-[2rem] text-balance text-display-foreground sm:text-4xl">So geht&apos;s</h2>
            <ol className="flex w-full flex-col gap-2">
              {["Bot einladen und deinen Server auswählen.", "In einen Sprachkanal gehen.", "/radio play tippen – fertig."].map((step, index) => (
                <li key={step} className="flex gap-4 rounded-[3px] border border-white/10 p-4">
                  <span className="font-dot text-xl leading-none text-volt">{String(index + 1).padStart(2, "0")}</span>
                  <span className="leading-relaxed text-display-foreground">{step}</span>
                </li>
              ))}
            </ol>
            <ButtonLink href={radioBot.inviteUrl} external variant="primary" size="lg">
              <Icon icon={DiscordIcon} />
              Bot einladen
              <Icon icon={ExternalLinkIcon} />
            </ButtonLink>
          </div>

          <div className="surface-card flex flex-col gap-5 rounded-[var(--radius)] p-6 sm:p-10 lg:col-span-7">
            <p className="font-meta text-muted">befehle</p>
            <ul className="well flex flex-col gap-1 rounded-[var(--radius)] p-1.5">
              {BEFEHLE.map(([befehl, text]) => (
                <li key={befehl} className="grid gap-1 rounded-[3px] bg-surface p-3 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-4">
                  <code className="font-mono text-sm font-semibold text-foreground">{befehl}</code>
                  <span className="text-sm leading-relaxed text-muted">{text}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm leading-relaxed text-muted">
              Der Bot liest keine Nachrichten mit und hört nicht zu. Mehr dazu in der{" "}
              <Link href="/bot/datenschutz" className="font-semibold text-foreground underline underline-offset-4">Datenschutzerklärung des Bots</Link>{" "}
              und den{" "}
              <Link href="/bot/nutzungsbedingungen" className="font-semibold text-foreground underline underline-offset-4">Nutzungsbedingungen</Link>.
              Fragen?{" "}
              <a href={site.discordUrl} target="_blank" rel="noreferrer noopener" className="font-semibold text-foreground underline underline-offset-4">
                Schreib uns im Discord
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
