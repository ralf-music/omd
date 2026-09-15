ONE MORE DAY v0.2.0

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
- In v0.2.0 liegen die Zielwerte übergangsweise verschleiert im Frontend. In der Cloud-Phase wandert die Prüfung vollständig in den geschützten Worker.

Work Wallet:
- +0,50 EUR pro vollständig abgeschlossenem Arbeitstag (WORK + HOME).
- +2,00 EUR nur bei einer vollständigen erfolgreichen Montag-bis-Freitag-Woche.
- Buchungen werden in einem lokalen Transaktions-Ledger gespeichert und anhand eindeutiger IDs gegen Doppelbuchungen geschützt.
- Später wird das Ledger serverseitig in Cloudflare D1 geführt.

Abwesenheiten:
- Die bisherige lokale Pause-Funktion bleibt in v0.2.0 aus Kompatibilitätsgründen erhalten.
- Später werden Frei / Urlaub / Krank nur noch als Anfrage gespeichert und müssen in der Admin-PWA freigegeben werden.

Speicherung in v0.2.0:
- weiterhin localStorage auf dem Gerät
- Datenstruktur bereits für spätere Migration vorbereitet

Testtag:
- 14.09.2026: WORK wird für bestehende Installationen weiterhin einmalig als erfüllt angelegt.
- ab 15.09.2026 gelten die normalen Regeln.

CHANGELOG v0.2.0
- Wallet-Ledger und sichtbares Guthaben eingeführt.
- 0,50 EUR Tagesgutschrift und 2,00 EUR Perfect-Week-Bonus implementiert.
- HOME ohne vorheriges WORK blockiert.
- Missionen auf Montag bis Freitag begrenzt.
- Wochenabschluss verlangt tatsächlich fünf erfolgreiche Tage.
- Klartext-Adressen entfernt.
- Geo-Konfiguration für spätere serverseitige Prüfung vorbereitet.
- interne Daten-Schema-Version eingeführt.
