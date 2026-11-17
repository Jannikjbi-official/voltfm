// Laedt den NCS-Track fuer das Weihnachts-Reel nach public/musik/, falls er
// noch nicht da ist. Die Datei liegt bewusst nicht im Repo: NCS erlaubt nicht,
// die reine Audiodatei weiterzugeben.
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ziel = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "musik", "i-hear-sleigh-bells.mp3");
const quelle = "https://audio.ncs.io/ihearsleighbells/original-e4812817.mp3";
const seite = "https://ncs.io/IHearSleighBells";

if (existsSync(ziel)) {
  console.log("Musik ist schon da:", ziel);
  process.exit(0);
}

console.log("Lade „I Hear Sleigh Bells“ (Severin & Like Lions, NCS) …");
try {
  const antwort = await fetch(quelle);
  if (!antwort.ok) throw new Error(`HTTP ${antwort.status}`);
  mkdirSync(dirname(ziel), { recursive: true });
  writeFileSync(ziel, Buffer.from(await antwort.arrayBuffer()));
  console.log("Gespeichert:", ziel);
} catch (fehler) {
  console.error(`\nDownload fehlgeschlagen (${fehler.message}).`);
  console.error(`Lade den Song von Hand auf ${seite} herunter („Free download“)`);
  console.error(`und speichere ihn als:\n  ${ziel}\n`);
  process.exit(1);
}
