ONE MORE DAY – CLOUDFLARE v0.7.0

1. migration-v0.7.0.sql in D1 ausführen.
2. Worker-Secret ADMIN_KEY anlegen.
3. worker-v0.7.0-integration.js in den bestehenden Worker integrieren.
   NICHT den bisherigen Worker damit ersetzen.
4. Worker deployen.
5. PWA v0.7.0 deployen.
6. Auf dem ADMIN-Gerät die PWA einmal mit ?admin=1 öffnen.
7. ADMIN öffnen, ADMIN_KEY eintragen und den Status prüfen.

Für den Testtag 22.09.2026 setzt die Migration bereits FREI.

WICHTIG:
- Die day_statuses-Tabelle und die API-Routen sind dauerhaft verwendbar.
- X-Admin-Key ist nur die erste Authentifizierungsschicht. Bei späterer Geräteauthentifizierung
  wird nur die Zugriffsprüfung ersetzt; Datenmodell, Admin-UI und Statuslogik bleiben bestehen.
