# VoltFM – Videos (Remotion)

Instagram-Reels für VoltFM, gebaut mit [Remotion](https://www.remotion.dev)
(React + TypeScript). Der Ordner ist ein eigenes Projekt mit eigenem
`package.json` und hat mit der Website nichts zu tun – `next build` und die
Prüfungen der Website lassen ihn aus.

## Weihnachts-Reel

| | |
| --- | --- |
| Format | 1080 × 1920, 30 fps, 12 Sekunden, H.264 + AAC |
| Fertiges Video | `out/voltfm-weihnachten.mp4` |
| Ohne Musik | `out/voltfm-weihnachten-ohne-musik.mp4` |
| Quelltext | `src/WeihnachtsReel.tsx` |
| Schrift | Archivo (Google Fonts, OFL) – dieselbe wie auf voltfm.xyz |
| Musik | Severin & Like Lions – „I Hear Sleigh Bells" (NCS) |

Ablauf: 0–2 s „Ab heute", 2–5 s „WEIHNACHTEN AUF VOLTFM" Wort für Wort,
5–8 s Zähler bis „200+", 8–10 s „Von Mariah Carey bis Rolf Zuckowski",
10–12 s „Jetzt reinhören" + voltfm.xyz. Der Bass-Drop des Songs liegt genau
auf der 2-Sekunden-Marke, die Wörter des Titels erscheinen im Takt (150 BPM).

## Rendern

Voraussetzung: [Node.js](https://nodejs.org) 18 oder neuer.

```bash
cd video
npm install
npm run render
```

Danach liegt das Video in `out/voltfm-weihnachten.mp4`.

- `npm run render` lädt beim ersten Mal den Song nach `public/musik/` und
  Remotion lädt einmalig einen Chrome Headless Shell (ca. 100 MB) herunter.
- `npm run render:ohne-musik` rendert dieselbe Fassung ohne Ton.
- `npm run studio` öffnet die Vorschau im Browser (<http://localhost:3000>),
  dort kannst du durch die Zeitleiste scrubben und auch rendern.

## Texte, Farben, Musik ändern

Alles steht oben in `src/WeihnachtsReel.tsx`:

- `TEXTE` – alle Texte. Bei `intro`, `titel` und `aufruf` bekommt jedes Wort
  eine eigene Zeile. Die Schriftgröße rechnet sich selbst aus, ein längeres
  Wort ragt also nie aus dem Bild.
- `FARBEN` – Hintergrund, Schrift, Akzent (Rot-Orange), Schneeflocken.
- `SCHRIFT` – Stärke und Breite der Archivo (Breite 62 = sehr schmal, 100 = normal).
- `MUSIK` – Datei, Startpunkt im Song, Lautstärke, Ausblenden am Ende.
- `ZEITPLAN` – wann welche Szene läuft (in Sekunden).
- `SCHNEE` – Anzahl, Tempo, Größe und Deckkraft der Flocken.

Danach `npm run render` – fertig.

## Musik und Rechte – bitte lesen

Der Song kommt von NoCopyrightSounds: <https://ncs.io/IHearSleighBells>.

- **Nennung** in der Beschreibung des Posts:

  ```
  Song: Severin & Like Lions - I Hear Sleigh Bells [NCS Release]
  Music provided by NoCopyrightSounds
  Free Download/Stream: https://ncs.io/IHearSleighBells
  ```

- **Lizenz:** Laut [NCS-Nutzungsbedingungen](https://ncs.io/usage-policy) ist
  die Musik kostenlos für unabhängige Creator. „Content made to promote a
  product, service or brand" braucht dagegen eine Lizenz – und ein Reel, das
  für einen Sender wirbt, fällt sehr wahrscheinlich darunter. Vor dem
  Veröffentlichen also über <https://ncs.io/licensing> anfragen, oder die
  stumme Fassung hochladen und in Instagram einen Sound aus der Bibliothek
  wählen.
- Die MP3 liegt **nicht** im Repo (`.gitignore`): NCS erlaubt nicht, die reine
  Audiodatei weiterzugeben. `npm run musik` lädt sie bei Bedarf neu.

## Hinweise

- Remotion ist für Einzelpersonen und Teams bis drei Personen kostenlos
  (<https://www.remotion.dev/license>).
- Instagram legt unten Beschriftung und Knöpfe über das Video. Deshalb sitzt
  der Inhalt leicht oberhalb der Mitte, der untere Bereich bleibt frei.
