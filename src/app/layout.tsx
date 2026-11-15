import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

import { cookies } from "next/headers";
import { after } from "next/server";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { THEME_COOKIE, normalizeTheme } from "@/lib/theme";
import { Providers } from "@/components/layout/providers";
import { SiteChrome } from "@/components/layout/site-chrome";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { RadioPlayerProvider } from "@/components/radio/player-provider";
import { StickyPlayer } from "@/components/radio/sticky-player";
import { getRadioSnapshot } from "@/services/radio";
import { getAccountAvatar } from "@/services/content/account";
import { getStreamUrl } from "@/services/radio/stream";
import { announceDueArticles } from "@/services/discord/news";
import { buildMainNav, site } from "@/lib/site";

/* Zwei Schriften, beide von next/font beim Build abgelegt und von der eigenen
   Domain ausgeliefert — der Browser fragt Google nicht.
   Archivo variabel mit Breitenachse: Ueberschriften schmal und schwer wie auf
   einem Plakat (wdth 75), Fliesstext normal. IBM Plex Mono fuer Uhrzeiten,
   Daten und Zahlen. */
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin", "latin-ext"],
  axes: ["wdth"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: site.locale,
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    url: site.url,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  // Papier — die Farbe der Kopfzeile im Standard (hell).
  themeColor: "#f5f5f0",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Both resolved on the server: the radio snapshot so the first paint already
  // shows what is on air, and the theme so the correct colours are in the HTML
  // itself — no inline script, no flash, no hydration mismatch.
  const [snapshot, cookieStore, account] = await Promise.all([
    getRadioSnapshot(),
    cookies(),
    /* Das Kontobild kommt vom Server: Bei einer Anmeldung per Benutzername ist
       `user.image` leer, das Bild liegt dann am Moderatorenprofil. Der
       Client-Baustein kann das nicht nachschlagen. */
    getAccountAvatar(),
  ]);
  const theme = normalizeTheme(cookieStore.get(THEME_COOKIE)?.value);

  /* Neue Beitraege im Discord ankuendigen — nach der Antwort, und hoechstens
     einmal pro Minute. So gehen auch Beitraege mit spaeterem Datum raus,
     sobald sie live sind, ohne dass es dafuer einen Cronjob braucht. */
  after(() => announceDueArticles());

  return (
    /* HeroUI liest beides: die Klasse und data-theme. Beides kommt aus dem
       Cookie, also stimmt schon das erste HTML — ohne Skript, ohne Flackern. */
    <html lang={site.lang} data-theme={theme} className={`${archivo.variable} ${plexMono.variable} ${theme}`}>
      <body className="bg-background text-foreground">
        <ThemeProvider initialTheme={theme}>
          <Providers>
            <RadioPlayerProvider streamUrl={getStreamUrl()} initialSnapshot={snapshot}>
              {/* Im Admin ohne Kopfzeile, Footer und Player — siehe SiteChrome. */}
              <SiteChrome
                header={<Header nav={buildMainNav()} account={account} />}
                footer={<Footer />}
                player={<StickyPlayer />}
              >
                {children}
              </SiteChrome>
            </RadioPlayerProvider>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
