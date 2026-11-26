"use client";

import { useState } from "react";
import { Button } from "@heroui/react";
import { Icon, ShareIcon, CopyIcon, CheckIcon } from "@/lib/icons";

/**
 * Teilen-Zeile unter einem Artikel.
 *
 * Nimmt das Teilen-Menue des Geraets, wo der Browser eines anbietet (das
 * erwartet man am Handy), und kopiert sonst den Link. Keine fremden
 * Teilen-Knoepfe, also keine Tracking-Skripte.
 */
export function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Zwischenablage gesperrt — die Adresse steht ohnehin oben im Browser.
    }
  }

  async function handleShare() {
    if (typeof navigator.share !== "function") {
      await handleCopy();
      return;
    }
    try {
      await navigator.share({ title, url });
    } catch {
      // Menue geschlossen, nichts zu melden.
    }
  }

  return (
    /* relative: die sr-only-Meldung bleibt in der Karte und kann am Handy
       die Seite nicht verbreitern. */
    <div className="surface-card relative rounded-[var(--radius)] p-4">
      <h2 className="font-meta text-muted">Artikel teilen</h2>
      <div className="well mt-3 grid grid-cols-2 gap-2 rounded-[var(--radius)] p-2 lg:grid-cols-1">
        <Button variant="primary" size="sm" fullWidth onPress={handleShare}>
          <Icon icon={ShareIcon} />
          Teilen
        </Button>
        <Button variant="secondary" size="sm" fullWidth onPress={handleCopy}>
          <Icon icon={copied ? CheckIcon : CopyIcon} />
          {copied ? "Link kopiert" : "Link kopieren"}
        </Button>
      </div>
      <span className="sr-only" role="status" aria-live="polite">
        {copied ? "Link kopiert" : ""}
      </span>
    </div>
  );
}
