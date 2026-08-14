/*
# Create papers table (single-tenant, no auth)

1. New Tables
- `papers`
- `id` (uuid, primary key)
- `title` (text, not null) — paper title shown at top of sheet
- `subject` (text, not null) — e.g. Science, Mathematics
- `config` (jsonb, not null) — full generation config: scope, level, difficulty, marks, pyq, etc.
- `sections` (jsonb, not null) — array of CBSE sections with their questions
- `total_marks` (integer, not null) — calculated total
- `time_minutes` (integer, not null) — calculated time allowed
- `solutions` (jsonb) — optional answer key / step-by-step solutions
- `created_at` (timestamp)

2. Security
- Enable RLS on `papers`.
- Allow anon + authenticated CRUD because the data is intentionally shared/public (no sign-in screen in this app).
*/

CREATE TABLE IF NOT EXISTS papers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subject text NOT NULL,
  config jsonb NOT NULL,
  sections jsonb NOT NULL,
  total_marks integer NOT NULL DEFAULT 0,
  time_minutes integer NOT NULL DEFAULT 0,
  solutions jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE papers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_papers" ON papers;
CREATE POLICY "anon_select_papers" ON papers FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_papers" ON papers;
CREATE POLICY "anon_insert_papers" ON papers FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_papers" ON papers;
CREATE POLICY "anon_update_papers" ON papers FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_papers" ON papers;
CREATE POLICY "anon_delete_papers" ON papers FOR DELETE
  TO anon, authenticated USING (true);
