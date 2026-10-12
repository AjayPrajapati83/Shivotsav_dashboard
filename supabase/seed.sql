-- ============================================================
-- SHIVOTSAV 2026 — MYTHOS Dashboard — Seed Data
-- Run AFTER schema.sql in the Supabase SQL Editor.
-- ============================================================

-- 1. COLLEGES (20)
-- -----------------------------------------------------------
INSERT INTO colleges (name, deity_mythology, sort_order) VALUES
  ('NARASIMHA',   'Hindu',    1),
  ('LOKI',        'Norse',    2),
  ('HANUMAN',     'Hindu',    3),
  ('INDRA',       'Hindu',    4),
  ('GANESHA',     'Hindu',    5),
  ('VISHNU',      'Hindu',    6),
  ('GARUDA',      'Hindu',    7),
  ('THOR',        'Norse',    8),
  ('SURYA',       'Hindu',    9),
  ('OSIRIS',      'Egyptian', 10),
  ('AGNI',        'Hindu',    11),
  ('VARUNA',      'Hindu',    12),
  ('KUBERA',      'Hindu',    13),
  ('BALI',        'Hindu',    14),
  ('HELIOS',      'Greek',    15),
  ('SET',         'Egyptian', 16),
  ('ATHENA',      'Greek',    17),
  ('KARTIKEYA',   'Hindu',    18),
  ('ARES',        'Greek',    19),
  ('ZEUS',        'Greek',    20);

-- 2. EVENTS (36)
-- -----------------------------------------------------------
-- Performing Arts (8)
INSERT INTO events (name, department, type, entry_fee, sort_order) VALUES
  ('Solo Dance',       'Performing Arts', 'Large',    NULL, 1),
  ('Solo Singing',     'Performing Arts', 'Large',    NULL, 2),
  ('Group Dance',      'Performing Arts', 'Flagship', NULL, 3),
  ('Fashion Show',     'Performing Arts', 'Flagship', NULL, 4),
  ('Junk Band',        'Performing Arts', 'Flagship', NULL, 5),
  ('Street Dance',     'Performing Arts', 'Flagship', NULL, 6),
  ('Rap Battle',       'Performing Arts', 'Flagship', NULL, 7),
  ('Instrumental',     'Performing Arts', 'Large',    NULL, 8);

-- Fine Arts (6)
INSERT INTO events (name, department, type, entry_fee, sort_order) VALUES
  ('Tattoo Making',    'Fine Arts', 'Small',    NULL, 9),
  ('Poster Making',    'Fine Arts', 'Small',    NULL, 10),
  ('Face Painting',    'Fine Arts', 'Small',    NULL, 11),
  ('Bag Painting',     'Fine Arts', 'Large',    NULL, 12),
  ('Mehendi',          'Fine Arts', 'Large',    NULL, 13),
  ('Fashion Designing','Fine Arts', 'Flagship', NULL, 14);

-- Literary Arts (5)
INSERT INTO events (name, department, type, entry_fee, sort_order) VALUES
  ('Debate',                 'Literary Arts', 'Small',    NULL, 15),
  ('Quiz',                   'Literary Arts', 'Small',    NULL, 16),
  ('Poetry Recitation',      'Literary Arts', 'Large',    NULL, 17),
  ('Jam',                    'Literary Arts', 'Large',    NULL, 18),
  ('Creative Relay Writing', 'Literary Arts', 'Flagship', NULL, 19);

-- Informals (9)
INSERT INTO events (name, department, type, entry_fee, sort_order) VALUES
  ('Cooking Without Fire',   'Informals', 'Large',    NULL, 20),
  ('Story Mode Photography', 'Informals', 'Large',    NULL, 21),
  ('Reel Making',            'Informals', 'Large',    NULL, 22),
  ('Shark Tank',             'Informals', 'Large',    NULL, 23),
  ('IPL Auction',            'Informals', 'Large',    NULL, 24),
  ('Mr. & Mrs. Shivotsav',  'Informals', 'Flagship', NULL, 25),
  ('Treasure Hunt',          'Informals', 'Flagship', NULL, 26),
  ('War of CLs & ACLs',     'Informals', 'Flagship', NULL, 27),
  ('Human Ludo',             'Informals', 'Flagship', NULL, 28);

-- Gaming & Sports (8)
INSERT INTO events (name, department, type, entry_fee, sort_order) VALUES
  ('E-Football',     'Gaming & Sports', 'Small',    50,  29),
  ('Carrom',         'Gaming & Sports', 'Large',    50,  30),
  ('Chess',          'Gaming & Sports', 'Large',    50,  31),
  ('BGMI',           'Gaming & Sports', 'Flagship', 300, 32),
  ('Cricket',        'Gaming & Sports', 'Flagship', 500, 33),
  ('Football',       'Gaming & Sports', 'Flagship', 500, 34),
  ('Tug of War',     'Gaming & Sports', 'Flagship', 500, 35),
  ('Clash Royale',   'Gaming & Sports', 'Small',    50,  36);

-- 3. SCORING RULES
-- -----------------------------------------------------------
INSERT INTO scoring_rules (event_type, code, points) VALUES
  -- Flagship
  ('Flagship', 'PODIUM_1',      1200),
  ('Flagship', 'PODIUM_2',       800),
  ('Flagship', 'PODIUM_3',       400),
  ('Flagship', 'PARTICIPATION',  200),
  ('Flagship', 'OTSE',           100),
  ('Flagship', 'NPOOR',         -200),
  ('Flagship', 'NPOR',          -400),
  ('Flagship', 'NPOQ',          -800),
  -- Large
  ('Large', 'PODIUM_1',          600),
  ('Large', 'PODIUM_2',          400),
  ('Large', 'PODIUM_3',          200),
  ('Large', 'PARTICIPATION',     100),
  ('Large', 'OTSE',               50),
  ('Large', 'NPOOR',            -100),
  ('Large', 'NPOR',             -200),
  ('Large', 'NPOQ',             -400),
  -- Small
  ('Small', 'PODIUM_1',          450),
  ('Small', 'PODIUM_2',          300),
  ('Small', 'PODIUM_3',          150),
  ('Small', 'PARTICIPATION',      75),
  ('Small', 'OTSE',               30),
  ('Small', 'NPOOR',             -75),
  ('Small', 'NPOR',             -150),
  ('Small', 'NPOQ',             -300);
