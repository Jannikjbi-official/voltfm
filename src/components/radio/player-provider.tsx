"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { PlayerStatus, RadioSnapshot } from "@/services/radio/types";
import { radio, site } from "@/lib/site";
import { StreamConsentDialog } from "./stream-consent";
import { COVER_PIXELS, coverSrc } from "./cover-url";

/**
 * Owns the one and only <audio> element in the app.
 *
 * It is mounted in the root layout, so client-side navigation never unmounts it
 * and playback continues uninterrupted between pages. Every player surface
 * (sticky bar, home stage, /radio) is a view over this single state.
 *
 * Two things gate playback:
 *
 * 1. `radio.embedAllowed` — laut.fm's terms forbid embedding their stream, so
 *    while it is false nothing is ever connected and "play" becomes a link-out.
 * 2. The listener's consent — connecting sends their IP address to a third
 *    party, so the first play asks first and remembers the answer.
 *
 * Mit eingeschaltetem Player kommt dazu die Media Session: Titel, Interpret,
 * Playlist und Cover stehen auf dem Sperrbildschirm und in den Mediensteuerungen
 * des Systems, Play und Pause funktionieren von dort aus.
 */

const VOLUME_KEY = "voltfm-volume";
const MUTED_KEY = "voltfm-muted";
const CONSENT_KEY = "voltfm-stream-consent";
/** Merkt sich, dass der Hinweis vor der Weiterleitung nicht mehr noetig ist. */
const REDIRECT_ACK_KEY = "voltfm-stream-redirect-ack";
/** How often to re-poll laut.fm for track/show metadata. */
const METADATA_INTERVAL_MS = 20_000;
/**
 * So lange darf das Verbinden dauern, bevor es als gescheitert gilt. Ohne
 * Grenze dreht sich der Ladekreis ewig, wenn laut.fm nicht antwortet.
 */
const CONNECT_TIMEOUT_MS = 15_000;
/**
 * Nach so langer Pause wird die Verbindung ganz getrennt. Bis dahin bleibt sie
 * stehen, damit die Steuerung auf dem Sperrbildschirm nicht verschwindet —
 * wer kurz pausiert, soll dort auch wieder auf Play tippen koennen.
 */
const PAUSE_DISCONNECT_MS = 60_000;
/** Fallback-Bild fuer den Sperrbildschirm, wenn es zum Titel kein Cover gibt. */
const FALLBACK_ARTWORK = { src: "/logo/voltfm-play-icon-dunkel.png", sizes: "1024x1024", type: "image/png" };

const MESSAGES = {
  offline: "Du bist offline. Sobald die Verbindung zurück ist, kannst du es noch einmal versuchen.",
  blocked: "Dein Browser hat die Wiedergabe blockiert. Tipp noch einmal auf Play.",
  timeout: "Der Stream antwortet gerade nicht. Versuch es in einem Moment noch einmal.",
  network: "Die Verbindung zum Stream ist abgebrochen. Versuch es noch einmal.",
  decode: "Der Stream kam beschädigt an. Ein neuer Versuch hilft meistens.",
  unreachable: `Der Stream ist gerade nicht erreichbar. Das liegt meist an ${radio.providerName} und ist nach ein paar Minuten vorbei.`,
  unknown: "Der Stream lässt sich gerade nicht abspielen. Versuch es noch einmal.",
} as const;

/** Uebersetzt den Fehler des <audio>-Elements in einen Satz, mit dem man etwas anfangen kann. */
function describeMediaError(audio: HTMLAudioElement | null): string {
  if (typeof navigator !== "undefined" && !navigator.onLine) return MESSAGES.offline;
  switch (audio?.error?.code) {
    case MediaError.MEDIA_ERR_NETWORK:
      return MESSAGES.network;
    case MediaError.MEDIA_ERR_DECODE:
      return MESSAGES.decode;
    case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
      // So meldet der Browser auch einen Stream, der gar nicht antwortet.
      return MESSAGES.unreachable;
    default:
      return MESSAGES.unknown;
  }
}

interface PlayerContextValue {
  status: PlayerStatus;
  isPlaying: boolean;
  volume: number;
  muted: boolean;
  /**
   * False auf iPhone und iPad: Dort laesst sich die Lautstaerke einer Webseite
   * nicht setzen, nur stummschalten. Der Regler waere dort ohne Wirkung.
   */
  volumeSupported: boolean;
  snapshot: RadioSnapshot | null;
  error: string | null;
  /** False while laut.fm's terms forbid on-site playback. */
  embedAllowed: boolean;
  /** Where to send listeners instead, while embedding is off. */
  externalUrl: string;
  /** null until the stored answer has been read on the client. */
  consent: boolean | null;
  grantConsent: () => void;
  revokeConsent: () => void;
  /** Oeffnet den Hinweis vor der Weiterleitung (bzw. geht direkt, wenn abbestellt). */
  openStream: () => void;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  retry: () => void;
  setVolume: (value: number) => void;
  toggleMute: () => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function RadioPlayerProvider({
  streamUrl,
  initialSnapshot,
  children,
}: {
  streamUrl: string;
  initialSnapshot: RadioSnapshot | null;
  children: React.ReactNode;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [status, setStatus] = useState<PlayerStatus>("idle");
  const [volume, setVolumeState] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [volumeSupported, setVolumeSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<RadioSnapshot | null>(initialSnapshot);
  const [consent, setConsent] = useState<boolean | null>(null);
  const [asking, setAsking] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [rememberLeave, setRememberLeave] = useState(false);
  /* Set when the listener pressed play before consenting, so accepting starts
     playback instead of making them press play a second time. */
  const playAfterConsent = useRef(false);
  const disconnectTimer = useRef<number | null>(null);

  /* Restore the listener's preferences from localStorage.
     This is a one-shot read of a browser-only store on mount: it cannot run
     during SSR, and seeding it into initial state instead would change the
     server-rendered markup and break hydration. */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const storedVolume = localStorage.getItem(VOLUME_KEY);
      const storedMuted = localStorage.getItem(MUTED_KEY);
      if (storedVolume !== null) {
        const parsed = Number(storedVolume);
        if (Number.isFinite(parsed)) setVolumeState(Math.min(1, Math.max(0, parsed)));
      }
      if (storedMuted !== null) setMuted(storedMuted === "true");
      setConsent(localStorage.getItem(CONSENT_KEY) === "granted");
      setRememberLeave(localStorage.getItem(REDIRECT_ACK_KEY) === "1");
    } catch {
      // Storage unavailable — defaults are fine, and no stored consent means
      // we ask again, which is the safe direction.
      setConsent(false);
    }

    /* iOS ignoriert das Setzen der Lautstaerke und liest danach 1 zurueck.
       Ein Probe-Element verraet das, ohne eine Verbindung aufzubauen. */
    const probe = document.createElement("audio");
    probe.volume = 0.5;
    setVolumeSupported(probe.volume === 0.5);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    audio.muted = muted;
  }, [volume, muted]);

  const clearDisconnectTimer = useCallback(() => {
    if (disconnectTimer.current !== null) {
      window.clearTimeout(disconnectTimer.current);
      disconnectTimer.current = null;
    }
  }, []);

  /** Drop the connection entirely rather than buffering a stream nobody hears. */
  const disconnect = useCallback(() => {
    clearDisconnectTimer();
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
  }, [clearDisconnectTimer]);

  /**
   * A live stream has no seekable buffer: on error or re-play we must reassign
   * src to force a fresh connection, otherwise the element replays a stale
   * buffer or refuses to reconnect at all. Das gilt auch nach einer Pause:
   * Weiter geht es immer live, nicht dort, wo pausiert wurde.
   */
  const connect = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    clearDisconnectTimer();
    if (!navigator.onLine) {
      setStatus("offline");
      setError(MESSAGES.offline);
      return;
    }
    setError(null);
    setStatus("connecting");
    audio.src = `${streamUrl}${streamUrl.includes("?") ? "&" : "?"}_=${Date.now().toString(36)}`;
    audio.load();
    audio.play().catch((reason: unknown) => {
      const name = reason instanceof DOMException ? reason.name : "";
      // Ein Pause-Klick oder ein neuer Versuch hat den Start abgebrochen — kein Fehler.
      if (name === "AbortError") return;
      setStatus("error");
      setError(name === "NotAllowedError" ? MESSAGES.blocked : describeMediaError(audio));
    });
  }, [clearDisconnectTimer, streamUrl]);

  const pauseAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setStatus("paused");
    clearDisconnectTimer();
    disconnectTimer.current = window.setTimeout(disconnect, PAUSE_DISCONNECT_MS);
  }, [clearDisconnectTimer, disconnect]);

  useEffect(() => clearDisconnectTimer, [clearDisconnectTimer]);

  /* Haengt das Verbinden fest, gibt es nach CONNECT_TIMEOUT_MS eine Meldung
     statt eines ewigen Ladekreises. `stalled` feuert bei Streams auch mitten im
     Spielen; laeuft der Ton tatsaechlich, wird nur der Status korrigiert. */
  useEffect(() => {
    if (status !== "connecting") return;
    const id = window.setTimeout(() => {
      const audio = audioRef.current;
      if (audio && !audio.paused && audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
        setStatus("playing");
        return;
      }
      disconnect();
      setStatus("error");
      setError(navigator.onLine ? MESSAGES.timeout : MESSAGES.offline);
    }, CONNECT_TIMEOUT_MS);
    return () => window.clearTimeout(id);
  }, [status, disconnect]);

  const openExternal = useCallback(() => {
    // Ein separates Fenster, nie eingebettet: Der Player laeuft auf
    // lautstation.de (siehe radio.externalUrl), nicht hier.
    window.open(radio.externalUrl, "_blank", "noopener,noreferrer");
  }, []);

  /**
   * Der Weg nach draussen. Beim ersten Mal kommt der Hinweis, danach nur noch,
   * wenn der Haken nicht gesetzt wurde.
   */
  const openStream = useCallback(() => {
    if (rememberLeave) {
      openExternal();
      return;
    }
    setLeaving(true);
  }, [openExternal, rememberLeave]);

  const play = useCallback(() => {
    if (!radio.embedAllowed) {
      openStream();
      return;
    }
    if (consent !== true) {
      playAfterConsent.current = true;
      setAsking(true);
      return;
    }
    connect();
  }, [connect, consent, openStream]);

  const pause = useCallback(() => pauseAudio(), [pauseAudio]);

  const isPlaying = status === "playing" || status === "connecting";

  const toggle = useCallback(() => {
    if (isPlaying) pause();
    else play();
  }, [isPlaying, pause, play]);

  const grantConsent = useCallback(() => {
    setConsent(true);
    setAsking(false);
    try {
      localStorage.setItem(CONSENT_KEY, "granted");
    } catch {
      /* ignore — consent then lasts for this page view only */
    }
    if (playAfterConsent.current) {
      playAfterConsent.current = false;
      connect();
    }
  }, [connect]);

  /** Withdrawing consent must also cut the connection that consent allowed. */
  const revokeConsent = useCallback(() => {
    setConsent(false);
    setAsking(false);
    playAfterConsent.current = false;
    try {
      localStorage.removeItem(CONSENT_KEY);
    } catch {
      /* ignore */
    }
    disconnect();
    setStatus("idle");
  }, [disconnect]);

  const setVolume = useCallback((value: number) => {
    const clamped = Math.min(1, Math.max(0, value));
    setVolumeState(clamped);
    // Nudging the slider off zero is an implicit unmute.
    if (clamped > 0) setMuted(false);
    try {
      localStorage.setItem(VOLUME_KEY, String(clamped));
      if (clamped > 0) localStorage.setItem(MUTED_KEY, "false");
    } catch {
      /* ignore */
    }
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(MUTED_KEY, String(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  /* Poll metadata. This goes to our own /api/radio/now, which talks to laut.fm
     server-side — the listener's browser never contacts laut.fm for it, so it
     needs no consent. It never surfaces an error: the stream matters, the
     metadata does not. */
  useEffect(() => {
    let cancelled = false;

    async function pull() {
      try {
        const res = await fetch("/api/radio/now", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as RadioSnapshot;
        if (!cancelled) setSnapshot(data);
      } catch {
        /* keep the last known snapshot */
      }
    }

    const id = window.setInterval(pull, METADATA_INTERVAL_MS);
    // Refresh immediately when the listener comes back to the tab.
    const onVisible = () => {
      if (document.visibilityState === "visible") void pull();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  // Reflect the browser's own offline state.
  useEffect(() => {
    const onOffline = () => {
      // Nur wer gerade hoert, bekommt die Meldung — ein pausierter Player
      // hat nichts zu verlieren.
      const audio = audioRef.current;
      if (!audio || audio.paused) return;
      setStatus("offline");
      setError(MESSAGES.offline);
    };
    window.addEventListener("offline", onOffline);
    return () => window.removeEventListener("offline", onOffline);
  }, []);

  /* --- Media Session -------------------------------------------------------
     Nur mit eingeschaltetem Player: Ohne <audio> gibt es nichts, was das
     System steuern koennte. Das Cover laeuft ueber /_next/image wie ueberall,
     auch der Sperrbildschirm laedt es also von voltfm.xyz und nicht von Apple. */
  const track = snapshot?.nowPlaying ?? null;
  const showName = snapshot?.currentShow?.name ?? null;

  useEffect(() => {
    if (!radio.embedAllowed || !("mediaSession" in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track?.title ?? `${site.name} Livestream`,
      artist: track?.artist ?? site.tagline,
      album: showName ? `${site.name} · ${showName}` : site.name,
      artwork: track?.coverUrl
        ? (["thumb", "large"] as const).map((size) => ({
            src: coverSrc(track.coverUrl as string, size),
            sizes: `${COVER_PIXELS[size]}x${COVER_PIXELS[size]}`,
          }))
        : [FALLBACK_ARTWORK],
    });
  }, [track?.title, track?.artist, track?.coverUrl, showName]);

  useEffect(() => {
    if (!radio.embedAllowed || !("mediaSession" in navigator)) return;
    navigator.mediaSession.playbackState =
      status === "playing" || status === "connecting" ? "playing" : status === "paused" ? "paused" : "none";
  }, [status]);

  useEffect(() => {
    if (!radio.embedAllowed || !("mediaSession" in navigator)) return;
    const session = navigator.mediaSession;
    const handlers: [MediaSessionAction, MediaSessionActionHandler | null][] = [
      ["play", () => play()],
      ["pause", () => pause()],
      ["stop", () => disconnect()],
      // Ein Livestream laesst sich nicht spulen und hat keinen naechsten Titel.
      // Ohne Handler blendet das System diese Knoepfe aus.
      ["seekbackward", null],
      ["seekforward", null],
      ["seekto", null],
      ["previoustrack", null],
      ["nexttrack", null],
    ];
    for (const [action, handler] of handlers) {
      try {
        session.setActionHandler(action, handler);
      } catch {
        /* Nicht jeder Browser kennt jede Aktion. */
      }
    }
    return () => {
      for (const [action] of handlers) {
        try {
          session.setActionHandler(action, null);
        } catch {
          /* ignore */
        }
      }
    };
  }, [play, pause, disconnect]);

  const value = useMemo<PlayerContextValue>(
    () => ({
      status,
      isPlaying,
      volume,
      muted,
      volumeSupported,
      snapshot,
      error,
      embedAllowed: radio.embedAllowed,
      externalUrl: radio.externalUrl,
      consent,
      grantConsent,
      revokeConsent,
      openStream,
      play,
      pause,
      toggle,
      retry: connect,
      setVolume,
      toggleMute,
    }),
    [
      status,
      isPlaying,
      volume,
      muted,
      volumeSupported,
      snapshot,
      error,
      consent,
      grantConsent,
      revokeConsent,
      openStream,
      play,
      pause,
      toggle,
      connect,
      setVolume,
      toggleMute,
    ],
  );

  return (
    <PlayerContext.Provider value={value}>
      {/* No audio element at all while embedding is switched off: nothing can
          then accidentally open a connection to the stream provider. */}
      {radio.embedAllowed && (
        <audio
          ref={audioRef}
          preload="none"
          // No autoPlay: the listener must press play, per browser policy,
          // basic courtesy, and the consent gate above.
          onPlaying={() => setStatus("playing")}
          onWaiting={() => setStatus("connecting")}
          onPause={() => setStatus((s) => (s === "error" || s === "offline" ? s : "paused"))}
          onStalled={() => setStatus((s) => (s === "paused" ? s : "connecting"))}
          onError={() => {
            // Clearing src during disconnect() fires a synthetic error; ignore it.
            const audio = audioRef.current;
            if (!audio?.getAttribute("src")) return;
            clearDisconnectTimer();
            setStatus("error");
            setError(describeMediaError(audio));
          }}
        >
          <track kind="captions" />
        </audio>
      )}

      {/* Einwilligung vor dem Verbinden — nur relevant, wenn eingebettet wird. */}
      <StreamConsentDialog
        open={asking}
        mode="embed"
        onAccept={grantConsent}
        onDecline={() => {
          playAfterConsent.current = false;
          setAsking(false);
        }}
      />

      {/* Hinweis vor der Weiterleitung zum Anbieter. */}
      <StreamConsentDialog
        open={leaving}
        mode="redirect"
        remember={rememberLeave}
        onRememberChange={(next) => {
          setRememberLeave(next);
          try {
            if (next) localStorage.setItem(REDIRECT_ACK_KEY, "1");
            else localStorage.removeItem(REDIRECT_ACK_KEY);
          } catch {
            /* ignore — gilt dann nur fuer diesen Seitenaufruf */
          }
        }}
        onAccept={() => {
          setLeaving(false);
          openExternal();
        }}
        onDecline={() => setLeaving(false)}
      />

      {children}
    </PlayerContext.Provider>
  );
}

export function useRadioPlayer(): PlayerContextValue {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("useRadioPlayer must be used inside <RadioPlayerProvider>");
  return ctx;
}
