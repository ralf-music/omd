ONE MORE DAY v0.1.3

Dateien auf einen HTTPS-Webspace hochladen (z.B. GitHub Pages / Netlify).
Geolocation funktioniert im Browser nur über HTTPS (localhost ist die übliche Entwicklungs-Ausnahme).

WORK-Zone: Hasenackerstraße 17, Mannheim – 1.500 m Radius
HOME-Zone: Dänischer Tisch 50, Mannheim – 1.500 m Radius

Zeitlogik:
- vor 13:00 Uhr -> nur WORK kann bestätigt werden
- ab 13:00 Uhr -> nur HOME kann bestätigt werden
- Daily Reward erst nach beiden Checks

Speicherung in v0.1.3: localStorage auf dem Gerät.

Testtag: Am 14.09.2026 ist WORK automatisch erfüllt; HOME muss regulär bestätigt werden. Ab 15.09.2026 gelten die normalen Regeln.


v0.1.3:
- Startseiten-Logo deutlich groesser und zentriert dargestellt.
- Pink-Glow am Logo verstaerkt, Titel/Claim neu angeordnet.


v0.1.3
- Song of the Day zeigt nach Möglichkeit das originale Spotify-Cover via Spotify oEmbed.
- Mehrere Spotify-Suchlinks auf direkte Track-Links umgestellt.
- Fallback-Anzeige ergänzt, falls für einen Eintrag noch kein direktes Cover auflösbar ist.
