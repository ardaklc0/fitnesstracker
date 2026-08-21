-- Allow the public dashboard to read global/system workout schedules.
ALTER TABLE workout_schedule ENABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON programs, workout_schedule TO anon;

DROP POLICY IF EXISTS workout_schedule_public_select ON workout_schedule;
CREATE POLICY workout_schedule_public_select
  ON workout_schedule
  FOR SELECT
  USING (user_id IS NULL);
