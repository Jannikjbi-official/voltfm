import { site } from "@/lib/site";
import type { CurrentShow, ScheduleSlot } from "./types";

/**
 * Programme schedule from laut.fm.
 *
 * laut.fm models the week as playlist slots: `{ day: "mon", hour: 6, end_time: 0 }`
 * where `end_time` is an hour-of-day, not a duration, and may wrap past midnight.
 * This module normalises that into concrete weekday/hour ranges the UI can use,
 * and resolves which slot is on air right now.
 *
 * The station broadcasts on Europe/Berlin time; all resolution happens in that
 * zone regardless of where the server or the visitor is.
 */

const API = "https://api.laut.fm/station";
const STATION_TZ = "Europe/Berlin";

const DAY_INDEX: Record<string, number> = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};

export const WEEKDAY_LABELS = [
  "Sonntag",
  "Montag",
  "Dienstag",
  "Mittwoch",
  "Donnerstag",
  "Freitag",
  "Samstag",
] as const;

interface RawSlot {
  id: number;
  name: string;
  day: string;
  hour: number;
  end_time: number;
  description: string | null;
  color: string | null;
}

export async function getSchedule(): Promise<ScheduleSlot[]> {
  try {
    const res = await fetch(`${API}/${site.station}/schedule`, {
      next: { revalidate: 600 },
      signal: AbortSignal.timeout(5000),
      headers: { accept: "application/json" },
    });
    if (!res.ok) return [];
    const raw = (await res.json()) as RawSlot[];
    if (!Array.isArray(raw)) return [];

    return raw
      .map((slot) => ({
        id: slot.id,
        name: slot.name?.trim() || "VoltFM",
        description: slot.description?.trim() || null,
        weekday: DAY_INDEX[slot.day?.toLowerCase()] ?? 0,
        startHour: Number(slot.hour) || 0,
        endHour: Number(slot.end_time) || 0,
        color: slot.color?.trim() || null,
      }))
      .sort((a, b) => a.weekday - b.weekday || a.startHour - b.startHour);
  } catch {
    return [];
  }
}

/** Current weekday/hour/minute in the station's timezone. */
function stationNow(now = new Date()): { weekday: number; hour: number; minute: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: STATION_TZ,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const weekday = DAY_INDEX[get("weekday").toLowerCase().slice(0, 3)] ?? now.getDay();
  // Intl renders midnight as "24" in some runtimes.
  const hour = Number(get("hour")) % 24;
  return { weekday, hour, minute: Number(get("minute")) };
}

/** Minutes from the start of the week (Sunday 00:00) for a weekday + hour. */
function weekMinutes(weekday: number, hour: number, minute = 0): number {
  return weekday * 1440 + hour * 60 + minute;
}

/**
 * Slot length in minutes, handling slots that run past midnight and slots where
 * start === end (laut.fm's way of saying "the full 24 hours").
 */
function slotDuration(slot: ScheduleSlot): number {
  const diff = (slot.endHour - slot.startHour + 24) % 24;
  return (diff === 0 ? 24 : diff) * 60;
}

function toShow(slot: ScheduleSlot, startsAt: Date): CurrentShow {
  const endsAt = new Date(startsAt.getTime() + slotDuration(slot) * 60_000);
  return {
    name: slot.name,
    description: slot.description,
    startsAt: startsAt.toISOString(),
    endsAt: endsAt.toISOString(),
    color: slot.color,
  };
}

/**
 * Resolve the slot on air now and the one after it.
 *
 * Slots are projected onto an absolute minute-of-week line and compared there,
 * which makes midnight-wrapping and week-wrapping fall out naturally.
 */
export function resolveCurrentAndNext(
  slots: ScheduleSlot[],
  now = new Date(),
): { current: CurrentShow | null; next: CurrentShow | null } {
  if (slots.length === 0) return { current: null, next: null };

  const { weekday, hour, minute } = stationNow(now);
  const nowMinutes = weekMinutes(weekday, hour, minute);
  const WEEK = 7 * 1440;

  // Each slot, expressed as minutes-from-now until it starts (0..WEEK).
  const projected = slots.map((slot) => {
    const start = weekMinutes(slot.weekday, slot.startHour);
    const untilStart = (start - nowMinutes + WEEK) % WEEK;
    return { slot, untilStart, duration: slotDuration(slot) };
  });

  // On air = started in the past (untilStart measured backwards) and not ended.
  const current =
    projected
      .map((p) => ({ ...p, sinceStart: (WEEK - p.untilStart) % WEEK }))
      .filter((p) => p.sinceStart < p.duration)
      .sort((a, b) => a.sinceStart - b.sinceStart)[0] ?? null;

  const upcoming =
    projected.filter((p) => p.untilStart > 0).sort((a, b) => a.untilStart - b.untilStart)[0] ??
    null;

  return {
    current: current
      ? toShow(current.slot, new Date(now.getTime() - current.sinceStart * 60_000))
      : null,
    next: upcoming
      ? toShow(upcoming.slot, new Date(now.getTime() + upcoming.untilStart * 60_000))
      : null,
  };
}

export async function getCurrentAndNextShow(): Promise<{
  current: CurrentShow | null;
  next: CurrentShow | null;
}> {
  return resolveCurrentAndNext(await getSchedule());
}

/** Groups slots by weekday for the programme page. */
export function groupByWeekday(slots: ScheduleSlot[]): { weekday: number; slots: ScheduleSlot[] }[] {
  return Array.from({ length: 7 }, (_, weekday) => ({
    weekday,
    slots: slots.filter((s) => s.weekday === weekday),
  }));
}
