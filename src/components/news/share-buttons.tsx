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
    <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-separator pt-6">
      <span className="font-wide text-sm font-semibold text-foreground">Artikel teilen</span>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onPress={handleShare}>
          <Icon icon={ShareIcon} />
          Teilen
        </Button>
        <Button variant="ghost" size="sm" onPress={handleCopy}>
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
