/**
 * VoltFM – Instagram-Reel „Weihnachten auf VoltFM"
 * 1080 × 1920, 30 fps, 12 Sekunden.
 *
 * Alles, was du ändern willst, steht in den Konstanten hier oben:
 * TEXTE, FARBEN, SCHRIFT, MUSIK, ZEITPLAN und SCHNEE. Darunter kommt nur noch
 * die Animation selbst.
 *
 * Textgrößen rechnen sich selbst aus: Wird ein Wort länger, wird es kleiner,
 * damit es nie aus dem Bild ragt.
 */
import archivoUrl from "@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2";
import React, { useEffect, useMemo, useState } from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Sequence,
  cancelRender,
  continueRender,
  delayRender,
  interpolate,
  random,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

/* ────────────────────────────────────────────────────────────────────────── */
/*  TEXTE                                                                     */
/* ────────────────────────────────────────────────────────────────────────── */

export const TEXTE = {
  /** Klein in der Ecke oben links und oben rechts – die ganze Zeit sichtbar. */
  eckeLinks: "VOLTFM",
  eckeRechts: "WEIHNACHTEN",

  /** Szene 1 – jedes Wort bekommt eine eigene Zeile. */
  intro: "Ab heute",

  /** Szene 2 – erscheint Wort für Wort, das letzte Wort in der Akzentfarbe. */
  titel: "WEIHNACHTEN AUF VOLTFM",

  /** Szene 3 – bis zu dieser Zahl wird hochgezählt. */
  zahl: 200,
  zahlZusatz: "+",
  zahlUnterzeile: "Weihnachtssongs",

  /** Szene 4 – „Von … bis …". */
  vonWort: "Von",
  vonName: "Mariah Carey",
  bisWort: "bis",
  bisName: "Rolf Zuckowski",

  /** Szene 5 – Abschluss. Jedes Wort von `aufruf` bekommt eine eigene Zeile. */
  aufruf: "Jetzt reinhören",
  adresse: "voltfm.xyz",
};

/* ────────────────────────────────────────────────────────────────────────── */
/*  FARBEN                                                                    */
/* ────────────────────────────────────────────────────────────────────────── */

export const FARBEN = {
  /** Cremeweißer Hintergrund */
  hintergrund: "#F7F2E8",
  /** Schrift – die Tinte von voltfm.xyz */
  schrift: "#0E0F12",
  /** Akzent: Rot-Orange */
  akzent: "#F2481B",
  /** Schrift auf der Akzentfläche (die Pille mit der Adresse) */
  aufAkzent: "#F7F2E8",
  /** Schneeflocken – kühles Grau, damit sie auf Creme sichtbar bleiben */
  schnee: "#9FAAB6",
};

/* ────────────────────────────────────────────────────────────────────────── */
/*  SCHRIFT                                                                   */
/* ────────────────────────────────────────────────────────────────────────── */

export const SCHRIFT = {
  /**
   * Archivo – dieselbe Google-Schrift wie auf voltfm.xyz. Variabel in Stärke
   * und Breite, kommt aus dem npm-Paket @fontsource-variable/archivo, also
   * ohne Abruf bei Google während des Renderns.
   */
  familie: "VoltFM Archivo",
  /** 100 (dünn) bis 900 (sehr fett) */
  gewicht: 900,
  /** Breite in Prozent: 62 = sehr schmal, 75 = Überschriften der Website, 100 = normal */
  breite: 70,
  /** Buchstabenabstand in em – leicht negativ wirkt kompakter */
  laufweite: -0.01,
};

/* ────────────────────────────────────────────────────────────────────────── */
/*  MUSIK                                                                     */
/* ────────────────────────────────────────────────────────────────────────── */

export const MUSIK = {
  /** Liegt in public/musik/ – `npm run musik` lädt die Datei herunter. */
  datei: "musik/i-hear-sleigh-bells.mp3",
  /**
   * Ab dieser Stelle im Song (Sekunden) startet die Musik. Bei 52,775 s
   * setzt der Bass-Drop ein – mit 50,775 trifft er genau die 2-Sekunden-Marke,
   * an der „WEIHNACHTEN AUF VOLTFM" erscheint.
   */
  startSekunde: 50.775,
  /** 0 bis 1. Der Song ist sehr laut gemastert – 0,7 lässt Luft bis zur Übersteuerung. */
  lautstaerke: 0.7,
  /** So lange wird am Ende ausgeblendet (Sekunden). */
  ausblenden: 1.2,
  /** Für die Beschreibung des Posts (NCS verlangt die Nennung). */
  nennung:
    "Song: Severin & Like Lions - I Hear Sleigh Bells [NCS Release]\n" +
    "Music provided by NoCopyrightSounds\n" +
    "Free Download/Stream: https://ncs.io/IHearSleighBells",
};

/* ────────────────────────────────────────────────────────────────────────── */
/*  ZEITPLAN (Sekunden)                                                       */
/* ────────────────────────────────────────────────────────────────────────── */

export const VIDEO = {
  breite: 1080,
  hoehe: 1920,
  fps: 30,
  sekunden: 12,
};

export const ZEITPLAN = {
  intro: { von: 0, bis: 2 },
  titel: { von: 2, bis: 5 },
  zahl: { von: 5, bis: 8 },
  namen: { von: 8, bis: 10 },
  aufruf: { von: 10, bis: 12 },
  /** Abstand zwischen den Wörtern des Titels. 0,8 s = zwei Schläge des Songs (150 BPM). */
  wortAbstand: 0.8,
  /** So lange zählt die Zahl hoch. */
  zaehlDauer: 1.7,
};

/* ────────────────────────────────────────────────────────────────────────── */
/*  SCHNEE                                                                    */
/* ────────────────────────────────────────────────────────────────────────── */

export const SCHNEE = {
  anzahl: 46,
  /** Pixel pro Sekunde für die langsamsten / schnellsten Flocken */
  tempoMin: 45,
  tempoMax: 135,
  /** Durchmesser in Pixel */
  groesseMin: 7,
  groesseMax: 34,
  deckkraftMin: 0.28,
  deckkraftMax: 0.7,
};

/* ══════════════════════════════════════════════════════════════════════════ */
/*  Ab hier: Animation                                                        */
/* ══════════════════════════════════════════════════════════════════════════ */

export type ReelProps = {
  /** false rendert eine stumme Fassung, z. B. um in Instagram einen Sound zu wählen. */
  mitMusik: boolean;
};

/** Seitenrand links und rechts */
const RAND = 80;
const INHALT_BREITE = VIDEO.breite - 2 * RAND;

/**
 * Ausblenden jeder Szene: beginnt so viele Frames vor ihrem Ende und ist genau
 * dann fertig, wenn die nächste Szene beginnt – nichts liegt übereinander.
 */
const AUSGANG_DAUER = 12;

const KLAMMERN = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/* ── Schrift laden ───────────────────────────────────────────────────────── */

const useSchrift = (): boolean => {
  const [handle] = useState(() => delayRender("Schrift Archivo laden"));
  const [bereit, setBereit] = useState(false);

  useEffect(() => {
    const schrift = new FontFace(SCHRIFT.familie, `url("${archivoUrl}") format("woff2")`, {
      weight: "100 900",
      stretch: "62% 125%",
    });
    schrift
      .load()
      .then((geladen) => {
        document.fonts.add(geladen);
        setBereit(true);
        continueRender(handle);
      })
      .catch((fehler: unknown) => cancelRender(fehler));
  }, [handle]);

  return bereit;
};

const schriftStil = (groesse: number): React.CSSProperties => ({
  fontFamily: `"${SCHRIFT.familie}", sans-serif`,
  fontWeight: SCHRIFT.gewicht,
  fontStretch: `${SCHRIFT.breite}%`,
  letterSpacing: `${SCHRIFT.laufweite}em`,
  fontSize: groesse,
  lineHeight: 0.88,
  whiteSpace: "pre",
});

/** Misst die Breite eines Textes bei 100 px Schriftgröße. */
const breiteBei100 = (text: string): number => {
  const span = document.createElement("span");
  Object.assign(span.style, schriftStil(100), {
    position: "absolute",
    visibility: "hidden",
    fontSize: "100px",
    fontVariantNumeric: "tabular-nums",
  });
  span.textContent = text;
  document.body.appendChild(span);
  const breite = span.getBoundingClientRect().width;
  span.remove();
  return breite;
};

/** Größte Schriftgröße (bis `max`), bei der jeder Text in `breite` passt. */
const passendeGroesse = (texte: string[], breite: number, max: number): number =>
  Math.floor(Math.min(max, ...texte.map((t) => (breite / breiteBei100(t)) * 100)));

/* ── Bewegungshilfen ─────────────────────────────────────────────────────── */

const sekunden = (s: number, fps: number) => Math.round(s * fps);

/** 0 = Szene voll da, 1 = Szene weg. Weich ein- und auslaufend. */
const ausgang = (frame: number, szenenDauer: number) =>
  interpolate(frame, [szenenDauer - AUSGANG_DAUER, szenenDauer], [0, 1], {
    ...KLAMMERN,
    easing: Easing.inOut(Easing.cubic),
  });

/** Langsames Heranfahren während der Szene – hält das Bild lebendig. */
const heranfahren = (frame: number, szenenDauer: number) =>
  interpolate(frame, [0, szenenDauer], [1, 1.035], KLAMMERN);

/** Gemeinsamer Rahmen jeder Szene: zentriert, etwas oberhalb der Mitte (Instagram-UI unten). */
const Buehne: React.FC<{
  children: React.ReactNode;
  raus?: number;
  zoom?: number;
}> = ({ children, raus = 0, zoom = 1 }) => (
  <AbsoluteFill
    style={{
      alignItems: "center",
      justifyContent: "center",
      paddingBottom: 140,
      opacity: 1 - raus,
      transform: `translateY(${-90 * raus}px) scale(${zoom * (1 - 0.04 * raus)})`,
    }}
  >
    {children}
  </AbsoluteFill>
);

/* ── Schnee ──────────────────────────────────────────────────────────────── */

/** Pfad einer Schneeflocke mit sechs Armen und kleinen Verästelungen. */
const flockenPfad = (r: number): string => {
  const teile: string[] = [];
  for (let k = 0; k < 6; k++) {
    const w = (k * Math.PI) / 3;
    const ax = Math.cos(w);
    const ay = Math.sin(w);
    teile.push(`M0 0L${(ax * r).toFixed(2)} ${(ay * r).toFixed(2)}`);
    const bx = ax * r * 0.58;
    const by = ay * r * 0.58;
    for (const seite of [-1, 1]) {
      const wa = w + seite * 0.75;
      teile.push(
        `M${bx.toFixed(2)} ${by.toFixed(2)}L${(bx + Math.cos(wa) * r * 0.32).toFixed(2)} ${(by + Math.sin(wa) * r * 0.32).toFixed(2)}`,
      );
    }
  }
  return teile.join("");
};

const Schnee: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const ueberstand = 80;

  const flocken = useMemo(
    () =>
      Array.from({ length: SCHNEE.anzahl }, (_, i) => {
        // Tiefe: 0 = weit hinten (klein, langsam, blass), 1 = vorn
        const tiefe = random(`schnee-tiefe-${i}`);
        const groesse = SCHNEE.groesseMin + tiefe * (SCHNEE.groesseMax - SCHNEE.groesseMin);
        return {
          x: random(`schnee-x-${i}`) * width,
          start: random(`schnee-y-${i}`) * (height + 2 * ueberstand),
          groesse,
          tempo: (SCHNEE.tempoMin + tiefe * (SCHNEE.tempoMax - SCHNEE.tempoMin)) / fps,
          schwankung: 12 + random(`schnee-s-${i}`) * 34,
          frequenz: 0.18 + random(`schnee-f-${i}`) * 0.35,
          phase: random(`schnee-p-${i}`) * Math.PI * 2,
          drehung: (random(`schnee-r-${i}`) - 0.5) * 50,
          deckkraft: SCHNEE.deckkraftMin + tiefe * (SCHNEE.deckkraftMax - SCHNEE.deckkraftMin),
          stern: groesse > 15,
          pfad: flockenPfad(groesse / 2),
          strich: Math.max(1.6, groesse / 11),
        };
      }),
    [width, height, fps],
  );

  // Sanft einblenden, damit der erste Frame nicht „voll" startet.
  const einblenden = interpolate(frame, [0, 18], [0, 1], KLAMMERN);

  return (
    <AbsoluteFill style={{ opacity: einblenden }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {flocken.map((f, i) => {
          const t = frame / fps;
          const y = ((f.start + frame * f.tempo) % (height + 2 * ueberstand)) - ueberstand;
          const x = f.x + Math.sin(t * f.frequenz * 2 * Math.PI + f.phase) * f.schwankung;
          return f.stern ? (
            <path
              key={i}
              d={f.pfad}
              transform={`translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${(t * f.drehung).toFixed(2)})`}
              stroke={FARBEN.schnee}
              strokeWidth={f.strich}
              strokeLinecap="round"
              fill="none"
              opacity={f.deckkraft}
            />
          ) : (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={f.groesse / 3.2}
              fill={FARBEN.schnee}
              opacity={f.deckkraft}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

/* ── Ecken oben ──────────────────────────────────────────────────────────── */

const Ecken: React.FC = () => {
  const frame = useCurrentFrame();
  const da = interpolate(frame, [4, 22], [0, 1], { ...KLAMMERN, easing: Easing.out(Easing.cubic) });
  const stil: React.CSSProperties = {
    ...schriftStil(34),
    fontWeight: 800,
    fontStretch: "100%",
    letterSpacing: "0.14em",
    position: "absolute",
    top: 150,
    opacity: da,
    transform: `translateY(${(1 - da) * -16}px)`,
  };
  return (
    <AbsoluteFill>
      <div style={{ ...stil, left: RAND, color: FARBEN.schrift }}>{TEXTE.eckeLinks}</div>
      <div style={{ ...stil, right: RAND, color: FARBEN.akzent }}>{TEXTE.eckeRechts}</div>
    </AbsoluteFill>
  );
};

/* ── Szene 1: „Ab heute" fährt ins Bild ──────────────────────────────────── */

const Intro: React.FC<{ dauer: number }> = ({ dauer }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const zeilen = TEXTE.intro.split(" ");
  const groesse = useMemo(() => passendeGroesse(TEXTE.intro.split(" "), INHALT_BREITE, 340), []);

  const strich = spring({ frame: frame - 14, fps, config: { damping: 20, stiffness: 110 } });

  return (
    <Buehne raus={ausgang(frame, dauer)} zoom={heranfahren(frame, dauer)}>
      {zeilen.map((zeile, i) => {
        const rein = spring({
          frame: frame - i * 5,
          fps,
          config: { damping: 17, stiffness: 95, mass: 0.9 },
        });
        const richtung = i % 2 === 0 ? -1 : 1;
        const letzte = i === zeilen.length - 1;
        return (
          <div
            key={i}
            style={{
              ...schriftStil(groesse),
              color: FARBEN.schrift,
              position: "relative",
              transform: `translateX(${richtung * (1 - rein) * 1150}px)`,
              marginTop: i === 0 ? 0 : groesse * 0.02,
            }}
          >
            {zeile}
            {letzte ? (
              <div
                style={{
                  position: "absolute",
                  left: "2%",
                  right: "2%",
                  bottom: -groesse * 0.12,
                  height: groesse * 0.085,
                  borderRadius: groesse,
                  background: FARBEN.akzent,
                  transform: `scaleX(${strich})`,
                  transformOrigin: richtung < 0 ? "left center" : "right center",
                }}
              />
            ) : null}
          </div>
        );
      })}
    </Buehne>
  );
};

/* ── Szene 2: „WEIHNACHTEN AUF VOLTFM" Wort für Wort ─────────────────────── */

const Titel: React.FC<{ dauer: number }> = ({ dauer }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const woerter = TEXTE.titel.split(" ");
  const abstand = sekunden(ZEITPLAN.wortAbstand, fps);

  const { groesse, groesseLetztes } = useMemo(() => {
    const alle = TEXTE.titel.split(" ");
    const vorne = alle.slice(0, -1);
    return {
      groesse: vorne.length ? passendeGroesse(vorne, INHALT_BREITE, 230) : 230,
      groesseLetztes: passendeGroesse(alle.slice(-1), INHALT_BREITE, 330),
    };
  }, []);

  return (
    <Buehne raus={ausgang(frame, dauer)} zoom={heranfahren(frame, dauer)}>
      {woerter.map((wort, i) => {
        const letztes = i === woerter.length - 1;
        // +1: das Wort ist schon im Frame des Drops zu sehen, nicht einen danach.
        const rein = spring({
          frame: frame - i * abstand + 1,
          fps,
          config: { damping: 13, stiffness: 210, mass: 0.6 },
        });
        const g = letztes ? groesseLetztes : groesse;
        return (
          <div
            key={i}
            style={{
              ...schriftStil(g),
              color: letztes ? FARBEN.akzent : FARBEN.schrift,
              marginTop: i === 0 ? 0 : g * 0.04,
              opacity: interpolate(rein, [0, 0.35], [0, 1], KLAMMERN),
              transform: `translateY(${(1 - rein) * 110}px) scale(${interpolate(rein, [0, 1], [0.8, 1])})`,
            }}
          >
            {wort}
          </div>
        );
      })}
    </Buehne>
  );
};

/* ── Szene 3: Zahl zählt hoch ────────────────────────────────────────────── */

const Zahl: React.FC<{ dauer: number }> = ({ dauer }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const zaehlEnde = sekunden(ZEITPLAN.zaehlDauer, fps);

  const { groesse, ziffernBreite, unterGroesse } = useMemo(() => {
    const ziel = String(TEXTE.zahl);
    const g = passendeGroesse([ziel + TEXTE.zahlZusatz], INHALT_BREITE, 460);
    return {
      groesse: g,
      ziffernBreite: (breiteBei100(ziel) * g) / 100,
      unterGroesse: passendeGroesse([TEXTE.zahlUnterzeile], INHALT_BREITE, 128),
    };
  }, []);

  const rein = spring({ frame, fps, config: { damping: 15, stiffness: 140 } });
  const wert = Math.round(
    interpolate(frame, [2, zaehlEnde], [0, TEXTE.zahl], {
      ...KLAMMERN,
      easing: Easing.out(Easing.cubic),
    }),
  );
  const plus = spring({ frame: frame - zaehlEnde, fps, config: { damping: 10, stiffness: 190, mass: 0.6 } });
  const unter = spring({ frame: frame - 9, fps, config: { damping: 18, stiffness: 120 } });

  return (
    <Buehne raus={ausgang(frame, dauer)} zoom={heranfahren(frame, dauer)}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          opacity: interpolate(rein, [0, 0.4], [0, 1], KLAMMERN),
          transform: `scale(${interpolate(rein, [0, 1], [0.86, 1])})`,
        }}
      >
        <div
          style={{
            ...schriftStil(groesse),
            fontVariantNumeric: "tabular-nums",
            color: FARBEN.schrift,
            width: ziffernBreite,
            textAlign: "right",
          }}
        >
          {wert}
        </div>
        <div
          style={{
            ...schriftStil(groesse),
            color: FARBEN.akzent,
            opacity: interpolate(plus, [0, 0.3], [0, 1], KLAMMERN),
            transform: `scale(${interpolate(plus, [0, 1], [0.3, 1])}) rotate(${(1 - plus) * -90}deg)`,
            transformOrigin: "50% 60%",
          }}
        >
          {TEXTE.zahlZusatz}
        </div>
      </div>
      <div
        style={{
          ...schriftStil(unterGroesse),
          color: FARBEN.schrift,
          marginTop: groesse * 0.08,
          opacity: interpolate(unter, [0, 0.5], [0, 1], KLAMMERN),
          transform: `translateY(${(1 - unter) * 60}px)`,
        }}
      >
        {TEXTE.zahlUnterzeile}
      </div>
    </Buehne>
  );
};

/* ── Szene 4: „Von Mariah Carey bis Rolf Zuckowski" blendet ein ──────────── */

const Namen: React.FC<{ dauer: number }> = ({ dauer }) => {
  const frame = useCurrentFrame();
  const { groesse, kleinGroesse } = useMemo(
    () => ({
      groesse: passendeGroesse([TEXTE.vonName, TEXTE.bisName], INHALT_BREITE, 170),
      kleinGroesse: passendeGroesse([TEXTE.vonWort, TEXTE.bisWort], INHALT_BREITE, 84),
    }),
    [],
  );

  const zeilen = [
    { text: TEXTE.vonWort, klein: true },
    { text: TEXTE.vonName, klein: false },
    { text: TEXTE.bisWort, klein: true },
    { text: TEXTE.bisName, klein: false },
  ];

  return (
    <Buehne raus={ausgang(frame, dauer)} zoom={heranfahren(frame, dauer)}>
      {zeilen.map((z, i) => {
        const da = interpolate(frame, [i * 5, i * 5 + 16], [0, 1], {
          ...KLAMMERN,
          easing: Easing.out(Easing.cubic),
        });
        return (
          <div
            key={i}
            style={{
              ...schriftStil(z.klein ? kleinGroesse : groesse),
              color: z.klein ? FARBEN.akzent : FARBEN.schrift,
              marginTop: i === 0 ? 0 : z.klein ? groesse * 0.18 : groesse * 0.06,
              opacity: da,
              transform: `translateY(${(1 - da) * 40}px)`,
            }}
          >
            {z.text}
          </div>
        );
      })}
    </Buehne>
  );
};

/* ── Szene 5: „Jetzt reinhören" + voltfm.xyz ─────────────────────────────── */

const Aufruf: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const zeilen = TEXTE.aufruf.split(" ");
  const groesse = useMemo(() => passendeGroesse(TEXTE.aufruf.split(" "), INHALT_BREITE, 250), []);
  const pillenSchrift = 76;

  const pille = spring({ frame: frame - 12, fps, config: { damping: 12, stiffness: 150, mass: 0.7 } });
  // Nach dem Landen pulsiert die Pille ganz leicht im Takt (150 BPM = alle 12 Frames).
  const takt = frame > 24 ? Math.exp(-(frame % 24) / 6) * 0.025 : 0;

  return (
    <Buehne zoom={interpolate(frame, [0, 60], [1, 1.03], KLAMMERN)}>
      {zeilen.map((zeile, i) => {
        const rein = spring({ frame: frame - i * 4, fps, config: { damping: 16, stiffness: 150 } });
        return (
          <div
            key={i}
            style={{
              ...schriftStil(groesse),
              color: FARBEN.schrift,
              marginTop: i === 0 ? 0 : groesse * 0.02,
              opacity: interpolate(rein, [0, 0.4], [0, 1], KLAMMERN),
              transform: `translateY(${(1 - rein) * 90}px)`,
            }}
          >
            {zeile}
          </div>
        );
      })}
      <div
        style={{
          marginTop: 70,
          display: "flex",
          alignItems: "center",
          gap: 26,
          padding: "30px 58px 30px 48px",
          borderRadius: 999,
          background: FARBEN.akzent,
          opacity: interpolate(pille, [0, 0.3], [0, 1], KLAMMERN),
          transform: `scale(${interpolate(pille, [0, 1], [0.5, 1]) + takt})`,
        }}
      >
        <svg width={pillenSchrift * 0.62} height={pillenSchrift * 0.7} viewBox="0 0 20 22">
          <path d="M3 2.6v16.8a1.6 1.6 0 0 0 2.4 1.4l14-8.4a1.6 1.6 0 0 0 0-2.8l-14-8.4A1.6 1.6 0 0 0 3 2.6Z" fill={FARBEN.aufAkzent} />
        </svg>
        <div
          style={{
            ...schriftStil(pillenSchrift),
            fontWeight: 800,
            fontStretch: "100%",
            letterSpacing: "0.01em",
            lineHeight: 1,
            color: FARBEN.aufAkzent,
          }}
        >
          {TEXTE.adresse}
        </div>
      </div>
    </Buehne>
  );
};

/* ── Das ganze Reel ──────────────────────────────────────────────────────── */

export const WeihnachtsReel: React.FC<ReelProps> = ({ mitMusik }) => {
  const { fps, durationInFrames } = useVideoConfig();
  const bereit = useSchrift();

  const szene = (z: { von: number; bis: number }, letzte = false) => {
    const von = sekunden(z.von, fps);
    const dauer = sekunden(z.bis, fps) - von;
    return { von, dauer, laenge: letzte ? durationInFrames - von : dauer };
  };
  const intro = szene(ZEITPLAN.intro);
  const titel = szene(ZEITPLAN.titel);
  const zahl = szene(ZEITPLAN.zahl);
  const namen = szene(ZEITPLAN.namen);
  const aufruf = szene(ZEITPLAN.aufruf, true);

  const pegel = MUSIK.lautstaerke;
  const ausblenden = sekunden(MUSIK.ausblenden, fps);

  return (
    <AbsoluteFill style={{ backgroundColor: FARBEN.hintergrund }}>
      {mitMusik ? (
        <Audio
          src={staticFile(MUSIK.datei)}
          trimBefore={sekunden(MUSIK.startSekunde, fps)}
          volume={(f) =>
            interpolate(f, [0, 6, durationInFrames - ausblenden, durationInFrames], [0, pegel, pegel, 0], KLAMMERN)
          }
        />
      ) : null}

      <Schnee />

      {bereit ? (
        <>
          <Ecken />
          <Sequence from={intro.von} durationInFrames={intro.laenge} name="1 Ab heute">
            <Intro dauer={intro.dauer} />
          </Sequence>
          <Sequence from={titel.von} durationInFrames={titel.laenge} name="2 Titel">
            <Titel dauer={titel.dauer} />
          </Sequence>
          <Sequence from={zahl.von} durationInFrames={zahl.laenge} name="3 Zahl">
            <Zahl dauer={zahl.dauer} />
          </Sequence>
          <Sequence from={namen.von} durationInFrames={namen.laenge} name="4 Von bis">
            <Namen dauer={namen.dauer} />
          </Sequence>
          <Sequence from={aufruf.von} durationInFrames={aufruf.laenge} name="5 Aufruf">
            <Aufruf />
          </Sequence>
        </>
      ) : null}
    </AbsoluteFill>
  );
};
