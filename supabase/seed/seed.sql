-- seed.sql

-- Insert default exercises
INSERT INTO exercises (id, user_id, name, category, notes)
VALUES
  (gen_random_uuid(), NULL, 'Plate loaded chest press', 'Chest', NULL),
  (gen_random_uuid(), NULL, 'Smith machine low incline press', 'Chest', NULL),
  (gen_random_uuid(), NULL, 'Chest fly machine', 'Chest', NULL),
  (gen_random_uuid(), NULL, 'Shoulder press machine', 'Shoulders', NULL),
  (gen_random_uuid(), NULL, 'Lateral raise', 'Shoulders', NULL),
  (gen_random_uuid(), NULL, 'Triceps pushdown', 'Triceps', NULL),
  (gen_random_uuid(), NULL, 'Overhead rope extension', 'Triceps', NULL),
  (gen_random_uuid(), NULL, 'Lat pulldown', 'Back', NULL),
  (gen_random_uuid(), NULL, 'Plate loaded wide grip row', 'Back', NULL),
  (gen_random_uuid(), NULL, 'Cable row', 'Back', NULL),
  (gen_random_uuid(), NULL, 'Dumbbell curl', 'Arms', NULL),
  (gen_random_uuid(), NULL, 'Cable curl', 'Arms', NULL),
  (gen_random_uuid(), NULL, 'Hammer curl', 'Arms', NULL),
  (gen_random_uuid(), NULL, 'Leg press', 'Legs', NULL),
  (gen_random_uuid(), NULL, 'Smith machine squat', 'Legs', NULL),
  (gen_random_uuid(), NULL, 'Leg extension', 'Legs', NULL),
  (gen_random_uuid(), NULL, 'Seated leg curl', 'Legs', NULL),
  (gen_random_uuid(), NULL, 'Cable rear delt fly', 'Shoulders', NULL)
ON CONFLICT DO NOTHING;

-- Insert programs
INSERT INTO programs (id, user_id, name, description)
VALUES
  (gen_random_uuid(), NULL, 'Program 1', 'Chest / Shoulders / Triceps'),
  (gen_random_uuid(), NULL, 'Program 2', 'Back / Arms'),
  (gen_random_uuid(), NULL, 'Program 3', 'Legs'),
  (gen_random_uuid(), NULL, 'Program 4', 'Upper accessory focus'),
  (gen_random_uuid(), NULL, 'Program 5', 'Back / Legs / Arms')
ON CONFLICT DO NOTHING;

-- Link program exercises by name using subqueries
-- Program 1
INSERT INTO program_exercises (program_id, exercise_id, exercise_order, target_sets, min_reps, max_reps, rir_target, failure_target)
VALUES
  ((SELECT id FROM programs WHERE name = 'Program 1' LIMIT 1), (SELECT id FROM exercises WHERE name = 'Plate loaded chest press' LIMIT 1), 1, 2, 5, 6, 1, false),
  ((SELECT id FROM programs WHERE name = 'Program 1' LIMIT 1), (SELECT id FROM exercises WHERE name = 'Smith machine low incline press' LIMIT 1), 2, 2, 5, 6, 1, false),
  ((SELECT id FROM programs WHERE name = 'Program 1' LIMIT 1), (SELECT id FROM exercises WHERE name = 'Chest fly machine' LIMIT 1), 3, 1, 6, 8, NULL, true),
  ((SELECT id FROM programs WHERE name = 'Program 1' LIMIT 1), (SELECT id FROM exercises WHERE name = 'Shoulder press machine' LIMIT 1), 4, 2, 5, 6, 1, false),
  ((SELECT id FROM programs WHERE name = 'Program 1' LIMIT 1), (SELECT id FROM exercises WHERE name = 'Lateral raise' LIMIT 1), 5, 3, 8, 10, NULL, true),
  ((SELECT id FROM programs WHERE name = 'Program 1' LIMIT 1), (SELECT id FROM exercises WHERE name = 'Triceps pushdown' LIMIT 1), 6, 2, 6, 8, NULL, true),
  ((SELECT id FROM programs WHERE name = 'Program 1' LIMIT 1), (SELECT id FROM exercises WHERE name = 'Overhead rope extension' LIMIT 1), 7, 2, 8, 10, NULL, true)
ON CONFLICT DO NOTHING;

-- Program 2
INSERT INTO program_exercises (program_id, exercise_id, exercise_order, target_sets, min_reps, max_reps, rir_target, failure_target)
VALUES
  ((SELECT id FROM programs WHERE name = 'Program 2' LIMIT 1), (SELECT id FROM exercises WHERE name = 'Lat pulldown' LIMIT 1), 1, 2, 6, 8, 1, false),
  ((SELECT id FROM programs WHERE name = 'Program 2' LIMIT 1), (SELECT id FROM exercises WHERE name = 'Plate loaded wide grip row' LIMIT 1), 2, 3, 6, 8, 1, false),
  ((SELECT id FROM programs WHERE name = 'Program 2' LIMIT 1), (SELECT id FROM exercises WHERE name = 'Cable row' LIMIT 1), 3, 1, 8, 10, NULL, true),
  ((SELECT id FROM programs WHERE name = 'Program 2' LIMIT 1), (SELECT id FROM exercises WHERE name = 'Dumbbell curl' LIMIT 1), 4, 2, 6, 8, NULL, true),
  ((SELECT id FROM programs WHERE name = 'Program 2' LIMIT 1), (SELECT id FROM exercises WHERE name = 'Cable curl' LIMIT 1), 5, 2, 6, 8, NULL, true),
  ((SELECT id FROM programs WHERE name = 'Program 2' LIMIT 1), (SELECT id FROM exercises WHERE name = 'Hammer curl' LIMIT 1), 6, 2, 8, 10, NULL, true)
ON CONFLICT DO NOTHING;

-- Program 3
INSERT INTO program_exercises (program_id, exercise_id, exercise_order, target_sets, min_reps, max_reps, rir_target, failure_target)
VALUES
  ((SELECT id FROM programs WHERE name = 'Program 3' LIMIT 1), (SELECT id FROM exercises WHERE name = 'Leg press' LIMIT 1), 1, 2, 6, 8, 1, false),
  ((SELECT id FROM programs WHERE name = 'Program 3' LIMIT 1), (SELECT id FROM exercises WHERE name = 'Smith machine squat' LIMIT 1), 2, 2, 6, 8, 1, false),
  ((SELECT id FROM programs WHERE name = 'Program 3' LIMIT 1), (SELECT id FROM exercises WHERE name = 'Leg extension' LIMIT 1), 3, 2, 8, 10, NULL, true),
  ((SELECT id FROM programs WHERE name = 'Program 3' LIMIT 1), (SELECT id FROM exercises WHERE name = 'Seated leg curl' LIMIT 1), 4, 3, 8, 10, 1, false)
ON CONFLICT DO NOTHING;

-- Program 4
INSERT INTO program_exercises (program_id, exercise_id, exercise_order, target_sets, min_reps, max_reps, rir_target, failure_target)
VALUES
  ((SELECT id FROM programs WHERE name = 'Program 4' LIMIT 1), (SELECT id FROM exercises WHERE name = 'Shoulder press machine' LIMIT 1), 1, 2, 5, 6, 1, false),
  ((SELECT id FROM programs WHERE name = 'Program 4' LIMIT 1), (SELECT id FROM exercises WHERE name = 'Lateral raise' LIMIT 1), 2, 3, 8, 10, NULL, true),
  ((SELECT id FROM programs WHERE name = 'Program 4' LIMIT 1), (SELECT id FROM exercises WHERE name = 'Smith machine low incline press' LIMIT 1), 3, 2, 5, 6, 1, false),
  ((SELECT id FROM programs WHERE name = 'Program 4' LIMIT 1), (SELECT id FROM exercises WHERE name = 'Chest fly machine' LIMIT 1), 4, 2, 6, 8, NULL, true),
  ((SELECT id FROM programs WHERE name = 'Program 4' LIMIT 1), (SELECT id FROM exercises WHERE name = 'Cable rear delt fly' LIMIT 1), 5, 2, 8, 10, NULL, true),
  ((SELECT id FROM programs WHERE name = 'Program 4' LIMIT 1), (SELECT id FROM exercises WHERE name = 'Triceps pushdown' LIMIT 1), 6, 2, 6, 8, NULL, true)
ON CONFLICT DO NOTHING;

-- Program 5
INSERT INTO program_exercises (program_id, exercise_id, exercise_order, target_sets, min_reps, max_reps, rir_target, failure_target)
VALUES
  ((SELECT id FROM programs WHERE name = 'Program 5' LIMIT 1), (SELECT id FROM exercises WHERE name = 'Plate loaded wide grip row' LIMIT 1), 1, 3, 6, 8, 1, false),
  ((SELECT id FROM programs WHERE name = 'Program 5' LIMIT 1), (SELECT id FROM exercises WHERE name = 'Lat pulldown' LIMIT 1), 2, 3, 6, 8, 1, false),
  ((SELECT id FROM programs WHERE name = 'Program 5' LIMIT 1), (SELECT id FROM exercises WHERE name = 'Cable curl' LIMIT 1), 3, 2, 6, 8, NULL, true),
  ((SELECT id FROM programs WHERE name = 'Program 5' LIMIT 1), (SELECT id FROM exercises WHERE name = 'Hammer curl' LIMIT 1), 4, 2, 8, 10, NULL, true),
  ((SELECT id FROM programs WHERE name = 'Program 5' LIMIT 1), (SELECT id FROM exercises WHERE name = 'Leg press' LIMIT 1), 5, 2, 6, 8, 1, false),
  ((SELECT id FROM programs WHERE name = 'Program 5' LIMIT 1), (SELECT id FROM exercises WHERE name = 'Leg extension' LIMIT 1), 6, 2, 6, 8, NULL, true),
  ((SELECT id FROM programs WHERE name = 'Program 5' LIMIT 1), (SELECT id FROM exercises WHERE name = 'Seated leg curl' LIMIT 1), 7, 1, 8, 10, NULL, true)
ON CONFLICT DO NOTHING;

-- Default schedule: Tuesday(2) -> Program 1, Thursday(4) -> Program 2, Saturday(6) -> Program 3
INSERT INTO workout_schedule (id, user_id, weekday, program_id, active)
VALUES
  (gen_random_uuid(), NULL, 2, (SELECT id FROM programs WHERE name = 'Program 1' LIMIT 1), true),
  (gen_random_uuid(), NULL, 4, (SELECT id FROM programs WHERE name = 'Program 2' LIMIT 1), true),
  (gen_random_uuid(), NULL, 6, (SELECT id FROM programs WHERE name = 'Program 3' LIMIT 1), true)
ON CONFLICT DO NOTHING;

-- End seed
