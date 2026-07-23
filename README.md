# Eclipse Homecinema

Öffentliche GitHub-Pages-Homepage für `eclipse-homecinema.de` mit dem privaten Mitgliederportal unter `/portal/`.

## Aufbau

- `/` enthält die statische Marketing-Homepage.
- `/app/` enthält Datenschutz, Support und Kontolöschung.
- `/portal/` enthält den produktiven Expo-Webexport des Eclipse-Cinema-Portals.
- `404.html` liefert für direkte `/portal/**`-Aufrufe die SPA-Shell aus.
- `.nojekyll` hält die Expo-Assets unter `/portal/_expo/` erreichbar.

Der Portal-Quellcode liegt lokal im ignorierten Verzeichnis `portal-app/` und wird nicht als Quelltext veröffentlicht. Getrackt wird ausschließlich der für den Browser erzeugte Export unter `portal/`.

## Betrieb

GitHub Pages kann weiterhin direkt aus dem Root der veröffentlichten Branch bereitstellen. Für Anmeldung, Registrierung und Passwort-Wiederherstellung müssen in Supabase folgende URLs freigegeben sein:

- Site URL: `https://eclipse-homecinema.de/portal/`
- Redirect URL: `https://eclipse-homecinema.de/portal/auth/callback`

Der Browser-Build enthält ausschließlich die öffentlichen Supabase- und OAuth-Clientwerte. Service-Role-, TMDB-, E-Mail- und Home-Assistant-Secrets dürfen nie in den Webexport gelangen.

Ein neuer Portalexport wird aus dem Repository-Root mit zwei Schritten erzeugt und synchronisiert:

```powershell
npm --prefix portal-app run export:web
powershell -NoProfile -ExecutionPolicy Bypass -File tools/sync-portal-export.ps1
```

Das Synchronisationsskript aktualisiert den gehashten Bundlepfad in `404.html` und `portal/sw.js`, übernimmt die OAuth-Callback-Shell und erzeugt 200-fähige HTML-Aliase für alle stabilen Portalrouten. Datenabhängige Detailrouten verwenden weiterhin die SPA-Shell aus `404.html`.
