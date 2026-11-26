## Automatisch veröffentlichen (Standard)

voltfm.xyz läuft auf dem eigenen Server in Docker (`docker-compose.yml`: Mongo,
Seite, Cron, Discord-Bot aus `discord-bot/`). Der Ordner `/opt/voltfm` ist ein
Git-Checkout dieses Repos.

**Alles, was auf `main` landet, geht von selbst live.** Ein Timer auf dem Server
(`voltfm-deploy.timer`) schaut alle 2 Minuten nach neuen Commits. Gibt es einen,
baut er Seite und Bot neu, führt `npm run migrate` aus und startet beides neu.
Das dauert etwa 5 Minuten. Schlägt Build oder Migration fehl, läuft die
bisherige Version weiter.

- Log: `/var/log/voltfm-deploy.log`
- Sofort statt in 2 Minuten: `systemctl start voltfm-deploy`
- Geheimnisse stehen nur in `/opt/voltfm/.env` (Admin-Panel), nie im Repo.
  Das Repo ist öffentlich.
- Direkt auf dem Server nichts im Code ändern: Der nächste Deploy setzt den
  Ordner auf den Stand von `main` zurück. Änderungen immer über GitHub.

Die Anleitung unten für Änderungs-ZIPs gilt nur noch, falls der automatische
Weg einmal nicht geht.

## Was auf dem Server zu tun ist

VoltFM läuft auf einem eigenen Server (Node.js, `next start`), nicht mehr auf
Vercel. Diese Anleitung gilt für jede Änderungs-ZIP.

1. **Sichern.** Projektordner und Datenbank sichern (z. B. `mongodump`).
2. **Dateien übernehmen** — eine der beiden Möglichkeiten:
   - mit Git: im Projektordner `git apply --index aenderungen.patch`
     (prüfen vorher mit `git apply --check aenderungen.patch`), oder
   - ohne Git: alles aus `dateien/` mit gleichem Pfad in den Projektordner
     kopieren und überschreiben, danach jede Datei aus `geloescht.txt`
     im Projektordner löschen.
3. **Pakete.** Steht `package.json` oder `package-lock.json` in der
   Dateiliste: `npm ci`.
4. **Umgebungsvariablen** (`.env` bzw. die Dienst-Konfiguration):
   - `VOLTFM_ENV=production` auf voltfm.xyz, `VOLTFM_ENV=dev` auf einer
     Testseite. Ohne diesen Wert postet die Seite nichts in den Discord
     (News-Ankündigungen, Vorschläge) und hält sich für einen lokalen Rechner.
   - Weitere neue Variablen stehen unten bei den Hinweisen zu dieser Änderung.
5. **Datenbank.** `npm run migrate` — legt neue Indexe an und spielt
   ausstehende Inhalte ein. Läuft mehrfach ohne Schaden.
6. **Bauen.** `npm run build` — muss ohne Fehler durchlaufen.
7. **Neu starten.** Den laufenden Prozess neu starten (je nach Server z. B.
   `pm2 restart voltfm` oder `systemctl restart voltfm`).
8. **Prüfen.** Startseite, `/radio`, `/admin` aufrufen. Bei Fehlern:
   Logs des Prozesses ansehen, notfalls die Sicherung zurückspielen.
