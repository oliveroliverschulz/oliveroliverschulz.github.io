# Oliver Schulz — Website

Künstler-Website nach dem Vorbild von jaygard.de: plain weiß, Helvetica, keine Effekte, kein Tracking, keine Cookies (→ kein Cookie-Banner nötig).

## Lokal starten

`start-oliver.bat` im Workspace-Ordner doppelklicken → öffnet das Dashboard auf
http://localhost:8282/dashboard.html (Website: http://localhost:8282)

Läuft parallel zu Krachym (Port 8181).

## Struktur

- `content.json` — **alle Inhalte** (wird vom Dashboard bearbeitet)
- `index.html` / `exhibitions.html` / `projects.html` / `project.html` / `about.html` / `contact.html` / `impressum.html` / `datenschutz.html` — Seiten (Rendering via `script.js`)
- `project.html?p=<slug>` — Projekt-Unterseiten, kommen automatisch aus content.json
- `dashboard.html` — nur lokal nutzbar (braucht serve.py für Speichern/Upload)
- `images/` — aktuell Platzhalter von picsum.photos, später durch echte Bilder ersetzen

## Datenschutz-Konzept

- Keine externen Fonts, keine Tracker, keine Cookies → kein Cookie-Banner
- YouTube nur als Zwei-Klick-Lösung über youtube-nocookie.com
- Impressum/Datenschutz über das Dashboard editierbar (Platzhalter-Adresse ersetzen!)

## Später einrichten (wenn Zugänge da sind)

1. **GitHub (Olivers Account):** Repo `oliverschulz` anlegen, in diesem Ordner
   `git init` + remote setzen + push, GitHub Pages auf branch `main` aktivieren.
   Danach funktioniert `deploy-oliver.bat`.
2. **Domain bei Strato:** A-Records auf GitHub-Pages-IPs
   (185.199.108.153 / .109. / .110. / .111.) + CNAME `www` → `<account>.github.io`,
   Custom Domain in den Pages-Einstellungen eintragen, CNAME-Datei kommt automatisch.
3. **Newsletter (Brevo):** Konto auf brevo.com anlegen, Anmeldeformular mit
   Double-Opt-in erstellen, dessen Action-URL im Dashboard unter „Newsletter“
   eintragen. Solange das Feld leer ist, zeigt die Seite einen
   „Subscribe by e-mail“-Link als Fallback.

Domainname vorläufig: oschulz.com (noch nicht final).
