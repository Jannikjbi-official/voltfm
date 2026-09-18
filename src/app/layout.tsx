import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Public_Sans, Source_Serif_4 } from "next/font/google";
import "./globals.css";

import { cookies } from "next/headers";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { THEME_COOKIE, normalizeTheme } from "@/lib/theme";
import { Toaster } from "@/components/common/toaster";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { RadioPlayerProvider } from "@/components/radio/player-provider";
import { StickyPlayer } from "@/components/radio/sticky-player";
import { getRadioSnapshot } from "@/services/radio";
import { getStreamUrl } from "@/services/radio/stream";
import { site } from "@/lib/site";

/* Editorial display face — carries headlines and the wordmark. */
const display = Bricolage_Grotesque({
  variable: "--font-display-voltfm",
  subsets: ["latin"],
  display: "swap",
});

/* UI face — navigation, metadata, forms. */
const sans = Public_Sans({
  variable: "--font-sans-voltfm",
  subsets: ["latin"],
  display: "swap",
});

/* Reading face — long-form article body copy only. */
const serif = Source_Serif_4({
  variable: "--font-serif-voltfm",
  subsets: ["latin"],
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
  const [snapshot, cookieStore] = await Promise.all([getRadioSnapshot(), cookies()]);
  const theme = normalizeTheme(cookieStore.get(THEME_COOKIE)?.value);

  return (
    <html
      lang={site.lang}
      data-theme={theme}
      style={{ colorScheme: theme }}
      className={`${display.variable} ${sans.variable} ${serif.variable}`}
    >
      <body style={{ "--player-offset": "var(--player-height)" } as React.CSSProperties}>
        <ThemeProvider initialTheme={theme}>
          <RadioPlayerProvider streamUrl={getStreamUrl()} initialSnapshot={snapshot}>
              <a href="#main" className="skip-link">
                Zum Inhalt springen
              </a>
              <Header />
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
