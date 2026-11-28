// VoltFM Radio – öffentlicher Bot, den jeder auf seinen Server einladen kann.
// Spielt den VoltFM-Livestream im Sprachkanal. Ein ffmpeg-Prozess und ein AudioPlayer für alle
// Server zusammen: Jede Sprachverbindung hört denselben Player (spart CPU bei vielen Servern).
//
// Befehle: /radio play · /radio stop · /radio jetzt · /radio info
// Intents: nur Guilds + GuildVoiceStates (keine privilegierten Intents nötig).
import { ActivityType, ChannelType, Client, Events, GatewayIntentBits, MessageFlags, PermissionFlagsBits } from "discord.js";
import {
  AudioPlayerStatus, NoSubscriberBehavior, VoiceConnectionStatus, createAudioPlayer, createAudioResource,
  entersState, getVoiceConnection, joinVoiceChannel, StreamType,
} from "@discordjs/voice";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const env = (k, d = "") => (process.env[k] ?? d).trim().replace(/^['"]|['"]$/g, "");
const TOKEN = env("RADIO_BOT_TOKEN");
const STATION = env("LAUTFM_STATION", "jannikjbi");
const STREAM = env("STREAM_URL", `https://stream.laut.fm/${STATION}`);
const SITE_API = env("SITE_API_URL", "http://voltfm:3000");
const SITE = env("SITE_URL", "https://voltfm.xyz");
const DISCORD_INVITE = env("DISCORD_INVITE_URL", "https://discord.com/invite/2wCxEHJ6VZ");
const DATA = env("DATA_DIR", "/data");
const ALONE_MS = Number(env("ALONE_SECONDS", "120")) * 1000;
const PERMISSIONS = "3148800"; // Kanal ansehen, Nachrichten senden, Links einbetten, Verbinden, Sprechen
const COLOR = 0xffd60a;
const log = (...a) => console.log(new Date().toISOString(), ...a);

// Ohne Token einfach warten (der Timer hält den Prozess am Leben, sonst startet Docker ihn ständig neu)
if (!TOKEN) { console.warn("RADIO_BOT_TOKEN fehlt – der Bot wartet, bis er im Admin-Panel eingetragen ist."); await new Promise(() => setInterval(() => {}, 1 << 30)); }

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });

/* ---------- gespeicherte Kanäle: nach einem Neustart wieder beitreten ---------- */
const STORE = path.join(DATA, "kanaele.json");
let kanaele = {}; // guildId → channelId
try { kanaele = JSON.parse(fs.readFileSync(STORE, "utf8")); } catch {}
function speichern() {
  try { fs.mkdirSync(DATA, { recursive: true }); fs.writeFileSync(STORE + ".neu", JSON.stringify(kanaele, null, 2)); fs.renameSync(STORE + ".neu", STORE); }
  catch (e) { log("[daten] nicht gespeichert:", e.message); }
}

/* ---------- ein Stream für alle ---------- */
const player = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Play } });
let ffmpeg = null;
let restartTimer = null;
const aktiv = () => client.guilds.cache.filter((g) => getVoiceConnection(g.id)).size;

function startStream() {
  clearTimeout(restartTimer);
  if (ffmpeg) return;
  ffmpeg = spawn("ffmpeg", [
    "-hide_banner", "-loglevel", "error",
    "-reconnect", "1", "-reconnect_streamed", "1", "-reconnect_on_network_error", "1", "-reconnect_delay_max", "10",
    "-i", STREAM, "-vn", "-c:a", "libopus", "-b:a", "96k", "-ar", "48000", "-ac", "2", "-f", "ogg", "pipe:1",
  ], { stdio: ["ignore", "pipe", "pipe"] });
  const p = ffmpeg;
  p.stderr.on("data", (d) => log("[ffmpeg]", String(d).trim().slice(0, 300)));
  p.on("exit", (code) => { if (ffmpeg === p) ffmpeg = null; if (code) log("[radio] ffmpeg beendet, Code", code); });
  player.play(createAudioResource(p.stdout, { inputType: StreamType.OggOpus }));
  log("[radio] Stream gestartet");
}
function stopStreamWennLeer() {
  if (aktiv() > 0) return;
  clearTimeout(restartTimer);
  player.stop(true);
  ffmpeg?.kill("SIGKILL"); ffmpeg = null;
  log("[radio] keine Verbindung mehr – Stream angehalten");
}
player.on(AudioPlayerStatus.Idle, () => {
  if (aktiv() === 0) return;
  log("[radio] Stream zu Ende – neu in 5 s");
  ffmpeg?.kill("SIGKILL"); ffmpeg = null;
  restartTimer = setTimeout(startStream, 5000);
});
player.on("error", (e) => { log("[radio] Player-Fehler:", e.message); ffmpeg?.kill("SIGKILL"); ffmpeg = null; restartTimer = setTimeout(startStream, 5000); });

/* ---------- Sprachkanal beitreten / verlassen ---------- */
const beobachtet = new WeakSet();
async function beitreten(channel) {
  const guild = channel.guild;
  const alt = getVoiceConnection(guild.id);
  if (alt && alt.joinConfig.channelId === channel.id && alt.state.status === VoiceConnectionStatus.Ready) return alt;
  // Gibt es schon eine Verbindung auf dem Server, zieht joinVoiceChannel sie in den neuen Kanal um
  const conn = joinVoiceChannel({ channelId: channel.id, guildId: guild.id, adapterCreator: guild.voiceAdapterCreator, selfDeaf: true, selfMute: false });
  if (!beobachtet.has(conn)) {
    beobachtet.add(conn);
    conn.on(VoiceConnectionStatus.Disconnected, async () => {
      try {
        await Promise.race([entersState(conn, VoiceConnectionStatus.Signalling, 5_000), entersState(conn, VoiceConnectionStatus.Connecting, 5_000)]);
      } catch {
        try { conn.destroy(); } catch {}
      }
    });
    conn.on(VoiceConnectionStatus.Destroyed, () => setTimeout(stopStreamWennLeer, 500));
  }
  startStream();
  conn.subscribe(player);
  await entersState(conn, VoiceConnectionStatus.Ready, 20_000);
  // Stage-Kanal: als Sprecher auf die Bühne
  if (channel.type === ChannelType.GuildStageVoice) {
    try { await guild.members.me.voice.setSuppressed(false); } catch { try { await guild.members.me.voice.setRequestToSpeak(true); } catch {} }
  }
  kanaele[guild.id] = channel.id; speichern();
  log(`[radio] ${guild.name}: #${channel.name} (${aktiv()} Server aktiv)`);
  return conn;
}
function verlassen(guildId, vergessen = true) {
  try { getVoiceConnection(guildId)?.destroy(); } catch {}
  if (vergessen && kanaele[guildId]) { delete kanaele[guildId]; speichern(); }
  setTimeout(stopStreamWennLeer, 500);
}

/* Allein im Kanal: nach ALONE_MS raus. Kommt jemand zurück, bleibt er. */
const alleinTimer = new Map();
function alleinPruefen(guild) {
  const conn = getVoiceConnection(guild.id);
  if (!conn) return;
  const ch = guild.channels.cache.get(conn.joinConfig.channelId);
  const menschen = ch?.members?.filter((m) => !m.user.bot).size ?? 0;
  if (menschen > 0) { clearTimeout(alleinTimer.get(guild.id)); alleinTimer.delete(guild.id); return; }
  if (alleinTimer.has(guild.id)) return;
  alleinTimer.set(guild.id, setTimeout(() => {
    alleinTimer.delete(guild.id);
    const c = guild.channels.cache.get(getVoiceConnection(guild.id)?.joinConfig.channelId);
    if (c && c.members.filter((m) => !m.user.bot).size === 0) { log(`[radio] ${guild.name}: allein – verlasse den Kanal`); verlassen(guild.id); }
  }, ALONE_MS));
}
client.on(Events.VoiceStateUpdate, (alt, neu) => {
  const guild = neu.guild;
  // Bot wurde getrennt oder verschoben
  if (neu.id === client.user.id) {
    if (!neu.channelId) { verlassen(guild.id); return; }
    if (kanaele[guild.id] !== neu.channelId) { kanaele[guild.id] = neu.channelId; speichern(); }
  }
  alleinPruefen(guild);
});
client.on(Events.GuildDelete, (g) => { verlassen(g.id); log(`[radio] von Server entfernt: ${g.name ?? g.id}`); });

/* ---------- laufender Song ---------- */
async function nowPlaying() {
  try {
    const r = await fetch(`${SITE_API}/api/radio/now`, { signal: AbortSignal.timeout(8000) });
    if (r.ok) {
      const j = await r.json();
      const n = j?.nowPlaying;
      if (n?.title) return { title: n.title, artist: n.artist ?? "", album: n.album, year: n.releaseYear, cover: n.coverUrl, startedAt: n.startedAt, listeners: j.listeners, history: (j.history ?? []).filter((h) => h?.title && !(h.title === n.title && h.artist === n.artist)).slice(0, 3) };
    }
  } catch {}
  try {
    const r = await fetch(`https://api.laut.fm/station/${STATION}/current_song`, { signal: AbortSignal.timeout(8000) });
    if (!r.ok) return null;
    const s = await r.json();
    return s?.title ? { title: s.title, artist: s?.artist?.name ?? "", album: s.album, year: s.releaseyear, cover: null, startedAt: s.started_at, listeners: null, history: [] } : null;
  } catch { return null; }
}
const md = (t) => String(t ?? "").replace(/([\\*_`~|>#\[\]()-])/g, "\\$1");
const unix = (iso) => Math.floor((Date.parse(iso) || Date.now()) / 1000);
const einladung = () => `https://discord.com/oauth2/authorize?client_id=${client.user.id}&scope=bot%20applications.commands&permissions=${PERMISSIONS}`;
const knoepfe = () => ({ type: 1, components: [
  { type: 2, style: 5, label: "voltfm.xyz", emoji: { name: "🎧" }, url: `${SITE}/radio` },
  { type: 2, style: 5, label: "Bot einladen", emoji: { name: "➕" }, url: einladung() },
  { type: 2, style: 5, label: "VoltFM-Discord", emoji: { name: "💬" }, url: DISCORD_INVITE },
] });
function karte(s) {
  if (!s) return { flags: MessageFlags.IsComponentsV2, components: [{ type: 17, accent_color: COLOR, components: [{ type: 10, content: "## VoltFM\nGerade ist kein Titel bekannt – das Radio läuft trotzdem." }, knoepfe()] }] };
  const meta = [s.album, s.year].filter(Boolean).map(md).join(" · ");
  const text = `## ${md(s.title)}\n${s.artist ? `von **${md(s.artist)}**` : ""}${meta ? `\n-# ${meta}` : ""}`;
  const kopf = `-# 🔴 Live auf VoltFM · seit <t:${unix(s.startedAt)}:t>` + (Number.isFinite(s.listeners) ? ` · 🎧 ${s.listeners} ${s.listeners === 1 ? "hört" : "hören"} zu` : "");
  const davor = s.history.length ? s.history.map((h) => `<t:${unix(h.startedAt)}:t> ${md(h.artist)} – ${md(h.title)}`).join("\n") : null;
  return {
    flags: MessageFlags.IsComponentsV2,
    allowedMentions: { parse: [] },
    components: [{ type: 17, accent_color: COLOR, components: [
      { type: 10, content: kopf },
      s.cover ? { type: 9, components: [{ type: 10, content: text }], accessory: { type: 11, media: { url: s.cover } } } : { type: 10, content: text },
      ...(davor ? [{ type: 14, divider: true, spacing: 1 }, { type: 10, content: `### Davor\n${davor}` }] : []),
      knoepfe(),
    ] }],
  };
}

/* ---------- Slash-Befehle ---------- */
const BEFEHLE = [{
  name: "radio",
  description: "VoltFM – Webradio aus Hamburg, rund um die Uhr",
  dm_permission: false,
  options: [
    { type: 1, name: "play", description: "VoltFM in deinem Sprachkanal abspielen" },
    { type: 1, name: "stop", description: "Radio stoppen und den Sprachkanal verlassen" },
    { type: 1, name: "jetzt", description: "Was läuft gerade auf VoltFM?" },
    { type: 1, name: "info", description: "Über VoltFM und den Bot (Einladungslink)" },
  ],
}];

const privat = (content) => ({ content, flags: MessageFlags.Ephemeral });
function darfSteuern(member, channelId) {
  return member.permissions.has(PermissionFlagsBits.ManageChannels) || (channelId && member.voice.channelId === channelId);
}

client.on(Events.InteractionCreate, async (i) => {
  if (!i.isChatInputCommand() || i.commandName !== "radio" || !i.inGuild()) return;
  const sub = i.options.getSubcommand();
  try {
    if (sub === "jetzt") { await i.deferReply(); return void (await i.editReply(karte(await nowPlaying()))); }
    if (sub === "info") {
      return void (await i.reply({ flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral, components: [{ type: 17, accent_color: COLOR, components: [
        { type: 10, content: `## 📻 VoltFM Radio\nVoltFM ist ein kleines Webradio aus Hamburg: Charts, Pop und Deutschrap, rund um die Uhr.\n\n**So geht's:** Geh in einen Sprachkanal und tipp \`/radio play\`. Mit \`/radio stop\` ist Schluss, \`/radio jetzt\` zeigt den aktuellen Song. Ist niemand mehr im Kanal, geht der Bot nach ${Math.round(ALONE_MS / 60000)} Minuten von selbst.\n\n-# Läuft gerade auf ${client.guilds.cache.size} Servern, in ${aktiv()} davon live.` },
        knoepfe(),
      ] }] }));
    }
    const member = await i.guild.members.fetch(i.user.id);
    const conn = getVoiceConnection(i.guildId);
    if (sub === "stop") {
      if (!conn) return void (await i.reply(privat("Das Radio läuft hier gerade nicht.")));
      if (!darfSteuern(member, conn.joinConfig.channelId)) return void (await i.reply(privat("Stoppen darf nur, wer im selben Sprachkanal ist oder „Kanäle verwalten“ hat.")));
      verlassen(i.guildId);
      return void (await i.reply({ content: "⏹️ VoltFM gestoppt. Bis zum nächsten Mal!", allowedMentions: { parse: [] } }));
    }
    if (sub === "play") {
      const ch = member.voice.channel;
      if (!ch) return void (await i.reply(privat("Geh zuerst in einen Sprachkanal, dann `/radio play`.")));
      if (conn && conn.joinConfig.channelId !== ch.id && !darfSteuern(member, conn.joinConfig.channelId))
        return void (await i.reply(privat("Das Radio läuft schon in einem anderen Kanal. Umziehen darf nur, wer dort ist oder „Kanäle verwalten“ hat.")));
      const me = i.guild.members.me;
      const rechte = ch.permissionsFor(me);
      if (!rechte?.has(PermissionFlagsBits.Connect) || !rechte.has(PermissionFlagsBits.Speak))
        return void (await i.reply(privat(`Mir fehlen in <#${ch.id}> die Rechte **Verbinden** und **Sprechen**.`)));
      await i.deferReply();
      await beitreten(ch);
      const s = await nowPlaying();
      return void (await i.editReply({ content: `▶️ VoltFM läuft jetzt in <#${ch.id}>${s ? ` – gerade: **${md(s.artist)} – ${md(s.title)}**` : ""}`, allowedMentions: { parse: [] } }));
    }
  } catch (e) {
    log("[befehl]", sub, e.message);
    const text = sub === "play" ? "Beitreten hat nicht geklappt. Versuch es gleich noch einmal." : "Da ist etwas schiefgegangen.";
    try { if (i.deferred || i.replied) await i.editReply({ content: text }); else await i.reply(privat(text)); } catch {}
  }
});

/* ---------- Status ---------- */
let runde = 0;
async function status() {
  const s = runde % 2 === 0 ? await nowPlaying() : null;
  runde++;
  const activity = s
    ? { type: ActivityType.Listening, name: `${s.artist} – ${s.title}`.slice(0, 120) }
    : { type: ActivityType.Custom, name: "Status", state: `📻 /radio play · auf ${client.guilds.cache.size} Servern` };
  client.user.setPresence({ status: "online", activities: [activity] });
}

client.once(Events.ClientReady, async (c) => {
  log(`VoltFM Radio online als ${c.user.tag} auf ${c.guilds.cache.size} Servern`);
  log(`Einladungslink: ${einladung()}`);
  try { await c.application.commands.set(BEFEHLE); log("Slash-Befehle registriert"); } catch (e) { log("Slash-Befehle nicht registriert:", e.message); }
  status(); setInterval(status, 30_000);
  // Nach einem Neustart: wieder in die gespeicherten Kanäle, wenn dort jemand ist
  for (const [gid, cid] of Object.entries(kanaele)) {
    try {
      const guild = c.guilds.cache.get(gid);
      const ch = guild && (await guild.channels.fetch(cid).catch(() => null));
      if (!ch || !ch.isVoiceBased() || ch.members.filter((m) => !m.user.bot).size === 0) { delete kanaele[gid]; continue; }
      await beitreten(ch);
    } catch (e) { log(`[radio] ${gid}: Wiederbeitritt fehlgeschlagen:`, e.message); delete kanaele[gid]; }
  }
  speichern();
});

// Beim Beenden (Update/Neustart) die gespeicherten Kanäle NICHT vergessen: nach dem Start geht's dort weiter.
process.on("SIGTERM", () => { ffmpeg?.kill("SIGKILL"); process.exit(0); });
process.on("unhandledRejection", (e) => log("unbehandelt:", e?.message ?? e));
await client.login(TOKEN);
