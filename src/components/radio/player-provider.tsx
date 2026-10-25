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
import { radio } from "@/lib/site";
import { StreamConsentDialog } from "./stream-consent";

/**
 * Owns the one and only <audio> element in the app.
 *
 * It is mounted in the root layout, so client-side navigation never unmounts it
 * and playback continues uninterrupted between pages. Every player surface
 * (sticky bar, /radio hero, mobile sheet) is a view over this single state.
 *
 * Two things gate playback:
 *
 * 1. `radio.embedAllowed` — laut.fm's terms forbid embedding their stream, so
 *    while it is false nothing is ever connected and "play" becomes a link-out.
 * 2. The listener's consent — connecting sends their IP address to a third
 *    party, so the first play asks first and remembers the answer.
 */

const VOLUME_KEY = "voltfm-volume";
const MUTED_KEY = "voltfm-muted";
const CONSENT_KEY = "voltfm-stream-consent";
/** Merkt sich, dass der Hinweis vor der Weiterleitung nicht mehr noetig ist. */
const REDIRECT_ACK_KEY = "voltfm-stream-redirect-ack";
/** How often to re-poll laut.fm for track/show metadata. */
const METADATA_INTERVAL_MS = 20_000;

interface PlayerContextValue {
  status: PlayerStatus;
  isPlaying: boolean;
  volume: number;
  muted: boolean;
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
  const [error, setError] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<RadioSnapshot | null>(initialSnapshot);
  const [consent, setConsent] = useState<boolean | null>(null);
  const [asking, setAsking] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [rememberLeave, setRememberLeave] = useState(false);
  /* Set when the listener pressed play before consenting, so accepting starts
     playback instead of making them press play a second time. */
  const playAfterConsent = useRef(false);

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
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    audio.muted = muted;
  }, [volume, muted]);

  /**
   * A live stream has no seekable buffer: on error or re-play we must reassign
   * src to force a fresh connection, otherwise the element replays a stale
   * buffer or refuses to reconnect at all.
   */
  const connect = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setError(null);
    setStatus("connecting");
    audio.src = `${streamUrl}${streamUrl.includes("?") ? "&" : "?"}_=${Date.now().toString(36)}`;
    audio.load();
    audio.play().catch(() => {
      // Autoplay policy or a genuinely unreachable stream.
      setStatus("error");
      setError("Wiedergabe konnte nicht gestartet werden. Bitte erneut versuchen.");
    });
  }, [streamUrl]);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    // Drop the connection entirely rather than buffering a live stream we are
    // not listening to.
    audio.removeAttribute("src");
    audio.load();
    setStatus("paused");
  }, []);

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

  const pause = useCallback(() => stop(), [stop]);

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
    stop();
    setStatus("idle");
  }, [stop]);

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
    const onOffline = () => setStatus((s) => (s === "playing" ? "offline" : s));
    window.addEventListener("offline", onOffline);
    return () => window.removeEventListener("offline", onOffline);
  }, []);

  const value = useMemo<PlayerContextValue>(
    () => ({
      status,
      isPlaying,
      volume,
      muted,
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
          onPause={() => setStatus((s) => (s === "error" ? s : "paused"))}
          onStalled={() => setStatus("connecting")}
          onError={() => {
            // Clearing src during pause() fires a synthetic error; ignore it.
            const audio = audioRef.current;
            if (!audio?.getAttribute("src")) return;
            setStatus("error");
            setError("Stream nicht erreichbar. Bitte erneut versuchen.");
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
