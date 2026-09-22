ONE MORE DAY v0.4.4

D1-SYNCHRONISATION – STUFE 1
- Tagesstatus wird mit Cloudflare D1 synchronisiert.
- Bereits geöffnete lokale Reward-Snapshots werden einmalig nach D1 übertragen.
- Existiert in D1 bereits ein Reward, gewinnt der serverseitig verriegelte Snapshot und wird lokal übernommen.
- Neue Rewards werden beim Öffnen serverseitig verriegelt.
- Ledger-Buchungen werden mit eindeutigen IDs nach D1 gespiegelt; 14./15.09.2026 bleiben bei den bereits manuell angelegten D1-Buchungen.
- Nach erfolgreichem Abruf ist der D1-Kontostand maßgeblich für die Gesamtanzeige.
- localStorage bleibt in v0.4.0 als Fallback/Sicherheitsnetz erhalten.


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


CHANGELOG v0.4.0
- Separate Joey-Motivationskarte unter dem Datum entfernt.
- Joey-Kelly-Motiv im Header direkt antippbar gemacht.
- Antippen öffnet weiterhin die bestehende Vollbildansicht.
- Service-Worker-Cache auf omd-v0.4.0 aktualisiert.


v0.4.0: Tagesrewards werden beim ersten Öffnen vollständig als Snapshot fixiert. Bild des Tages kann im aktuellen und historischen Reward im Vollbild geöffnet werden.


CHANGELOG v0.4.1
- Songpool von 74 auf 103 direkte Spotify-Titel erweitert.
- Michael Patrick Kelly deutlich erweitert: Traces, iD, B.O.A.T.S, RUAH und weitere Solo-/Live-Titel.
- The Kelly Family um Klassiker, frühe Aufnahmen und Live-Versionen erweitert; Over The Hump bleibt Schwerpunkt.
- Bereits freigeschaltete Reward-Snapshots bleiben unverändert und D1-verriegelt.
- Service-Worker-Cache auf omd-v0.4.1 aktualisiert.


CHANGELOG v0.4.3
- Erste optische Guthaben-Anforderungsansicht ergänzt.
- Schnellbeträge 1/5/10/20 Euro; nicht verfügbare Beträge werden deaktiviert.
- „Anderer Betrag“ erlaubt freie Eingabe mit Cent.
- Optionales Feld „Wunsch / Verwendungszweck“.
- Noch keine Backend-/Admin-Funktion, keine Reservierung und kein Abzug.
- Songpool mit 103 Titeln unverändert übernommen.


v0.4.3: Einmaliger Mittwoch-Sonderreward für 16.09.2026 mit Witz + verifiziertem Unnützes-Wissen-Eintrag; Auszahlung-Placeholder angepasst.


CHANGELOG v0.4.4
- Buchungshistorie im Arbeitsguthaben ergänzt.
- D1-Wallet-Transaktionen werden mit Datum, Typ und Betrag angezeigt.
- Lokale Ledger-Daten dienen als Fallback, falls die Cloud nicht geladen werden kann.
- Vorbereitete Labels für Tagesbelohnung, Wochenbonus, Überraschungsbonus, Bonus Challenge, Auszahlung und Admin-Korrektur.
- Guthabenanforderung bleibt unverändert reine Vorschau.

CHANGELOG v0.5.0
- Recherchierte Zusatzcontent-Bibliothek als content.js integriert.
- Montag/Mittwoch/Freitag: Bild + Song + 2 Zusatzinhalte.
- Dienstag/Donnerstag: Bild + Song + 1 Zusatzinhalt.
- Mittwoch: ein Witz plus ein Wissens-/Geschichtsinhalt.
- Zusatzcontent wird beim Öffnen vollständig in den unveränderlichen Reward-Snapshot kopiert.
- Der bestehende Sonderreward vom 16.09.2026 bleibt unverändert.
- Keine Cloudflare-/D1-Änderung für dieses Update erforderlich.
- Die geplante 365-Tage-Wiederholungssperre wird in der nächsten Cloud-Stufe serverseitig ergänzt.
- v0.4.4 Buchungshistorie und Guthaben-UI bleiben erhalten.

DATEIEN v0.5.0
GEÄNDERT: index.html, app.js, data.js, sw.js, README.txt
NEU: content.js
GELÖSCHT: Keine


CHANGELOG v0.5.1
- Aktuelle Woche (Mo-Fr) wird beim Start aus der bestehenden D1 Day-API nachgeladen.
- Cloud-Rewards werden für die aktuelle Woche nachgeladen und lokal gespiegelt.
- Frische Browser erkennen damit abgeschlossene Tage, die auf einem anderen Gerät gebucht wurden.
- 'Diese Woche' nutzt bei verfügbarer Cloud die Cloud-Buchungen inklusive Perfect-Week-Bonus.
- Keine Cloudflare-/D1-Änderung erforderlich.

DATEIEN v0.5.1
GEÄNDERT: app.js, index.html, sw.js, README.txt
NEU: Keine
GELÖSCHT: Keine


CHANGELOG v0.5.2
- Qualitätsbereinigung Witz-Pool: 188 -> 80 redaktionell geprüfte, klar erkennbare Witze.
- 108 kurze Sprüche, Pseudo-Witze und schwache Platzhalter entfernt.
- Entfernte joke-* Inhalte werden auch beim Rendern alter Reward-Ansichten ausgeblendet.
- Bildauswahl schließt bereits verwendete Bilddateien aus, solange noch unbenutzte Bilder im Pool vorhanden sind.
- Bestehende D1-Snapshots bleiben unverändert.
- Kein Cloudflare-/D1-Update erforderlich.

DATEIEN v0.5.2
GEÄNDERT: app.js, content.js, data.js, index.html, sw.js, README.txt
NEU: Keine
GELÖSCHT: Keine


CHANGELOG v0.5.3
- Gezielte redaktionelle Korrektur für 21.09.2026.
- Bild des Tages: doppelt verwendetes „The Kelly Family · München“ wird nur für diesen Tag durch „Kelly Family · 1989“ ersetzt.
- Witz: fehlerhafter Pseudo-Witz wird nur für diesen Tag durch joke-001 („Britisch trocken“) ersetzt.
- Andere Zusatzinhalte, Song, Guthaben, Tagesstatus und alle anderen Rewards bleiben unverändert.
- Die Korrektur erfolgt clientseitig; der bestehende D1-Snapshot wird nicht verändert.
- Keine Cloudflare-/D1-Änderung erforderlich.

DATEIEN v0.5.3
GEÄNDERT: app.js, data.js, index.html, sw.js, README.txt
NEU: Keine
GELÖSCHT: Keine


CHANGELOG v0.6.0
- Content-Master direkt in das Projekt integriert.
- 1009 geprüfte Content-Einträge.
- 108 alte Pseudo-Witze bleiben entfernt; 80 redaktionell geprüfte Witze enthalten.
- Neue Themen u. a.: Tier im Fokus, Wer ist eigentlich …?, Wie entstand eigentlich …?,
  Wusstest du eigentlich …?, Kurze Geschichte, Geografie & Länder.
- Sergei Krikalev als Kurzgeschichte aufgenommen:
  Start 18.05.1991 mit Sojus TM-12; Rückkehr 25.03.1992.
- content-master.json ist ab jetzt die kanonische Bibliothek im Projekt.
- content.js enthält denselben Stand in browserfertiger Form.
- Bestehende Funktionen aus v0.5.3 bleiben erhalten.
- Keine Cloudflare-/D1-Änderung erforderlich.

DATEIEN v0.6.0
GEÄNDERT: content.js, data.js, index.html, sw.js, README.txt
NEU: content-master.json
GELÖSCHT: Keine


CHANGELOG v0.7.0
- Admin-Grundsystem für Tagesstatus NORMAL / FREI / URLAUB / KRANK.
- Wochenbonus: 5 Arbeitstage = 2,00 €, 4 = 1,00 €, 3 oder weniger = 0 €.
- KRANK = kein Wochenbonus in dieser Woche.
- FREI / URLAUB = kein Tagesgeld, aber genehmigter neutraler Nicht-Arbeitstag.
- Wochenbonus wird erst gebucht, wenn alle fünf Tage entweder erledigt oder genehmigt geklärt sind.
- Cloud-Status-Synchronisation vorbereitet.
- Cloudflare-Migration und Worker-Integrationsdatei liegen im Projekt unter /cloudflare.
- Testtag 22.09.2026 ist in der SQL-Migration als FREI vorgesehen.
- 1009er Content-Master bleibt integriert.

DATEIEN v0.7.0
GEÄNDERT: app.js, data.js, index.html, styles.css, sw.js, README.txt
NEU: cloudflare/migration-v0.7.0.sql, cloudflare/worker-v0.7.0-integration.js, cloudflare/README-v0.7.0.txt
GELÖSCHT: Keine
- Alte lokale Pause-Eingabe in der User-PWA deaktiviert; Abwesenheiten sind ab v0.7.0 Admin-Sache.


CHANGELOG v0.7.1
- Cloud-Tagesstatus wird in der User-PWA vollständig dargestellt.
- FREI / URLAUB / KRANK: Mission und Tagesbelohnung werden ausgeblendet.
- Pausenbanner zeigt den jeweiligen Status.
- Tagesreward kann an pausierten Tagen auch bei alten lokalen Daten nicht versehentlich freigeschaltet werden.
- Adminbereich und neue Wochenbonuslogik aus v0.7.0 bleiben erhalten.
- Keine weitere Worker-/D1-Änderung erforderlich.

DATEIEN v0.7.1
GEÄNDERT: app.js, data.js, index.html, sw.js, README.txt
NEU: Keine
GELÖSCHT: Keine


CHANGELOG v0.7.2
- User kann FREI / URLAUB / KRANK für ein einzelnes Datum beantragen.
- Antrag wird über POST /api/v1/absence-request als pending gespeichert.
- Adminbereich lädt offene Anträge über GET /api/v1/admin/absence-requests.
- Admin kann Anträge direkt GENEHMIGEN oder ABLEHNEN.
- Genehmigte Anträge übernehmen den serverseitigen Tagesstatus automatisch.
- Wochenfortschritt zeigt FREI / URLAUB / KRANK ausgeschrieben statt F / U / K.
- Keine Worker- oder D1-Änderung für dieses PWA-Update erforderlich; die zuvor getesteten Routen werden genutzt.

DATEIEN v0.7.2
GEÄNDERT: app.js, data.js, index.html, styles.css, sw.js, README.txt
NEU: Keine
GELÖSCHT: Keine

UPLOAD
HOCHLADEN: alle normalen PWA-Dateien und Asset-Ordner.
NICHT HOCHLADEN: cloudflare/ (nur Dokumentation/Backend-Hilfsmaterial).


CHANGELOG v0.7.3
- Kritischer Startfehler aus v0.7.2 behoben.
- Verwaiste Event-Handler des entfernten lokalen Pause-Dialogs konnten die Initialisierung abbrechen.
- Cloud-Synchronisierung startet wieder zuverlässig, dadurch wird das vorhandene D1-Guthaben (5,00 EUR) wieder geladen.
- ARBEIT/ZUHAUSE-Logik wurde nicht verändert.
- Keine Worker- oder D1-Aenderung notwendig.

DATEIEN v0.7.3
GEAENDERT: app.js, data.js, index.html, sw.js, README.txt
NEU: Keine
GELOESCHT: Keine

UPLOAD
HOCHLADEN: normale PWA-Dateien und Asset-Ordner.
NICHT HOCHLADEN: cloudflare/


CHANGELOG v0.7.4
- User-Auswahl für Abwesenheiten vereinfacht: nur noch FREI und KRANK.
- URLAUB aus der sichtbaren PWA-Auswahl entfernt.
- Bestehende/alte 'urlaub'-Daten bleiben intern kompatibel und werden weiterhin korrekt angezeigt.
- Keine Worker- oder D1-Änderung erforderlich.

DATEIEN v0.7.4
GEÄNDERT: app.js, data.js, index.html, sw.js, README.txt
NEU: Keine
GELÖSCHT: Keine

UPLOAD
HOCHLADEN: alle normalen PWA-Dateien und Asset-Ordner.
NICHT HOCHLADEN: cloudflare/
