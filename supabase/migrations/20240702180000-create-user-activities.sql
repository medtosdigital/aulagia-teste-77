/*
  # User Activities Table Migration

  1. Table Structure
    - `user_activities`: Tracks all user actions in the platform
      - `id`: Primary key (uuid)
      - `user_id`: References auth.users
      - `type`: Activity type (created/exported/updated/scheduled)
      - `title`: Activity title
      - `description`: Detailed description
      - `material_type`: Type of material involved
      - `material_id`: ID of related material
      - `subject`: Subject area
      - `grade`: Grade level
      - `created_at`: Timestamp

  2. Security
    - Enable Row Level Security
    - Create policies for authenticated users
    - Add index for performance
*/

CREATE TABLE IF NOT EXISTS user_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  material_type text,
  material_id text,
  subject text,
  grade text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own activities"
  ON user_activities
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_activities_user_id_created_at
  ON user_activities (user_id, created_at DESC);
