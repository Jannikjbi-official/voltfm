"use client";

import Link from "next/link";
import { AlertDialog, Button } from "@heroui/react";
import { CheckboxField } from "@/components/common/form-field";
import { Icon, PlayIcon, RadioIcon, ExternalLinkIcon } from "@/lib/icons";
import { radio } from "@/lib/site";

/**
 * Der Hinweis, bevor es zum Stream geht — ein HeroUI-AlertDialog.
 *
 *   "redirect" — der Regelfall. Gehoert wird im Webplayer von lautstation.de
 *     (Stream von laut.fm), der Klick fuehrt also von VoltFM weg. Das sagen
 *     wir vorher, zusammen mit dem, was die Anbieter dabei erfahren. Wer nicht
 *     jedes Mal gefragt werden will, haekelt es ab.
 *   "embed" — nur, falls der Stream irgendwann auf der eigenen Seite laeuft.
 *     Dann ist es eine echte Einwilligung nach Art. 6 Abs. 1 lit. a DSGVO, die
 *     vor der ersten Verbindung eingeholt werden muss.
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
    <AlertDialog.Backdrop isOpen={open} onOpenChange={(next) => !next && onDecline()}>
      <AlertDialog.Container>
        <AlertDialog.Dialog className="sm:max-w-[30rem]">
          <AlertDialog.Header>
            <AlertDialog.Icon status="accent">
              <Icon icon={isRedirect ? ExternalLinkIcon : RadioIcon} />
            </AlertDialog.Icon>
            <AlertDialog.Heading className="font-wide">
              {isRedirect ? "Weiter zum Webplayer" : `Livestream von ${radio.providerName} laden?`}
            </AlertDialog.Heading>
          </AlertDialog.Header>

          <AlertDialog.Body className="flex flex-col gap-4 text-sm leading-relaxed">
            <p>
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
            </p>

            <ul className="flex list-disc flex-col gap-1.5 pl-5 text-muted">
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

            <p className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
              <Link href="/datenschutz" className="rounded-sm underline underline-offset-4">
                Unsere Datenschutzerklärung
              </Link>
              {isRedirect && (
                <a
                  href={radio.externalPrivacyUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1 rounded-sm underline underline-offset-4"
                >
                  Datenschutz bei {radio.externalName}
                  <Icon icon={ExternalLinkIcon} className="text-[0.7em]" />
                </a>
              )}
              <a
                href={radio.providerPrivacyUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1 rounded-sm underline underline-offset-4"
              >
                Datenschutz bei {radio.providerName}
                <Icon icon={ExternalLinkIcon} className="text-[0.7em]" />
              </a>
            </p>

            {isRedirect && onRememberChange && (
              <CheckboxField
                label="Nicht mehr fragen"
                checked={Boolean(remember)}
                onChange={(event) => onRememberChange(event.target.checked)}
              />
            )}
          </AlertDialog.Body>

          <AlertDialog.Footer>
            <Button variant="tertiary" onPress={onDecline}>
              Abbrechen
            </Button>
            <Button variant="primary" onPress={onAccept}>
              <Icon icon={PlayIcon} />
              {isRedirect ? "Weiterhören" : "Zustimmen und abspielen"}
            </Button>
          </AlertDialog.Footer>
        </AlertDialog.Dialog>
      </AlertDialog.Container>
    </AlertDialog.Backdrop>
  );
}
