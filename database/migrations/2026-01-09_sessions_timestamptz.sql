-- Migrate sessions datetime columns to TIMESTAMPTZ.
-- Interprets existing timestamps as Europe/Rome local time, then converts to timestamptz (UTC).
-- Safe to re-run: will error if already timestamptz; run only once.

BEGIN;

ALTER TABLE sessions
  ALTER COLUMN start_datetime TYPE timestamptz
  USING (start_datetime AT TIME ZONE 'Europe/Rome');

ALTER TABLE sessions
  ALTER COLUMN end_datetime TYPE timestamptz
  USING (end_datetime AT TIME ZONE 'Europe/Rome');

COMMIT;
