-- 001_init.sql

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Types
DO $$
BEGIN
  CREATE TYPE workout_status AS ENUM ('planned', 'in_progress', 'completed');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Profiles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES auth.users (id) ON DELETE CASCADE,
  display_name text,
  height_cm integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Weight logs
CREATE TABLE IF NOT EXISTS weight_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users (id) ON DELETE CASCADE,
  date date NOT NULL,
  weight_kg numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Calorie logs
CREATE TABLE IF NOT EXISTS calorie_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users (id) ON DELETE CASCADE,
  date date NOT NULL,
  active_calories integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Exercises (global or user-created)
CREATE TABLE IF NOT EXISTS exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users (id) ON DELETE CASCADE,
  name text NOT NULL,
  category text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Programs (global or user-created)
CREATE TABLE IF NOT EXISTS programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users (id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Program exercises (targets)
CREATE TABLE IF NOT EXISTS program_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid REFERENCES programs (id) ON DELETE CASCADE,
  exercise_id uuid REFERENCES exercises (id) ON DELETE RESTRICT,
  exercise_order integer NOT NULL DEFAULT 1,
  target_sets integer,
  min_reps integer,
  max_reps integer,
  rir_target integer,
  failure_target boolean DEFAULT false,
  superset_group text,
  notes text
);

-- Workout schedule (user-specific weekdays)
CREATE TABLE IF NOT EXISTS workout_schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users (id) ON DELETE CASCADE,
  weekday smallint NOT NULL CHECK (weekday >= 1 AND weekday <= 7),
  program_id uuid REFERENCES programs (id) ON DELETE SET NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Workouts
CREATE TABLE IF NOT EXISTS workouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users (id) ON DELETE CASCADE,
  date date NOT NULL,
  program_id uuid REFERENCES programs (id) ON DELETE SET NULL,
  body_weight_kg numeric,
  active_calories integer,
  notes text,
  status workout_status DEFAULT 'planned',
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Workout exercises (actual performed)
CREATE TABLE IF NOT EXISTS workout_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id uuid REFERENCES workouts (id) ON DELETE CASCADE,
  exercise_id uuid REFERENCES exercises (id) ON DELETE RESTRICT,
  exercise_order integer NOT NULL DEFAULT 1,
  notes text
);

-- Sets
CREATE TABLE IF NOT EXISTS sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_exercise_id uuid REFERENCES workout_exercises (id) ON DELETE CASCADE,
  set_number integer NOT NULL,
  weight_kg numeric,
  reps integer,
  rir integer,
  reached_failure boolean DEFAULT false,
  notes text
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_weight_logs_user_date ON weight_logs (user_id, date);
CREATE INDEX IF NOT EXISTS idx_calorie_logs_user_date ON calorie_logs (user_id, date);
CREATE INDEX IF NOT EXISTS idx_workouts_user_date ON workouts (user_id, date);

-- Row Level Security and Policies

-- Profiles: only owner can read/write their profile
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS profiles_owner_select ON profiles;
CREATE POLICY profiles_owner_select ON profiles FOR SELECT USING (user_id = auth.uid());
DROP POLICY IF EXISTS profiles_owner_modify ON profiles;
CREATE POLICY profiles_owner_modify ON profiles FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Weight logs: owner only
ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS weight_logs_owner ON weight_logs;
CREATE POLICY weight_logs_owner ON weight_logs FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Calorie logs: owner only
ALTER TABLE calorie_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS calorie_logs_owner ON calorie_logs;
CREATE POLICY calorie_logs_owner ON calorie_logs FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Exercises: allow read if system (user_id IS NULL) or owner; inserts/updates only by owner (new.user_id = auth.uid())
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS exercises_select ON exercises;
CREATE POLICY exercises_select ON exercises FOR SELECT USING (user_id IS NULL OR user_id = auth.uid());
DROP POLICY IF EXISTS exercises_insert ON exercises;
CREATE POLICY exercises_insert ON exercises FOR INSERT WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS exercises_update ON exercises;
CREATE POLICY exercises_update ON exercises FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS exercises_delete ON exercises;
CREATE POLICY exercises_delete ON exercises FOR DELETE USING (user_id = auth.uid());

-- Programs: similar to exercises
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS programs_select ON programs;
CREATE POLICY programs_select ON programs FOR SELECT USING (user_id IS NULL OR user_id = auth.uid());
DROP POLICY IF EXISTS programs_insert ON programs;
CREATE POLICY programs_insert ON programs FOR INSERT WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS programs_update ON programs;
CREATE POLICY programs_update ON programs FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS programs_delete ON programs;
CREATE POLICY programs_delete ON programs FOR DELETE USING (user_id = auth.uid());

-- Program exercises: if program is system (program.user_id IS NULL) allow select; otherwise only owner can select/modify
ALTER TABLE program_exercises ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS program_exercises_select ON program_exercises;
CREATE POLICY program_exercises_select ON program_exercises FOR SELECT USING (
  EXISTS (SELECT 1 FROM programs p WHERE p.id = program_exercises.program_id AND (p.user_id IS NULL OR p.user_id = auth.uid()))
);
DROP POLICY IF EXISTS program_exercises_insert ON program_exercises;
CREATE POLICY program_exercises_insert ON program_exercises FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM programs p WHERE p.id = program_exercises.program_id AND p.user_id = auth.uid())
);
DROP POLICY IF EXISTS program_exercises_update ON program_exercises;
CREATE POLICY program_exercises_update ON program_exercises FOR UPDATE USING (
  EXISTS (SELECT 1 FROM programs p WHERE p.id = program_exercises.program_id AND p.user_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM programs p WHERE p.id = program_exercises.program_id AND p.user_id = auth.uid())
);
DROP POLICY IF EXISTS program_exercises_delete ON program_exercises;
CREATE POLICY program_exercises_delete ON program_exercises FOR DELETE USING (
  EXISTS (SELECT 1 FROM programs p WHERE p.id = program_exercises.program_id AND p.user_id = auth.uid())
);

-- Workout schedule: owner only
ALTER TABLE workout_schedule ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS workout_schedule_owner ON workout_schedule;
CREATE POLICY workout_schedule_owner ON workout_schedule FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Workouts: owner only
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS workouts_owner ON workouts;
CREATE POLICY workouts_owner ON workouts FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Workout exercises: allow only when parent workout belongs to user
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS workout_exercises_owner ON workout_exercises;
CREATE POLICY workout_exercises_owner ON workout_exercises FOR ALL USING (
  EXISTS (SELECT 1 FROM workouts w WHERE w.id = workout_exercises.workout_id AND w.user_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM workouts w WHERE w.id = workout_exercises.workout_id AND w.user_id = auth.uid())
);

-- Sets: allow only when parent workout_exercise belongs to a workout of the user
ALTER TABLE sets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS sets_owner ON sets;
CREATE POLICY sets_owner ON sets FOR ALL USING (
  EXISTS (
    SELECT 1 FROM workout_exercises we JOIN workouts w ON we.workout_id = w.id WHERE we.id = sets.workout_exercise_id AND w.user_id = auth.uid()
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM workout_exercises we JOIN workouts w ON we.workout_id = w.id WHERE we.id = sets.workout_exercise_id AND w.user_id = auth.uid()
  )
);

-- Allow anon users to view public programs and exercises via the client (select policies above)

-- Restore the grants normally present on Supabase's public schema after a reset.
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT SELECT ON programs, exercises, program_exercises, workout_schedule TO anon;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO authenticated;

-- End of migration
