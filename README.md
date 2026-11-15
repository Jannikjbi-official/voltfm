# VoltFM

Die Webplattform von **VoltFM** — Webradio aus Hamburg. Livestream, Sendeplan,
Moderatorenprofile, News-Redaktion, Events und ein Admin-CMS.

Produktion: <https://voltfm.xyz> (Branch `main`)
Dev-Seite: <https://dev.voltfm.xyz> (Branch `dev`)

Neue Änderungen gehen zuerst nach `dev` und sind dort zu sehen. Nach der
Freigabe wird `dev` per Pull Request nach `main` gemerged.

---

## Stack

| Bereich       | Wahl                                                        |
| ------------- | ----------------------------------------------------------- |
| Framework     | Next.js 16 (App Router, Turbopack), React 19, TypeScript     |
| UI            | [HeroUI v3](https://heroui.com/) (React Aria), Tailwind CSS 4 |
| Icons         | Font Awesome                                                 |
| Datenbank     | MongoDB                                                      |
| Auth          | Better Auth (Admin, Username, Discord, Passkey)              |
| Uploads       | UploadThing                                                  |
| Radio         | laut.fm API (Metadaten), Wiedergabe verlinkt                 |

---

## Schnellstart

```bash
npm install
cp .env.example .env.local   # Werte eintragen (siehe unten)
npm run db                   # lokale MongoDB auf Port 27017 (eigenes Terminal)
npm run seed                 # Demo-Inhalte + Indexes
npm run dev                  # http://localhost:3000
```

### Scripts

| Script              | Zweck                                          |
| ------------------- | ---------------------------------------------- |
| `npm run dev`       | Entwicklungsserver                             |
| `npm run build`     | Produktions-Build                              |
| `npm run start`     | Produktionsserver                              |
| `npm run db`        | Lokale MongoDB (nur Entwicklung)               |
| `npm run seed`      | Demo-Inhalte und Indexes anlegen               |
| `npm run typecheck` | TypeScript prüfen                              |
| `npm run lint`      | ESLint                                         |

---

## Environment

Alle Variablen stehen in `.env.example`. `.env.local` ist gitignored und wird
**nie** committet.

| Variable                       | Pflicht | Zweck                                            |
| ------------------------------ | ------- | ------------------------------------------------ |
| `MONGODB_URI`                  | ja      | Connection String (lokal oder Atlas)             |
| `MONGODB_DB`                   | nein    | Datenbankname, Standard `voltfm`                 |
| `BETTER_AUTH_SECRET`           | ja      | Signiert Sessions — `openssl rand -base64 32`    |
| `BETTER_AUTH_URL`              | ja      | Basis-URL, in Produktion `https://voltfm.xyz`    |
| `ADMIN_USER_IDS`               | nein    | Bootstrap der ersten Admins (kommagetrennt)      |
| `DISCORD_CLIENT_ID`            | nein    | Discord-Login                                    |
| `DISCORD_CLIENT_SECRET`        | nein    | Discord-Login                                    |
| `DISCORD_BOT_TOKEN`            | nein    | Discord-Avatare laden, News im Discord ankündigen |
| `DISCORD_NEWS_CHANNEL_ID`      | nein    | Kanal für News, Standard `1570831941182161056`   |
| `UPLOADTHING_TOKEN`            | nein    | Bild-Uploads im Admin                            |
| `NEXT_PUBLIC_RADIO_STREAM_URL` | nein    | Stream-URL                                       |
| `NEXT_PUBLIC_RADIO_STATION`    | nein    | laut.fm Slug, steuert alle Metadaten             |
| `NEXT_PUBLIC_SITE_URL`         | ja      | Öffentliche URL (Canonicals, OG, Sitemap)        |
| `NEXT_PUBLIC_DISCORD_URL`      | nein    | Discord-Einladung                                |
| `LAUTFM_RADIOADMIN_TOKEN`      | nein    | Meilensteine — **Admin-Schlüssel**, nur geheim   |
| `LAUTFM_RADIOADMIN_ORIGIN`     | nein    | Origin des Tokens, Standard `https://www.voltfm.xyz` |
| `CRON_SECRET`                  | nein    | Schützt `/api/cron/meilensteine`                 |

Fehlt eine optionale Variable, verschwindet nur das jeweilige Feature — die
Seite läuft weiter. Ohne `DISCORD_CLIENT_ID` wird der Discord-Login schlicht
nicht angeboten.

### Meilensteine

Einmal am Tag (04:15 UTC, `vercel.json`) ruft Vercel
`/api/cron/meilensteine` auf. Die Route holt die Tageszahlen aus der
laut.fm-Radioadmin-API, speichert sie in `stationDays` und schreibt einen
Beitrag, wenn eine Marke fällt: Einschaltungen im Monat, Hörer gleichzeitig,
Jahrestag. Die Texte stehen in `src/services/milestones/texts.ts`.

- Token holen: <https://radioadmin.laut.fm/login?callback_url=https%3A%2F%2Fwww.voltfm.xyz%2F>
  — nach dem Login steht es in der Adresse hinter `#lautfm_radioadmin_token=`.
- Das Token kann Playlists ändern und das Live-Passwort zurücksetzen. Es gehört
  nur als Sensitive-Variable nach Vercel (Production), nie in den Code oder
  einen Chat. Die Anwendung ruft damit ausschließlich lesend auf.
- Ohne Token läuft nur der Jahrestag. Der Stand steht im Admin unter
  Einstellungen.
- Vercel ruft Cron-Routen nur in Production auf; die Route lehnt jede andere
  Umgebung ab.

---

## MongoDB

Es gibt **keine Migrationen**: Better Auth legt seine Collections für MongoDB
selbst an, und die Inhalts-Collections entstehen beim ersten Schreiben.
`npm run seed` legt zusätzlich alle Indexes an (`src/db/collections.ts`).

Collections: `articles`, `categories`, `hosts`, `shows`, `events`, `media`,
`contactMessages`, `settings`, `stationDays`, `milestones` — dazu die Better-Auth-Collections (`user`,
`session`, `account`, `verification`, `passkey`).

Lokal startet `npm run db` eine echte MongoDB (via `mongodb-memory-server`) auf
Port 27017 mit Datenverzeichnis `.mongo-data/`. **Nur für die Entwicklung** —
in Produktion gehört dort ein Atlas-Cluster hin.

---

## Authentifizierung

Better Auth ist die einzige Auth-Lösung; es gibt kein zweites User-System.
Zusätzliche Profilfelder hängen über `user.additionalFields` am selben
Datensatz.

Installationsreihenfolge (so aufgebaut):

1. **Infra** — `mongodb`, `@better-auth/mongo-adapter`
2. **Base** — `better-auth`
3. **Admin-Plugin** — Rollen, Rechte, Benutzerverwaltung
4. **Username-Plugin** — eindeutige Handles, Username-Login
5. **Discord** — als Social Provider konfiguriert
6. **Passkey-Plugin** — `@better-auth/passkey` (WebAuthn)

### Rollen

`src/lib/permissions.ts` definiert ein Rechtemodell auf Aktionsebene
(`article:publish`, `user:ban`, …) statt eines einzelnen Admin-Flags:

- `user` — normales Konto
- `editor` — Redaktion (News, Events, Medien), keine Benutzerverwaltung
- `admin` — Redaktion + Benutzerverwaltung + Einstellungen
- `owner` — wie admin, getrennt gehalten für spätere Eigentümerrechte

### Ersten Admin anlegen

1. Unter `/registrieren` ein Konto erstellen.
2. Die `id` aus der `user`-Collection holen.
3. In `ADMIN_USER_IDS` eintragen und neu starten.

Danach können weitere Rollen über `/admin/users` vergeben werden.

### Schutz von `/admin`

Serverseitig in drei Schichten, weil das Verstecken von UI **kein** Schutz ist:

1. `src/app/admin/layout.tsx` ruft `requireAdmin()` bei jedem Request.
2. Jede Server Action ruft zusätzlich `assertAdmin()` — ein POST geht nicht
   durch ein Layout.
3. Die Upload-Endpunkte autorisieren in ihrer `middleware`, bevor eine
   Upload-URL vergeben wird.

---

## Radio

Der Player nutzt ein natives `<audio>`-Element und verbindet sich direkt mit
`https://stream.laut.fm/jannikjbi`. Es gibt **kein** serverseitiges Restreaming.

Audio und Metadaten sind bewusst getrennt (`src/services/radio/`):

- `stream.ts` — nur die Stream-URL
- `metadata.ts` — `current_song`, `last_songs`, `listeners`, Senderdaten
- `schedule.ts` — Sendeplan, rechnet in `Europe/Berlin`
- `index.ts` — ein Snapshot für den Player

Jede Metadatenquelle liefert bei Fehlern `null`. Fällt die laut.fm-API aus,
verschwinden nur Titelanzeige und Sendungsinfos — **der Stream läuft weiter**.

Cover-Art liefert laut.fm nicht; sie kommt aus der öffentlichen iTunes Search
API und ist rein optional.

Der Player hängt im Root-Layout und wird beim Seitenwechsel nie ausgehängt —
Navigation unterbricht die Wiedergabe also nicht. Autoplay gibt es nicht.

---

## Inhalte & CMS

`/admin` bietet Dashboard, News-CRUD, Kategorien, Events, Moderatoren,
Programm, Radio-Status, Medien, Benutzer und Einstellungen.

**Artikel** haben die Status `draft`, `scheduled`, `published`, `archived`.
Öffentliche Abfragen filtern immer auf `status: published` **und**
`publishedAt <= now` — geplante Beiträge gehen dadurch ohne Cronjob live.

**Artikel-HTML wird beim Speichern serverseitig bereinigt** (`sanitize-html`,
strikte Allow-List in `src/app/admin/news/actions.ts`). Das ist die
Sicherheitsgrenze für gespeichertes XSS; der Renderpfad vertraut der Datenbank.

### Bilder

Uploads laufen über UploadThing direkt vom Browser; der Server autorisiert nur
und schreibt den Medien-Datensatz. Im Editor gibt es „Titelbild" und „Bild
einfügen" (setzt ein `<figure>` an der Cursorposition).

Fehlt ein Bild, greift eine Kette:

1. hochgeladenes Bild
2. bei Moderatoren: Discord-Avatar (braucht `DISCORD_BOT_TOKEN`)
3. der gebrandete Platzhalter (`ImagePlaceholder`)

> **Hinweis zu den Demo-Bildern:** Die Seed-Artikel nutzen `picsum.photos` mit
> festen Seeds — echte Fotos, aber **nicht thematisch passend**. Sie sind
> Platzhalter, bis echte Bilder über das Admin hochgeladen werden.
> Moderatoren bekommen bewusst *kein* Zufallsfoto: ein fremdes Stockporträt
> wäre irreführender als ein ehrlicher Platzhalter.

---

## Design

UI-Bibliothek ist **HeroUI v3** (`@heroui/react`, `@heroui/styles`) auf
**Tailwind CSS 4**. Die Doku liegt fuer Agenten im Projekt
(`npx heroui-cli@latest agents-md --react --output docs/AGENTS-HEROUI.md`,
Dateien unter `.heroui-docs/`, nicht eingecheckt).

Drei Farben aus den Logo-Dateien:

```
Tinte  #0E0F12
Gelb   #FFD60A   Senderfarbe
Papier #F5F5F0
```

Gelb ist immer eine **Fläche mit Tinte darauf**. Gelbe Schrift auf hellem
Grund gibt es nicht; Text in Senderfarbe steht im Hellmodus in dunklem
Bernstein (`text-accent-text`). Die HeroUI-Variablen (`--background`,
`--surface`, `--accent`, `--muted` …) setzt `src/styles/theme.css` für hell
und dunkel.

**Dunkel ist Standard.** Das Theme liegt in einem **Cookie** (`voltfm-theme`),
nicht in `localStorage` — so kennt der Server es beim Rendern und setzt
`data-theme` und die Klasse `dark`/`light` schon im HTML: kein Flash, kein
Hydration-Mismatch. Die Bühne auf Startseite und `/radio`, die Player-Leiste
und die Fehlerseiten sind immer dunkel (`class="dark"` am Abschnitt).

Schrift: Archivo, variabel in Stärke und Breite. Große Überschriften
`font-display` (Breite 125 %, Stärke 800), kleinere `font-wide`.

Bausteine:

- `ButtonLink` — Link mit HeroUI-Knopfoptik (`buttonVariants`)
- `PageHeader`, `SectionHeader`, `EmptyState` — `src/components/common/`
- Formularfelder für Server Actions — `src/components/common/form-field.tsx`
  (native Felder mit HeroUI-Klassen, damit `FormData` ankommt)
- `.vfm-prose` — Lesetext für Artikel- und Event-HTML (`src/styles/prose.css`)

---

## Deployment (Vercel)

Das Projekt ist Vercel-ready: kein persistentes Dateisystem, keine lokalen
Serverprozesse, keine Secrets im Code.

1. Repository importieren.
2. Alle Variablen aus `.env.example` in den Projekt-Einstellungen setzen.
3. `BETTER_AUTH_URL` und `NEXT_PUBLIC_SITE_URL` auf `https://voltfm.xyz`.
4. In der Discord-App unter *OAuth2 → Redirects* eintragen:
   `https://voltfm.xyz/api/auth/callback/discord`
5. Deployen, danach einmal `npm run seed` gegen die Produktionsdatenbank.

---

## Troubleshooting

**`Environment variable MONGODB_URI is missing`**
`.env.local` fehlt oder ist leer. `cp .env.example .env.local`.

**Seiten sind leer / keine Artikel**
Läuft `npm run db`? Wurde `npm run seed` ausgeführt? Inhaltsabfragen fangen
Datenbankfehler ab und liefern leere Listen, damit die Seite nicht abstürzt —
Details stehen im Serverlog.

**Kein Discord-Button auf `/login`**
`DISCORD_CLIENT_ID` oder `DISCORD_CLIENT_SECRET` fehlt.

**Upload schlägt fehl**
`UPLOADTHING_TOKEN` fehlt, oder das Konto ist kein Admin.

**Passkey lässt sich nicht anlegen**
WebAuthn braucht `https` (oder `localhost`) und ein Gerät mit
Authenticator.

**Titelanzeige leer, Stream läuft**
Die laut.fm-API ist gerade nicht erreichbar. Gewolltes Verhalten.

**Port 27017 belegt**
Eine andere MongoDB läuft. Entweder die nutzen oder
`DEV_DB_PORT=27018 npm run db` und `MONGODB_URI` anpassen.
