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
 * Der Hinweis, bevor es zum Stream geht.
 *
 * Zwei Faelle, gleiche Aufmachung:
 *
 *   "redirect" — der Regelfall. Die Wiedergabe findet im Webplayer von
 *     lautstation.de statt (Stream von laut.fm), der
 *     Klick fuehrt also von VoltFM weg. Das sagen wir vorher, zusammen mit dem,
 *     was laut.fm dabei erfaehrt. Wer nicht jedes Mal gefragt werden will,
 *     haekelt es ab.
 *   "embed" — nur relevant, falls der Stream irgendwann auf der eigenen Seite
 *     laeuft. Dann ist es eine echte Einwilligung nach Art. 6 Abs. 1 lit. a
 *     DSGVO, die vor der ersten Verbindung eingeholt werden muss.
 */
export function StreamConsentDialog({
  open,
  mode = "embed",
  remember,
  onRememberChange,
  onAccept,
  onDecline,
}: {
  open: boolean;
  mode?: "embed" | "redirect";
  remember?: boolean;
  onRememberChange?: (next: boolean) => void;
  onAccept: () => void;
  onDecline: () => void;
}) {
  const isRedirect = mode === "redirect";

  return (
    <AlertDialog open={open} onOpenChange={(next) => !next && onDecline()}>
      <AlertDialogContent showCloseButton={false} className={styles.popup}>
        <div className={styles.head}>
          <span className={styles.icon} aria-hidden="true">
            <Icon icon={isRedirect ? ExternalLinkIcon : RadioIcon} />
          </span>
          <AlertDialogTitle>
            {isRedirect ? "Weiter zum Webplayer" : `Livestream von ${radio.providerName} laden?`}
          </AlertDialogTitle>
        </div>

        <AlertDialogDescription>
          {isRedirect ? (
            <>
              Gehört wird im Webplayer von {radio.externalName}, einem privaten
              Verzeichnis für laut.fm-Stationen. Mit einem Klick auf
              &bdquo;Weiterhören&ldquo; verlässt du VoltFM, und der Player öffnet
              sich dort in einem neuen Fenster. Der Stream selbst kommt von{" "}
              {radio.providerName}.
            </>
          ) : (
            <>
              Der Stream kommt nicht von uns, sondern von {radio.providerName}. Mit
              deiner Zustimmung verbindet sich dein Browser direkt dorthin und
              überträgt dabei deine IP-Adresse und Browserkennung an diesen Anbieter.
            </>
          )}
        </AlertDialogDescription>

        <ul className={styles.facts}>
          {isRedirect ? (
            <>
              <li>
                Ab dem Klick erfahren {radio.externalName} und {radio.providerName}{" "}
                deine IP-Adresse und Browserkennung — ohne die ist keine Verbindung
                möglich.
              </li>
              <li>Von welcher Seite du kommst, erfahren sie nicht.</li>
              <li>Solange du hier bleibst, wird nichts dorthin übertragen.</li>
            </>
          ) : (
            <>
              <li>Ohne Zustimmung wird nichts an {radio.providerName} gesendet.</li>
              <li>Titel- und Sendungsinfos holt unser Server — dafür gibst du nichts frei.</li>
              <li>Du kannst die Zustimmung jederzeit im Player zurücknehmen.</li>
            </>
          )}
        </ul>

        <p className={styles.links}>
          <Link href="/datenschutz">Unsere Datenschutzerklärung</Link>
          {isRedirect && (
            <a href={radio.externalPrivacyUrl} target="_blank" rel="noreferrer noopener">
              Datenschutz bei {radio.externalName}
              <Icon icon={ExternalLinkIcon} />
            </a>
          )}
          <a href={radio.providerPrivacyUrl} target="_blank" rel="noreferrer noopener">
            Datenschutz bei {radio.providerName}
            <Icon icon={ExternalLinkIcon} />
          </a>
        </p>

        {isRedirect && onRememberChange && (
          <label className={styles.remember}>
            <input
              type="checkbox"
              checked={Boolean(remember)}
              onChange={(event) => onRememberChange(event.target.checked)}
            />
            <span>Nicht mehr fragen</span>
          </label>
        )}

        <div className={styles.actions}>
          <Button variant="neutral" mode="stroke" onClick={onDecline}>
            Abbrechen
          </Button>
          <Button variant="primary" mode="filled" onClick={onAccept}>
            <Icon icon={PlayIcon} />
            {isRedirect ? "Weiterhören" : "Zustimmen und abspielen"}
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
