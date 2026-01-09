-- Migration: Alter mentor_availability.weekday to DATE if currently SMALLINT
-- Safe conditional migration using PL/pgSQL block

DO $$
BEGIN
    -- Check if column exists and is SMALLINT
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'mentor_availability'
          AND column_name = 'weekday'
          AND data_type = 'smallint'
    ) THEN
        -- Rename existing SMALLINT column
        ALTER TABLE public.mentor_availability RENAME COLUMN weekday TO weekday_num;

        -- Add new DATE column
        ALTER TABLE public.mentor_availability ADD COLUMN weekday DATE;

        -- Backfill: map numeric weekday (0=Sunday..6=Saturday) to next upcoming date
        -- Note: This preserves a single next occurrence; mentors should recreate per-date availabilities as needed.
        UPDATE public.mentor_availability
        SET weekday = CURRENT_DATE + (((weekday_num)::int - EXTRACT(DOW FROM CURRENT_DATE)::int + 7) % 7);

        -- Enforce NOT NULL
        ALTER TABLE public.mentor_availability ALTER COLUMN weekday SET NOT NULL;

        -- Drop old numeric column
        ALTER TABLE public.mentor_availability DROP COLUMN weekday_num;
    END IF;
END $$;

-- Optional: Index to speed up mentor/date lookups
CREATE INDEX IF NOT EXISTS idx_mentor_availability_mentor_date
    ON public.mentor_availability (mentor_id, weekday);
