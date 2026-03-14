/*
  # Python Labs Database Schema

  1. New Tables
    - `lessons`
      - `id` (uuid, primary key)
      - `title` (text) - Lesson title
      - `slug` (text, unique) - URL-friendly identifier
      - `description` (text) - Brief description
      - `content` (text) - Markdown/HTML content
      - `track` (text) - beginner, intermediate, or advanced
      - `order_index` (integer) - Display order within track
      - `estimated_time` (integer) - Minutes to complete
      - `created_at` (timestamptz)
      
    - `exercises`
      - `id` (uuid, primary key)
      - `lesson_id` (uuid, foreign key) - Associated lesson
      - `title` (text) - Exercise title
      - `description` (text) - What to build
      - `starter_code` (text) - Initial code
      - `solution` (text) - Expected solution
      - `test_cases` (jsonb) - Array of test cases
      - `hints` (jsonb) - Array of hints
      - `order_index` (integer) - Display order within lesson
      - `difficulty` (text) - easy, medium, hard
      - `created_at` (timestamptz)
      
    - `user_progress`
      - `id` (uuid, primary key)
      - `user_id` (uuid) - Reference to auth.users
      - `lesson_id` (uuid, foreign key) - Completed lesson
      - `completed` (boolean) - Whether fully completed
      - `last_accessed` (timestamptz)
      - `created_at` (timestamptz)
      
    - `exercise_attempts`
      - `id` (uuid, primary key)
      - `user_id` (uuid) - Reference to auth.users
      - `exercise_id` (uuid, foreign key)
      - `code` (text) - User's code attempt
      - `passed` (boolean) - Whether it passed tests
      - `created_at` (timestamptz)
      
    - `achievements`
      - `id` (uuid, primary key)
      - `title` (text) - Achievement name
      - `description` (text) - How to earn it
      - `icon` (text) - Icon identifier
      - `requirement_type` (text) - lessons_completed, exercises_solved, etc.
      - `requirement_value` (integer) - Number needed
      - `created_at` (timestamptz)
      
    - `user_achievements`
      - `id` (uuid, primary key)
      - `user_id` (uuid) - Reference to auth.users
      - `achievement_id` (uuid, foreign key)
      - `earned_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Public read access for lessons, exercises, and achievements
    - Authenticated users can manage their own progress and attempts
*/

-- Create lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text NOT NULL,
  content text NOT NULL,
  track text NOT NULL CHECK (track IN ('beginner', 'intermediate', 'advanced', 'projects')),
  order_index integer NOT NULL DEFAULT 0,
  estimated_time integer DEFAULT 15,
  created_at timestamptz DEFAULT now()
);

-- Create exercises table
CREATE TABLE IF NOT EXISTS exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid REFERENCES lessons(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  starter_code text DEFAULT '',
  solution text NOT NULL,
  test_cases jsonb DEFAULT '[]'::jsonb,
  hints jsonb DEFAULT '[]'::jsonb,
  order_index integer NOT NULL DEFAULT 0,
  difficulty text CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'easy',
  created_at timestamptz DEFAULT now()
);

-- Create user_progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  lesson_id uuid REFERENCES lessons(id) ON DELETE CASCADE,
  completed boolean DEFAULT false,
  last_accessed timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Create exercise_attempts table
CREATE TABLE IF NOT EXISTS exercise_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  exercise_id uuid REFERENCES exercises(id) ON DELETE CASCADE,
  code text NOT NULL,
  passed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  requirement_type text NOT NULL,
  requirement_value integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  achievement_id uuid REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Enable RLS
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Lessons policies (public read)
CREATE POLICY "Anyone can view lessons"
  ON lessons FOR SELECT
  TO public
  USING (true);

-- Exercises policies (public read)
CREATE POLICY "Anyone can view exercises"
  ON exercises FOR SELECT
  TO public
  USING (true);

-- User progress policies
CREATE POLICY "Users can view own progress"
  ON user_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON user_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Exercise attempts policies
CREATE POLICY "Users can view own attempts"
  ON exercise_attempts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own attempts"
  ON exercise_attempts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Achievements policies (public read)
CREATE POLICY "Anyone can view achievements"
  ON achievements FOR SELECT
  TO public
  USING (true);

-- User achievements policies
CREATE POLICY "Users can view own achievements"
  ON user_achievements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
  ON user_achievements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_lessons_track ON lessons(track, order_index);
CREATE INDEX IF NOT EXISTS idx_exercises_lesson ON exercises(lesson_id, order_index);
CREATE INDEX IF NOT EXISTS idx_user_progress_user ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_attempts_user ON exercise_attempts(user_id, exercise_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);
