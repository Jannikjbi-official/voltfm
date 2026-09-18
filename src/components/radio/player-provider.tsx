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

/**
 * Owns the one and only <audio> element in the app.
 *
 * It is mounted in the root layout, so client-side navigation never unmounts it
 * and playback continues uninterrupted between pages. Every player surface
 * (sticky bar, /radio hero, mobile sheet) is a view over this single state.
 */

const VOLUME_KEY = "voltfm-volume";
const MUTED_KEY = "voltfm-muted";
/** How often to re-poll laut.fm for track/show metadata. */
const METADATA_INTERVAL_MS = 20_000;

interface PlayerContextValue {
  status: PlayerStatus;
  isPlaying: boolean;
  volume: number;
  muted: boolean;
  snapshot: RadioSnapshot | null;
  error: string | null;
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

  /* Restore the listener's volume preference from localStorage.
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
    } catch {
      // Storage unavailable — defaults are fine.
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

  const play = useCallback(() => connect(), [connect]);

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    // Drop the connection entirely rather than buffering a live stream we are
    // not listening to.
    audio.removeAttribute("src");
    audio.load();
    setStatus("paused");
  }, []);

  const isPlaying = status === "playing" || status === "connecting";

  const toggle = useCallback(() => {
    if (isPlaying) pause();
    else play();
  }, [isPlaying, pause, play]);

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

  // Poll metadata. Runs regardless of playback so the site always shows what is
  // on air, and never surfaces an error — the stream matters, metadata does not.
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
      play,
      pause,
      toggle,
      retry: connect,
      setVolume,
      toggleMute,
    }),
    [status, isPlaying, volume, muted, snapshot, error, play, pause, toggle, connect, setVolume, toggleMute],
  );

  return (
    <PlayerContext.Provider value={value}>
      <audio
        ref={audioRef}
        preload="none"
        // No autoPlay: the listener must press play, per browser policy and
        // basic courtesy.
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
      {children}
    </PlayerContext.Provider>
  );
}

export function useRadioPlayer(): PlayerContextValue {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("useRadioPlayer must be used inside <RadioPlayerProvider>");
  return ctx;
}
