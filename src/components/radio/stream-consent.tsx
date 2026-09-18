"use client";

import Link from "next/link";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Icon, PlayIcon, RadioIcon, ExternalLinkIcon } from "@/lib/icons";
import { radio } from "@/lib/site";
import styles from "./stream-consent.module.css";

/**
 * Consent gate for the livestream.
 *
 * Playing the stream opens a direct connection from the listener's browser to
 * an external provider and hands it their IP address, so it needs consent
 * (Art. 6 Abs. 1 lit. a DSGVO) before the first connection — not after. The
 * answer is stored in localStorage; declining simply leaves the stream off.
 */
export function StreamConsentDialog({
  open,
  onAccept,
  onDecline,
}: {
  open: boolean;
  onAccept: () => void;
  onDecline: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={(next) => !next && onDecline()}>
      <AlertDialogContent showCloseButton={false} className={styles.popup}>
        <div className={styles.head}>
          <span className={styles.icon} aria-hidden="true">
            <Icon icon={RadioIcon} />
          </span>
          <AlertDialogTitle>Livestream von {radio.providerName} laden?</AlertDialogTitle>
        </div>

        <AlertDialogDescription>
          Der Stream kommt nicht von uns, sondern von {radio.providerName}. Mit deiner
          Zustimmung verbindet sich dein Browser direkt dorthin und überträgt dabei
          deine IP-Adresse und Browserkennung an diesen Anbieter.
        </AlertDialogDescription>

        <ul className={styles.facts}>
          <li>Ohne Zustimmung wird nichts an {radio.providerName} gesendet.</li>
          <li>Titel- und Sendungsinfos holt unser Server — dafür gibst du nichts frei.</li>
          <li>Du kannst die Zustimmung jederzeit im Player zurücknehmen.</li>
        </ul>

        <p className={styles.links}>
          <Link href="/datenschutz">Unsere Datenschutzerklärung</Link>
          <a href={radio.providerPrivacyUrl} target="_blank" rel="noreferrer noopener">
            Datenschutz bei {radio.providerName}
            <Icon icon={ExternalLinkIcon} />
          </a>
        </p>

        <div className={styles.actions}>
          <Button variant="neutral" mode="stroke" onClick={onDecline}>
            Nicht abspielen
          </Button>
          <Button variant="primary" mode="filled" onClick={onAccept}>
            <Icon icon={PlayIcon} />
            Zustimmen und abspielen
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
