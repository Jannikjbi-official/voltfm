# VoltFM — Leitfaden für KI-Agenten

Diese Datei beschreibt, worauf bei Arbeiten an VoltFM zu achten ist. Sie wird
über `CLAUDE.md` automatisch geladen. `AGENTS.md` daneben wird von `next dev`
generiert und darf nicht von Hand gepflegt werden.

Wenn eine Regel hier mit einer Anweisung des Nutzers kollidiert, gewinnt der
Nutzer — aber sag ihm vorher, welche Regel du dafür brichst.

---

## 1. Der Rahmen

| Thema | Stand |
| --- | --- |
| Framework | Next.js 16 (App Router, React 19, Server Actions) |
| Sprache | TypeScript, `strict` |
| UI | OlyxUI auf Base UI (`src/components/ui/**`) + CSS Modules |
| Auth | Better Auth (Admin-, Username-, Passkey-, Discord-Plugin) |
| Datenbank | MongoDB (Atlas), Zugriff nur über `src/db/collections.ts` |
| Uploads | UploadThing, ausgeliefert über `/api/bilder/<kennung>` |
| Radio | laut.fm (Metadaten serverseitig, Wiedergabe verlinkt) |
| Sprache im UI | Deutsch, Du-Form |

**Next.js 16 ist nicht das Next.js aus deinem Trainingsdatensatz.** Bevor du
Routing, Caching, `params`/`searchParams`, Server Actions oder Metadata
anfasst: lies die passende Datei unter `node_modules/next/dist/docs/`.

---

## 2. Die drei Regeln, die immer gelten

### 2.1 Autorisierung passiert auf dem Server, in jeder Aktion

Das Admin-Layout prüft die Rolle — das schützt **nur die Seite**. Eine Server
Action ist ein POST, der direkt aufgerufen werden kann. Deshalb beginnt jede
Admin-Action mit:

```ts
try {
  await assertAdmin();
} catch (error) {
  if (error instanceof AuthorizationError) return { status: "error", message: error.message };
  throw error;
}
```

Versteckte UI ist nie ein Schutz. Wenn die Oberfläche etwas verhindert
(z. B. sich selbst degradieren oder sperren), muss der Server es ebenfalls
verhindern — siehe `src/app/admin/users/actions.ts`.

### 2.2 Geschrieben wird Markdown, gespeichert wird bereinigtes HTML

Im Editor steht Markdown. Beim Speichern läuft der Text durch
`renderRichText` in `src/lib/sanitize.ts`: erst `markdownToHtml`
(`src/lib/markdown.ts`), dann `sanitizeHtml` gegen eine feste Liste. Die
Reihenfolge ist keine Geschmacksfrage — der Konverter soll nicht für
Sicherheit geradestehen müssen.

Artikel- und Event-Inhalte werden mit `dangerouslySetInnerHTML` ausgegeben.
Die Sicherheitsgrenze ist deshalb `RICH_TEXT_SANITIZE_OPTIONS` — **eine**
Liste für beide, bewusst nicht je Action eine eigene.

Gespeichert werden zwei Felder: `content` ist das bereinigte HTML und wird
gerendert, `contentSource` der getippte Text und erscheint beim Bearbeiten
wieder. Beiträgen aus der HTML-Zeit fehlt `contentSource`; der Konverter
reicht Blöcke, die mit `<` beginnen, unverändert durch, deshalb lassen sie
sich weiter öffnen und speichern.

Wenn du ein neues Tag, Attribut oder eine neue CSS-Klasse zulässt, gehören
zwei Stellen zusammen:

1. `RICH_TEXT_SANITIZE_OPTIONS` — `allowedTags`, `allowedAttributes`,
   `allowedClasses`
2. `src/styles/editor-content.css` — wie es aussieht (global, weil CSS Modules
   die Klassennamen sonst hashen würden)

Fehlt Schritt 1, verschwindet die Formatierung beim Speichern kommentarlos.

Die Vorschau im Editor läuft über die Server Action `previewRichText` und
damit durch denselben Weg — sie zeigt das Ergebnis, nicht etwas Ähnliches.

### 2.3 Externe Ressourcen erst nach Einwilligung

Alles, was den Browser des Besuchers mit einem Dritten verbindet, braucht eine
Einwilligung, **bevor** die Verbindung aufgebaut wird. Muster:
`src/components/radio/player-provider.tsx` + `stream-consent.tsx`.

Metadaten holt der Server (`/api/radio/now`) — dafür braucht es keine
Einwilligung, und das soll auch so bleiben.

Aus demselben Grund werden **Bilder nicht direkt von UploadThing geladen**.
`registerImage` in `src/lib/images.ts` legt zu jedem Upload eine Zufallskennung
an; gespeichert und ausgeliefert wird `/api/bilder/<kennung>`, die Route
schlägt den Schlüssel serverseitig nach. Speichere nie eine `ufs.sh`-Adresse in
einem Inhalt, und baue keinen Rückfall auf `res[0].ufsUrl` in einen
Upload-Aufruf — beides umgeht die Umleitung still und leise.

---

## 3. laut.fm: nicht einbetten, nur verlinken

laut.fm untersagt in § 6 Abs. 9 der Nutzungsbedingungen ausdrücklich, ihre
Audiostreams auf fremden Webseiten einzubinden. Erlaubt ist nur das Verlinken,
wenn dabei laut.fm geöffnet bzw. ein separates Fenster verwendet wird.

Deshalb:

- `radio.embedAllowed` in `src/lib/site.ts` ist **false** (gesteuert über
  `NEXT_PUBLIC_RADIO_EMBED`).
- Solange der Wert false ist, wird **kein `<audio>`-Element gerendert**. Der
  Play-Button ist ein `<a target="_blank">` auf `https://laut.fm/<station>`.
- Der eingebaute Player ist nicht gelöscht, sondern abgeschaltet. Erst wenn
  VoltFM über einen Anbieter sendet, dessen Lizenz die Wiedergabe auf der
  eigenen Seite abdeckt, wird der Schalter auf `true` gesetzt.

**Baue keinen Player, der den laut.fm-Stream direkt abspielt** — auch nicht
„nur zum Testen" im committeten Code, und auch nicht über einen Proxy. Wenn der
Nutzer darum bittet, weise auf § 6 Abs. 9 hin und biete den Schalter an.

---

## 4. Muster, die es schon gibt — bitte nutzen statt neu bauen

| Zweck | Datei |
| --- | --- |
| CRUD-Maske (Liste + Formular + Löschen) | `src/components/admin/entity-manager.tsx` |
| Feldbeschreibung dafür | `src/components/admin/entity-types.ts` |
| Textfeld mit Markdown, Bild-Upload, Vorschau | `src/components/admin/rich-text-editor.tsx` |
| Was im Textfeld funktioniert (Spickzettel) | `/admin/markdown`, Quelle: `src/app/admin/markdown/examples.ts` |
| Bildkennungen und Auslieferung | `src/lib/images.ts`, `src/app/api/bilder/[kennung]/route.ts` |
| Markdown → HTML → bereinigt | `src/lib/sanitize.ts`, `src/lib/markdown.ts` |
| Bild als `<figure>` einfügen | `src/components/admin/image-dialog.tsx` |
| Einzelnes Bildfeld (Upload) | `src/components/admin/image-upload.tsx` |
| Typisierte Collection-Zugriffe | `src/db/collections.ts` |
| Lesen für die öffentliche Seite | `src/services/content/**` |
| Datum/Zeit formatieren | `src/lib/format.ts` |
| Rollen und Rechte | `src/lib/permissions.ts` |
| Session-Guards | `src/lib/session.ts` |
| Statische Sender-/Betreiberdaten | `src/lib/site.ts` |

Eine neue Admin-Verwaltung ist normalerweise: Action-Datei schreiben, `FieldDef[]`
definieren, `<EntityManager />` rendern. Kein eigenes Formular.

---

## 5. Daten und Zeitzonen

- Mongo-Dokumente enthalten `ObjectId` und `Date`. Beides darf **nicht** an eine
  Client-Komponente. Immer durch `serialize`/`serializeAll` schicken
  (`_id` → `id`, `Date` → ISO-String).
- Zeiten werden als UTC gespeichert, aber als **Senderzeit (Europe/Berlin)**
  eingegeben und angezeigt. Für `<input type="datetime-local">` gibt es
  `parseStationTime` und `toStationTimeInput` in `src/lib/format.ts`.
  `new Date("2026-06-01T20:00")` ist falsch — das nimmt die Zeitzone des
  Servers, und der läuft auf Vercel in UTC.
- Slugs entstehen mit `slugify` (deutsche Umlaute werden transliteriert) und
  sind pro Collection unique. Ein `E11000` beim Schreiben ist ein
  Slug-Konflikt und bekommt eine verständliche Meldung, keinen Stacktrace.
- Nach jedem Schreiben die betroffenen Pfade `revalidatePath`en — sonst zeigt
  die öffentliche Seite alte Daten.

---

## 6. Rechtliches und Betreiberdaten

- Name, Anschrift und E-Mail des Betreibers stehen **nur** in `operator` in
  `src/lib/site.ts`. Nirgends hart kodieren.
- Impressum (§ 5 DDG, § 18 Abs. 2 MStV) und Datenschutzerklärung müssen
  beschreiben, was die Anwendung **tatsächlich** tut. Wenn du eine neue externe
  Abhängigkeit, ein neues Cookie oder eine neue Speicherung einbaust: die
  Datenschutzerklärung im selben Zug ergänzen.
- `site.mailOutage` ist true, solange der Mailserver hinter
  `site.stationEmail` ausgefallen ist. Jede Stelle, die diese Adresse zeigt,
  muss den Hinweis mitzeigen. `site.contactEmail` ist die Adresse, die
  funktioniert — die gehört ins Impressum.

---

## 7. UI-Konventionen

- **Keine Inline-Styles und keine Utility-Klassen.** CSS Modules neben der
  Komponente, Werte aus den Design-Tokens (`var(--color-…)`, `var(--spacing-…)`,
  `var(--type-…)`, `var(--radius-…)`).
- Komponenten aus `src/components/ui/**` sind die OlyxUI-Bausteine. Sie werden
  benutzt, nicht editiert, solange es nicht ausdrücklich darum geht.
- Media Queries in einem CSS Module gelten für das **ganze Modul**. Wenn eine
  Regel nur für eine Ansicht gilt, muss sie entsprechend verschachtelt werden.
  (Genau das war der Fehler, durch den der Lautstärkeregler auch auf `/radio`
  verschwand, obwohl nur die Sticky-Leiste gemeint war.)
- Licht- und Dunkelmodus laufen über `data-theme` am `<html>`. Neue Farben
  immer als Token, nie als Literal.
- Texte sind deutsch, Du-Form, ohne Ausrufezeichen-Ton. Typografische
  Anführungszeichen im JSX als `&bdquo;` / `&ldquo;` — ESLint
  (`react/no-unescaped-entities`) besteht darauf.

---

## 8. Bevor du fertig meldest

```bash
npm run typecheck
```

```bash
npx eslint src scripts
```

```bash
npm run build
```

Alle drei müssen sauber durchlaufen. Wenn die Änderung im Browser sichtbar ist,
zusätzlich `npm run dev` starten und tatsächlich anschauen — nicht den Nutzer
bitten, es zu prüfen.

Nützliche Skripte:

| Befehl | Zweck |
| --- | --- |
| `npm run dev` | Entwicklungsserver |
| `npm run db` | lokale MongoDB im Speicher |
| `npm run seed` | Demo-Inhalte (überschreibt Demo-Daten per Slug) |
| `npm run seed:categories` | nur die Kategorien, für echte Datenbanken |
| `npm run make-admin` | Benutzer zum Admin machen |

---

## 9. Häufige Fallstricke

- **`"use server"`-Dateien dürfen nur async Funktionen exportieren.** Konstanten
  und Typen gehören in eine Nachbardatei (siehe `admin/users/roles.ts`).
- **`ADMIN_USER_IDS`** hebelt Rollen aus. Wer dort steht, bleibt Admin, egal was
  in der Datenbank steht. `isAdminUser` berücksichtigt das — eigene Prüfungen,
  die nur `role` lesen, sind falsch.
- **Better Auth Account-Linking:** Beim expliziten Verknüpfen im Konto darf die
  E-Mail abweichen (`allowDifferentEmails: true`), beim automatischen Verknüpfen
  während der Anmeldung nicht. Diese Unterscheidung nicht aufweichen.
- **Rollenwechsel wirken nicht sofort.** Better Auth liefert die Sitzung samt
  `role` bis zu fünf Minuten aus einem signierten Cookie aus
  (`session.cookieCache`), ohne die Datenbank zu fragen. Wer gerade angemeldet
  ist, behält so lange seine alte Rolle. Deshalb beendet `setUserRole` die
  Sitzungen der betroffenen Person — wer Rechte ändert, muss das mitmachen.
- **`listShows()`** liefert nur aktive Sendungen (öffentliche Ansicht). Für das
  Admin gibt es `adminListShows()`.
- **UploadThing-Löschungen** können fehlschlagen, ohne dass die Datenbank falsch
  wird — erst den Datensatz löschen, dann die Datei, und den Teilerfolg
  ehrlich melden.
- **Bilder ohne Alt-Text** sind nicht akzeptabel. Den erzwingenden Dialog gibt
  es nicht mehr — Bilder landen per Ziehen, Einfügen oder Knopfdruck direkt im
  Text. Stattdessen weist `findImageWithoutAlt` in `src/lib/sanitize.ts` einen
  Beitrag zurück, dessen Bild keine oder nur die Platzhalter-Beschreibung hat.
  Diese Prüfung gehört in jede Action, die Text mit Bildern speichert.
- **Neue Markdown-Konstrukte** gehören in `src/lib/markdown.ts`, ihre
  Formatierung in `src/styles/editor-content.css`, ihre Tags in
  `RICH_TEXT_SANITIZE_OPTIONS` — und ein Beispiel in
  `src/app/admin/markdown/examples.ts`. Die Seite rendert jedes Beispiel
  tatsächlich, also fällt dort sofort auf, wenn eine der drei Stellen fehlt.
