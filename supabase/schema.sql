-- ============================================================
-- SHIVOTSAV 2026 — MYTHOS Dashboard — Schema
-- Paste this entire file into the Supabase SQL Editor and run.
-- ============================================================

-- 1. TABLES
-- -----------------------------------------------------------

CREATE TABLE colleges (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  deity_mythology TEXT CHECK (deity_mythology IN ('Hindu', 'Norse', 'Egyptian', 'Greek')),
  crest_url TEXT,
  sort_order INT,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  department TEXT NOT NULL CHECK (department IN (
    'Performing Arts', 'Fine Arts', 'Literary Arts', 'Informals', 'Gaming & Sports'
  )),
  type TEXT NOT NULL CHECK (type IN ('Flagship', 'Large', 'Small')),
  entry_fee INT,
  sort_order INT
);

CREATE TABLE scoring_rules (
  event_type TEXT CHECK (event_type IN ('Flagship', 'Large', 'Small')),
  code TEXT CHECK (code IN (
    'PARTICIPATION', 'OTSE', 'NPOOR', 'NPOR', 'NPOQ',
    'PODIUM_1', 'PODIUM_2', 'PODIUM_3'
  )),
  points INT NOT NULL,
  PRIMARY KEY (event_type, code)
);

CREATE TABLE score_entries (
  id BIGSERIAL PRIMARY KEY,
  college_id INT NOT NULL REFERENCES colleges(id),
  event_id INT REFERENCES events(id),
  code TEXT NOT NULL CHECK (code IN (
    'PARTICIPATION', 'OTSE', 'NPOOR', 'NPOR', 'NPOQ',
    'PODIUM_1', 'PODIUM_2', 'PODIUM_3', 'CUSTOM'
  )),
  points INT NOT NULL,
  note TEXT,
  created_by TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  voided_at TIMESTAMPTZ,
  voided_by TEXT,
  void_reason TEXT
);

-- One college per podium position per event (among non-voided entries)
CREATE UNIQUE INDEX uq_podium ON score_entries(event_id, code)
  WHERE code IN ('PODIUM_1', 'PODIUM_2', 'PODIUM_3') AND voided_at IS NULL;

-- 2. TRIGGER: auto-fill points from scoring_rules
-- -----------------------------------------------------------

CREATE OR REPLACE FUNCTION fn_fill_points()
RETURNS TRIGGER AS $$
DECLARE
  v_event_type TEXT;
  v_points INT;
BEGIN
  -- CUSTOM entries: admin supplies the signed number, but note is required
  IF NEW.code = 'CUSTOM' THEN
    IF NEW.note IS NULL OR TRIM(NEW.note) = '' THEN
      RAISE EXCEPTION 'CUSTOM entries require a non-empty note';
    END IF;
    -- points already set by admin
    RETURN NEW;
  END IF;

  -- For non-CUSTOM, look up the event type
  IF NEW.event_id IS NULL THEN
    RAISE EXCEPTION 'event_id is required for non-CUSTOM entries';
  END IF;

  SELECT type INTO v_event_type FROM events WHERE id = NEW.event_id;
  IF v_event_type IS NULL THEN
    RAISE EXCEPTION 'Event not found: %', NEW.event_id;
  END IF;

  SELECT points INTO v_points FROM scoring_rules
    WHERE event_type = v_event_type AND code = NEW.code;
  IF v_points IS NULL THEN
    RAISE EXCEPTION 'No scoring rule for type=% code=%', v_event_type, NEW.code;
  END IF;

  NEW.points := v_points;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_fill_points
  BEFORE INSERT ON score_entries
  FOR EACH ROW
  EXECUTE FUNCTION fn_fill_points();

-- 3. VIEWS
-- -----------------------------------------------------------

-- College totals (overall, including CUSTOM)
CREATE OR REPLACE VIEW college_totals AS
SELECT
  c.id AS college_id,
  c.name,
  c.deity_mythology,
  c.crest_url,
  c.is_active,
  COALESCE(SUM(se.points), 0) AS total,
  RANK() OVER (ORDER BY COALESCE(SUM(se.points), 0) DESC) AS rank
FROM colleges c
LEFT JOIN score_entries se
  ON se.college_id = c.id AND se.voided_at IS NULL
WHERE c.is_active = TRUE
GROUP BY c.id, c.name, c.deity_mythology, c.crest_url, c.is_active;

-- Department totals (excludes CUSTOM entries)
CREATE OR REPLACE VIEW department_totals AS
SELECT
  c.id AS college_id,
  c.name AS college_name,
  e.department,
  COALESCE(SUM(se.points), 0) AS dept_total
FROM colleges c
CROSS JOIN (
  SELECT DISTINCT department FROM events
) e
LEFT JOIN score_entries se
  ON se.college_id = c.id
  AND se.voided_at IS NULL
  AND se.code != 'CUSTOM'
  AND se.event_id IN (SELECT id FROM events WHERE department = e.department)
WHERE c.is_active = TRUE
GROUP BY c.id, c.name, e.department;

-- 4. RLS: DENY ALL
-- -----------------------------------------------------------
-- Enable RLS on all tables with NO policies.
-- Only the service_role key can bypass RLS.

ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE scoring_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE score_entries ENABLE ROW LEVEL SECURITY;

-- Revoke any default grants from anon and authenticated
REVOKE ALL ON colleges FROM anon, authenticated;
REVOKE ALL ON events FROM anon, authenticated;
REVOKE ALL ON scoring_rules FROM anon, authenticated;
REVOKE ALL ON score_entries FROM anon, authenticated;
REVOKE ALL ON college_totals FROM anon, authenticated;
REVOKE ALL ON department_totals FROM anon, authenticated;

-- Revoke sequence usage
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;

-- Revoke function execution
REVOKE EXECUTE ON FUNCTION fn_fill_points() FROM anon, authenticated;
