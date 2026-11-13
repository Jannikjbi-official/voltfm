import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";

import { cookies } from "next/headers";
import { after } from "next/server";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { THEME_COOKIE, normalizeTheme } from "@/lib/theme";
import { Toaster } from "@/components/common/toaster";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { RadioPlayerProvider } from "@/components/radio/player-provider";
import { StickyPlayer } from "@/components/radio/sticky-player";
import { getRadioSnapshot } from "@/services/radio";
import { getAccountAvatar } from "@/services/content/account";
import { getStreamUrl } from "@/services/radio/stream";
import { announceDueArticles } from "@/services/discord/news";
import { buildMainNav, site } from "@/lib/site";

/* Die eine Schrift fuer alles. Variabel geladen, mit der Breitenachse dazu:
   Ueberschriften laufen breit (wdth 112,5 bis 125), Fliesstext normal. next/font
   legt die Datei beim Build ab und liefert sie von der eigenen Domain aus — der
   Browser fragt Google nicht. */
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin", "latin-ext"],
  axes: ["wdth"],
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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#456990" },
    { media: "(prefers-color-scheme: dark)", color: "#15181c" },
  ],
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
    <html
      lang={site.lang}
      data-theme={theme}
      style={{ colorScheme: theme }}
      className={archivo.variable}
    >
      <body>
        <ThemeProvider initialTheme={theme}>
          <RadioPlayerProvider streamUrl={getStreamUrl()} initialSnapshot={snapshot}>
              <a href="#main" className="skip-link">
                Zum Inhalt springen
              </a>
              <Header nav={buildMainNav()} account={account} />
              <main id="main">{children}</main>
              <Footer />
              <StickyPlayer />
              <Toaster />
            </RadioPlayerProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
