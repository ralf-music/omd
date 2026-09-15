ONE MORE DAY v0.2.2

Fundament-Version für die schrittweise Migration auf Cloudflare.

Installation:
- Dateien auf einen HTTPS-Webspace hochladen (z. B. GitHub Pages).
- Geolocation funktioniert im Browser nur über HTTPS; localhost ist die übliche Entwicklungs-Ausnahme.

Geo-Logik:
- Es werden keine Klartext-Adressen in README oder Frontend-Konfiguration gespeichert.
- WORK und HOME verwenden weiterhin je 1.500 m Radius.
- vor 13:00 Uhr -> WORK
- ab 13:00 Uhr -> HOME, aber nur wenn WORK am selben Tag bereits bestätigt wurde
- Standort wird ausschließlich beim aktiven Tippen geprüft. Keine Hintergrund-Ortung.
- In v0.2.2 liegen die Zielwerte übergangsweise verschleiert im Frontend. In der Cloud-Phase wandert die Prüfung vollständig in den geschützten Worker.

Arbeitsguthaben:
- +0,50 EUR pro vollständig abgeschlossenem Arbeitstag (WORK + HOME).
- +2,00 EUR nur bei einer vollständigen erfolgreichen Montag-bis-Freitag-Woche.
- Buchungen werden in einem lokalen Transaktions-Ledger gespeichert und anhand eindeutiger IDs gegen Doppelbuchungen geschützt.
- Später wird das Ledger serverseitig in Cloudflare D1 geführt.

Startmigration:
- 14.09.2026 wird als vollständig erfolgreicher Arbeitstag übernommen und erhält rückwirkend Tagesbelohnung + 0,50 EUR.
- 15.09.2026 wird ebenfalls als vollständig erfolgreicher Arbeitstag übernommen und erhält rückwirkend Tagesbelohnung + 0,50 EUR.
- Das Arbeitsguthaben startet damit mit 1,00 EUR.
- Beide Tage zählen als erfolgreiche Tage der laufenden Montag-bis-Freitag-Woche.
- Ab 16.09.2026 beginnt der reguläre Betrieb mit WORK -> HOME und den normalen Geo-Regeln.

Abwesenheiten:
- Die bisherige lokale Pause-Funktion bleibt in v0.2.2 aus Kompatibilitätsgründen erhalten.
- Später werden Frei / Urlaub / Krank nur noch als Anfrage gespeichert und müssen in der Admin-PWA freigegeben werden.

Speicherung in v0.2.2:
- weiterhin localStorage auf dem Gerät
- Datenstruktur bereits für spätere Migration vorbereitet

CHANGELOG v0.2.2
- Startmigration für 14.09.2026 und 15.09.2026 eingeführt.
- Beide Starttage vollständig erfüllt und Tagesbelohnungen rückwirkend freigeschaltet.
- Startguthaben dadurch 1,00 EUR.
- Regulärer Geo-Betrieb ab 16.09.2026.
- Bereichsüberschriften ins Deutsche übersetzt.
- bisherigen Einzel-Testpatch vom 14.09.2026 entfernt.


CHANGELOG v0.2.2
- Songpool auf 37 direkte Spotify-Tracks erweitert.
- Spotify-Suchlinks aus dem produktiven Pool entfernt.
- 10-Tage-Songsperre eingeführt.
- Interpret darf maximal drei Tage in Folge erscheinen.
- Start-Rewards 14./15.09.2026 werden auf die neue Songauswahl migriert; Wallet bleibt unverändert.
- Optionale Bildinformationen fuer eindeutig dokumentierte Aufnahmen ergaenzt.
