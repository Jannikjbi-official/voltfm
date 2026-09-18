"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Icon, ShareIcon, CopyIcon, CheckIcon } from "@/lib/icons";
import styles from "./share-buttons.module.css";

/**
 * Share row for an article.
 *
 * Prefers the native share sheet where the browser offers one (that is what
 * people expect on a phone), and falls back to copying the link everywhere
 * else. No third-party share widgets, so no tracking scripts.
 */
export function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked — the URL is in the address bar anyway.
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
      // The user dismissed the sheet; nothing to report.
    }
  }

  return (
    <div className={styles.share}>
      <span className={styles.label}>Artikel teilen</span>
      <div className={styles.actions}>
        <Button variant="neutral" mode="stroke" size="sm" onClick={handleShare}>
          <Icon icon={ShareIcon} />
          Teilen
        </Button>
        <Button variant="neutral" mode="ghost" size="sm" onClick={handleCopy}>
          <Icon icon={copied ? CheckIcon : CopyIcon} />
          {copied ? "Link kopiert" : "Link kopieren"}
        </Button>
      </div>
    </div>
  );
}
