// VoltFM Zentrale: spielt das Radio im Sprachkanal, zeigt den laufenden Song als Status
// und gibt jedem Mitglied die Grundrolle. Eine Gateway-Verbindung für alles.
import { ActivityType, Client, Events, GatewayIntentBits } from "discord.js";
import {
  AudioPlayerStatus, NoSubscriberBehavior, VoiceConnectionStatus, createAudioPlayer,
  createAudioResource, entersState, joinVoiceChannel, StreamType,
} from "@discordjs/voice";
import { spawn } from "node:child_process";

const env = (k, d = "") => (process.env[k] ?? d).trim().replace(/^['"]|['"]$/g, "");
const TOKEN = env("DISCORD_BOT_TOKEN");
const GUILD = env("GUILD_ID");
const VOICE = env("VOICE_CHANNEL_ID");
const STATION = env("LAUTFM_STATION", "jannikjbi");
const STREAM = env("STREAM_URL", `https://stream.laut.fm/${STATION}`);
const NOW_CHANNEL = env("NOW_PLAYING_CHANNEL_ID");
const SITE_API = env("SITE_API_URL", "http://voltfm:3000");
const ROLES = env("AUTOROLE_IDS").split(",").map((r) => r.trim()).filter(Boolean);
/** Feste Rollen für bestimmte Personen, z. B. {"<user-id>":["<rollen-id>"]} – beim Beitritt und beim Abgleich. */
let USER_ROLES = {};
try { USER_ROLES = JSON.parse(process.env.USER_ROLES || "{}"); } catch { console.warn("USER_ROLES ist kein gültiges JSON"); }
const log = (...a) => console.log(new Date().toISOString(), ...a);

if (!TOKEN) { console.warn("DISCORD_BOT_TOKEN fehlt – warte."); await new Promise(() => {}); }

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMembers],
});

/* ---------- Radio im Sprachkanal ---------- */
const player = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Play } });
let ffmpeg = null;
let restartTimer = null;

function startStream() {
  clearTimeout(restartTimer);
  ffmpeg?.kill("SIGKILL");
  // ffmpeg folgt der Weiterleitung von laut.fm, verbindet bei Abbrüchen neu und liefert Ogg/Opus für Discord.
  ffmpeg = spawn("ffmpeg", [
    "-hide_banner", "-loglevel", "error",
    "-reconnect", "1", "-reconnect_streamed", "1", "-reconnect_on_network_error", "1", "-reconnect_delay_max", "10",
    "-i", STREAM, "-vn", "-c:a", "libopus", "-b:a", "96k", "-ar", "48000", "-ac", "2", "-f", "ogg", "pipe:1",
  ], { stdio: ["ignore", "pipe", "pipe"] });
  ffmpeg.stderr.on("data", (d) => log("[ffmpeg]", String(d).trim().slice(0, 300)));
  ffmpeg.on("exit", (code) => { if (code !== null && code !== 0) log("[radio] ffmpeg beendet, Code", code); });
  player.play(createAudioResource(ffmpeg.stdout, { inputType: StreamType.OggOpus }));
  log("[radio] Stream gestartet:", STREAM);
}
function scheduleRestart(ms = 5000) {
  clearTimeout(restartTimer);
  restartTimer = setTimeout(startStream, ms);
}
player.on(AudioPlayerStatus.Idle, () => { log("[radio] Stream zu Ende – neu in 5 s"); scheduleRestart(); });
player.on("error", (e) => { log("[radio] Player-Fehler:", e.message); scheduleRestart(); });

let connection = null;
async function joinRadio() {
  try {
    const channel = await client.channels.fetch(VOICE);
    connection = joinVoiceChannel({
      channelId: channel.id, guildId: channel.guild.id, adapterCreator: channel.guild.voiceAdapterCreator,
      selfDeaf: true, selfMute: false,
    });
    connection.subscribe(player);
    await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
    log(`[radio] im Sprachkanal #${channel.name}`);
    lastVoiceStatus = null;
    updateVoiceStatus();
    connection.on(VoiceConnectionStatus.Disconnected, async () => {
      try {
        // Kurzer Wechsel (z. B. Server-Region): Discord verbindet selbst neu.
        await Promise.race([
          entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
          entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
        ]);
      } catch {
        log("[radio] getrennt – trete neu bei");
        try { connection.destroy(); } catch {}
        setTimeout(joinRadio, 5_000);
      }
    });
  } catch (e) {
    log("[radio] Beitritt fehlgeschlagen:", e.message, "– neuer Versuch in 30 s");
    try { connection?.destroy(); } catch {}
    setTimeout(joinRadio, 30_000);
  }
}

/* ---------- Status: laufender Song und Hinweise ---------- */
/** Der laufende Song: zuerst von der Website (mit Cover, Verlauf, Hörern), sonst direkt von laut.fm. */
async function nowPlaying() {
  try {
    const r = await fetch(`${SITE_API}/api/radio/now`, { signal: AbortSignal.timeout(8000) });
    if (r.ok) {
      const j = await r.json();
      const n = j?.nowPlaying;
      if (n?.title) {
        const history = (j.history ?? [])
          .filter((h) => h?.title && !(h.title === n.title && h.artist === n.artist))
          .slice(0, 3);
        return { title: n.title, artist: n.artist ?? "", album: n.album, year: n.releaseYear, cover: n.coverUrl,
          startedAt: n.startedAt, history, listeners: j.listeners };
      }
    }
  } catch {}
  try {
    const r = await fetch(`https://api.laut.fm/station/${STATION}/current_song`, { signal: AbortSignal.timeout(8000) });
    if (!r.ok) return null;
    const s = await r.json();
    if (!s?.title) return null;
    return { title: s.title, artist: s?.artist?.name ?? "", album: s.album, year: s.releaseyear, cover: null,
      startedAt: s.started_at, history: [], listeners: null };
  } catch { return null; }
}
async function currentSong() {
  const s = await nowPlaying();
  const text = s ? [s.artist, s.title].filter(Boolean).join(" – ") : "";
  return text ? text.slice(0, 120) : null;
}

/* ---------- #läuft-gerade: genau eine Karte, die bei jedem Songwechsel bearbeitet wird ---------- */
const md = (t) => String(t ?? "").replace(/([\\*_`~|>#\[\]()-])/g, "\\$1");
const unix = (iso) => Math.floor((Date.parse(iso) || Date.now()) / 1000);
let nowMessageId = null;
let lastCardKey = null;

function nowPlayingCard(s) {
  const meta = [s.album, s.year].filter(Boolean).map(md).join(" · ");
  const text = `## ${md(s.title)}\n${s.artist ? `von **${md(s.artist)}**` : ""}${meta ? `\n-# ${meta}` : ""}`;
  const head = `-# 🔴 Live auf VoltFM · seit <t:${unix(s.startedAt)}:t>` +
    (Number.isFinite(s.listeners) ? ` · 🎧 ${s.listeners} ${s.listeners === 1 ? "hört" : "hören"} zu` : "");
  const before = s.history.length
    ? s.history.map((h) => `<t:${unix(h.startedAt)}:t> ${md(h.artist)} – ${md(h.title)}`).join("\n")
    : null;
  return {
    flags: 1 << 15,
    allowed_mentions: { parse: [] },
    components: [{
      type: 17, accent_color: 0xffd60a,
      components: [
        { type: 10, content: head },
        s.cover
          ? { type: 9, components: [{ type: 10, content: text }], accessory: { type: 11, media: { url: s.cover } } }
          : { type: 10, content: text },
        ...(before ? [{ type: 14, divider: true, spacing: 1 }, { type: 10, content: `### Davor\n${before}` }] : []),
        { type: 1, components: [
          { type: 2, style: 5, label: "Radio hören", emoji: { name: "📻" }, url: `https://lautstation.de/?station=${STATION}` },
          { type: 2, style: 5, label: "Mehr auf voltfm.xyz", emoji: { name: "🎧" }, url: "https://voltfm.xyz/radio" },
        ] },
      ],
    }],
  };
}

/** Beim Start: die neueste eigene Karte weiterverwenden, ältere eigene Nachrichten löschen. */
async function adoptNowMessage() {
  try {
    const msgs = await client.rest.get(`/channels/${NOW_CHANNEL}/messages?limit=100`);
    const mine = msgs.filter((m) => m.author?.id === client.user.id);
    nowMessageId = mine[0]?.id ?? null;
    for (const m of mine.slice(1)) {
      try { await client.rest.delete(`/channels/${NOW_CHANNEL}/messages/${m.id}`); } catch {}
    }
    if (mine.length > 1) log(`[läuft-gerade] ${mine.length - 1} alte Nachricht(en) aufgeräumt`);
  } catch (e) { log("[läuft-gerade] Kanal nicht lesbar:", e.message); }
}

async function updateNowPlaying() {
  if (!NOW_CHANNEL) return;
  const s = await nowPlaying();
  if (!s) return;
  const key = `${s.artist}|${s.title}|${s.listeners}`;
  if (key === lastCardKey) return;
  const body = nowPlayingCard(s);
  try {
    if (nowMessageId) {
      try {
        await client.rest.patch(`/channels/${NOW_CHANNEL}/messages/${nowMessageId}`, { body });
      } catch (e) {
        if (e?.status !== 404) throw e;
        nowMessageId = null; // Karte wurde gelöscht: neu anlegen
      }
    }
    if (!nowMessageId) {
      const m = await client.rest.post(`/channels/${NOW_CHANNEL}/messages`, { body });
      nowMessageId = m.id;
    }
    if (!lastCardKey?.startsWith(`${s.artist}|${s.title}|`)) log("[läuft-gerade] Karte:", `${s.artist} – ${s.title}`);
    lastCardKey = key;
  } catch (e) { log("[läuft-gerade] Karte nicht aktualisiert:", e.message); }
}

/* Kanalstatus des Sprachkanals: immer der laufende Song, bei jedem Wechsel neu. */
let lastVoiceStatus = null;
async function updateVoiceStatus() {
  if (!VOICE) return;
  const song = await currentSong();
  const status = song ? `🎵 ${song}` : "📻 VoltFM – live auf voltfm.xyz";
  if (status === lastVoiceStatus) return;
  try {
    await client.rest.put(`/channels/${VOICE}/voice-status`, { body: { status: status.slice(0, 500) } });
    lastVoiceStatus = status;
    log("[radio] Kanalstatus:", status);
  } catch (e) {
    log("[radio] Kanalstatus nicht gesetzt:", e.message);
  }
}

const ROTATION = [
  async () => { const s = await currentSong(); return s && { type: ActivityType.Listening, name: s }; },
  async () => ({ type: ActivityType.Custom, name: "Status", state: "🔊 Live im Sprachkanal „Radio hören“" }),
  async () => ({ type: ActivityType.Custom, name: "Status", state: "📻 Rund um die Uhr live auf voltfm.xyz" }),
  async () => ({ type: ActivityType.Custom, name: "Status", state: "📰 Neues gibt's auf voltfm.xyz/news" }),
];
let turn = 0;
async function tick() {
  for (let i = 0; i < ROTATION.length; i++) {
    const activity = await ROTATION[turn++ % ROTATION.length]();
    if (activity) { client.user.setPresence({ status: "online", activities: [activity] }); return; }
  }
}

/* ---------- Grundrolle für alle ---------- */
async function giveRoles(member) {
  if (member.user.bot || member.guild.id !== GUILD) return false;
  const wanted = [...ROLES, ...(USER_ROLES[member.id] ?? [])];
  const missing = wanted.filter((r) => !member.roles.cache.has(r));
  if (!missing.length) return false;
  try { await member.roles.add(missing, "Automatische Rollen (VoltFM Zentrale)"); return true; }
  catch (e) { log(`[rollen] ${member.user.tag}:`, e.message); return false; }
}
async function sweep() {
  try {
    const guild = await client.guilds.fetch(GUILD);
    const members = await guild.members.fetch();
    let n = 0;
    for (const m of members.values()) if (await giveRoles(m)) n++;
    log(`[rollen] ${n} von ${members.size} Mitgliedern ergänzt`);
  } catch (e) { log("[rollen] Durchlauf fehlgeschlagen:", e.message); }
}
client.on(Events.GuildMemberAdd, async (m) => { if (await giveRoles(m)) log(`[rollen] ${m.user.tag} beigetreten, Rolle vergeben`); });

/* Wird der Bot aus dem Kanal geworfen oder verschoben: zurück in den Radio-Kanal. */
client.on(Events.VoiceStateUpdate, (oldState, newState) => {
  if (newState.id !== client.user.id || newState.guild.id !== GUILD) return;
  if (newState.channelId !== VOICE && oldState.channelId === VOICE) {
    log("[radio] aus dem Kanal entfernt – zurück in 10 s");
    setTimeout(() => { try { connection?.destroy(); } catch {} joinRadio(); }, 10_000);
  }
});

client.once(Events.ClientReady, async (c) => {
  log(`VoltFM Zentrale online als ${c.user.tag}`);
  tick(); setInterval(tick, 30_000);
  if (ROLES.length || Object.keys(USER_ROLES).length) { sweep(); setInterval(sweep, 6 * 60 * 60 * 1000); }
  if (VOICE) { startStream(); joinRadio(); setInterval(updateVoiceStatus, 15_000); }
  if (NOW_CHANNEL) { await adoptNowMessage(); updateNowPlaying(); setInterval(updateNowPlaying, 15_000); }
});

process.on("SIGTERM", () => { try { connection?.destroy(); } catch {} ffmpeg?.kill("SIGKILL"); client.destroy(); process.exit(0); });
process.on("unhandledRejection", (e) => log("unbehandelt:", e?.message ?? e));
await client.login(TOKEN);
