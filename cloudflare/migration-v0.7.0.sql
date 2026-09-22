-- One More Day v0.7.0
CREATE TABLE IF NOT EXISTS day_statuses (
  day_date TEXT PRIMARY KEY,
  status TEXT NOT NULL CHECK (status IN ('normal','frei','urlaub','krank')),
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_by TEXT
);

-- Echter Testfall: Dienstag, 22.09.2026 = FREI
INSERT INTO day_statuses (day_date,status,updated_at,updated_by)
VALUES ('2026-09-22','frei',CURRENT_TIMESTAMP,'admin')
ON CONFLICT(day_date) DO UPDATE SET
  status=excluded.status,
  updated_at=CURRENT_TIMESTAMP,
  updated_by='admin';
