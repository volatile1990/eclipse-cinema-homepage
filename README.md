# Eclipse Homecinema

Öffentliche GitHub-Pages-Homepage für `eclipse-homecinema.de` mit dem privaten Mitgliederportal unter `/portal/`.

## Aufbau

- `/` enthält die statische Marketing-Homepage.
- `/app/` enthält Datenschutz, Support und Kontolöschung.
- `/portal/` enthält den produktiven Expo-Webexport des Eclipse-Cinema-Portals.
- `404.html` liefert für direkte `/portal/**`-Aufrufe die SPA-Shell aus.
- `.nojekyll` hält die Expo-Assets unter `/portal/_expo/` erreichbar.

Der Portal-Quellcode wird bewusst nicht in dieses öffentliche Repository übernommen. Der aktuelle Export basiert auf dem privaten App-Commit `ffbf5ade3e422c621e4d35811b1bed095ff03f4a` und enthält keine Home-Assistant-Anbindung.

## Betrieb

GitHub Pages kann weiterhin direkt aus dem Root der veröffentlichten Branch bereitstellen. Für Anmeldung, Registrierung und Passwort-Wiederherstellung müssen in Supabase folgende URLs freigegeben sein:

- Site URL: `https://eclipse-homecinema.de/portal/`
- Redirect URL: `https://eclipse-homecinema.de/portal/auth/callback`

Der Browser-Build enthält ausschließlich die öffentlichen Supabase- und OAuth-Clientwerte. Service-Role-, TMDB-, E-Mail- und Home-Assistant-Secrets dürfen nie in den Webexport gelangen.

Nach einem neuen Portalexport müssen `portal/index.html`, `portal/auth/callback.html`, `404.html` und der Cache-Name beziehungsweise Bundlepfad in `portal/sw.js` gemeinsam aktualisiert werden.
