ONE MORE DAY v0.3.3

Erste Cloud-Geo-Version.

Geo-Logik:
- ARBEIT und ZUHAUSE verwenden weiterhin je 1.500 m Radius.
- vor 13:00 Uhr -> ARBEIT
- ab 13:00 Uhr -> ZUHAUSE, aber nur wenn ARBEIT am selben Tag bereits bestätigt wurde
- Standort wird ausschließlich beim aktiven Tippen geprüft. Keine Hintergrund-Ortung.
- Die PWA ermittelt nur die aktuelle Geräteposition und sendet latitude, longitude und accuracy an die Cloudflare API.
- Die privaten Zielkoordinaten befinden sich nicht mehr im Frontend. Sie liegen ausschließlich als Worker-Secrets bei Cloudflare.
- API: https://one-more-day-api.ralf-music.workers.dev/api/v1
- Nur accepted=true darf ARBEIT/ZUHAUSE lokal verbuchen. Fehler, zu ungenaue Positionen, nicht erreichbare API oder Position außerhalb des Radius gelten niemals als Erfolg.

Rückmeldung:
- neutral während der laufenden Standortprüfung
- grün bei erfolgreicher serverseitiger Geo-Prüfung
- rot bei außerhalb des Gebiets, zu ungenauem GPS, fehlender Berechtigung oder technischem Fehler

Arbeitsguthaben:
- +0,50 EUR pro vollständig abgeschlossenem Arbeitstag (ARBEIT + ZUHAUSE).
- +2,00 EUR nur bei einer vollständigen erfolgreichen Montag-bis-Freitag-Woche.
- Ledger bleibt in v0.3.0 noch lokal und wird in einer späteren Cloud-Stufe nach D1 migriert.

Startmigration:
- 14.09.2026 und 15.09.2026 bleiben vollständig erfolgreich.
- Beide Tagesbelohnungen und insgesamt 1,00 EUR Startguthaben bleiben erhalten.
- Regulärer Geo-Betrieb ab 16.09.2026.

Weitere bestehende Funktionen:
- Historische Tagesbelohnungen über Wochenfortschritt und Zuletzt freigeschaltet
- Songpool und Reward-Zuordnungen bleiben erhalten
- lokale Pause-Funktion bleibt vorerst aus Kompatibilitätsgründen erhalten

CHANGELOG v0.3.0
- Geo-Prüfung von lokal auf Cloudflare Worker API umgestellt.
- Zielkoordinaten vollständig aus data.js / öffentlichem Frontend entfernt.
- ARBEIT/ZUHAUSE werden nur bei accepted=true verbucht.
- Grüne Erfolgsmeldung und rote Fehlermeldung für Geo-Prüfungen ergänzt.
- Aktuelles Datum im Header vergrößert und mit pinkem Glow hervorgehoben.
- Service-Worker-Cache auf omd-v0.3.0 aktualisiert.


CHANGELOG v0.3.3
- Separate Joey-Motivationskarte unter dem Datum entfernt.
- Joey-Kelly-Motiv im Header direkt antippbar gemacht.
- Antippen öffnet weiterhin die bestehende Vollbildansicht.
- Service-Worker-Cache auf omd-v0.3.3 aktualisiert.
