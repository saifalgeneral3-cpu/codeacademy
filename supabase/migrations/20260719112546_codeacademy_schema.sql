/*
# CodeAcademy — Core Schema

## Purpose
Full relational schema for a programming learning platform: profiles, categories, courses,
lessons, lesson progress, reviews, favorites, and resources. Multi-user with auth:
students own their progress/favorites/reviews; admins manage courses/lessons.

## New Tables
1. `profiles` — extends auth.users with display name, role (student/admin), avatar.
2. `categories` — programming categories (HTML, CSS, JavaScript, ...).
3. `courses` — belongs to a category, has instructor, thumbnail, level, etc.
4. `lessons` — belongs to a course, has video URL, notes, source code, position.
5. `resources` — downloadable files attached to a lesson.
6. `lesson_progress` — per-user completion tracking.
7. `reviews` — student reviews of courses (rating 1-5).
8. `favorites` — student favorite courses (unique user+course).

## Security
- RLS enabled on every table.
- Public read on catalog tables (categories, courses, lessons, resources, reviews).
- Authenticated students own their progress, favorites, reviews, profile.
- Admins (profiles.role = 'admin') can write courses, lessons, categories, resources.
- Owner columns default to auth.uid() so inserts omitting user_id satisfy WITH CHECK.
- A trigger auto-creates a profile row on signup.
*/

-- ---------- profiles ----------
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text NOT NULL,
  full_name text,
  role text NOT NULL DEFAULT 'student' CHECK (role IN ('student','admin')),
  avatar_url text,
  bio text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select" ON profiles;
CREATE POLICY "profiles_select" ON profiles FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ---------- categories ----------
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  icon text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "categories_select_all" ON categories;
CREATE POLICY "categories_select_all" ON categories FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "categories_admin_write" ON categories;
CREATE POLICY "categories_admin_write" ON categories FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );
DROP POLICY IF EXISTS "categories_admin_update" ON categories;
CREATE POLICY "categories_admin_update" ON categories FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );
DROP POLICY IF EXISTS "categories_admin_delete" ON categories;
CREATE POLICY "categories_admin_delete" ON categories FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- ---------- courses ----------
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL,
  instructor text NOT NULL,
  thumbnail_url text,
  cover_url text,
  level text NOT NULL DEFAULT 'beginner' CHECK (level IN ('beginner','intermediate','advanced')),
  category_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS courses_category_id_idx ON courses(category_id);

DROP POLICY IF EXISTS "courses_select_all" ON courses;
CREATE POLICY "courses_select_all" ON courses FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "courses_admin_insert" ON courses;
CREATE POLICY "courses_admin_insert" ON courses FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );
DROP POLICY IF EXISTS "courses_admin_update" ON courses;
CREATE POLICY "courses_admin_update" ON courses FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );
DROP POLICY IF EXISTS "courses_admin_delete" ON courses;
CREATE POLICY "courses_admin_delete" ON courses FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- ---------- lessons ----------
CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  video_url text,
  notes text,
  source_code_url text,
  position int NOT NULL DEFAULT 0,
  duration_min int DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS lessons_course_id_idx ON lessons(course_id);

DROP POLICY IF EXISTS "lessons_select_all" ON lessons;
CREATE POLICY "lessons_select_all" ON lessons FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "lessons_admin_insert" ON lessons;
CREATE POLICY "lessons_admin_insert" ON lessons FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );
DROP POLICY IF EXISTS "lessons_admin_update" ON lessons;
CREATE POLICY "lessons_admin_update" ON lessons FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );
DROP POLICY IF EXISTS "lessons_admin_delete" ON lessons;
CREATE POLICY "lessons_admin_delete" ON lessons FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- ---------- resources ----------
CREATE TABLE IF NOT EXISTS resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  name text NOT NULL,
  file_url text NOT NULL,
  file_type text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS resources_lesson_id_idx ON resources(lesson_id);

DROP POLICY IF EXISTS "resources_select_all" ON resources;
CREATE POLICY "resources_select_all" ON resources FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "resources_admin_insert" ON resources;
CREATE POLICY "resources_admin_insert" ON resources FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );
DROP POLICY IF EXISTS "resources_admin_update" ON resources;
CREATE POLICY "resources_admin_update" ON resources FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );
DROP POLICY IF EXISTS "resources_admin_delete" ON resources;
CREATE POLICY "resources_admin_delete" ON resources FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- ---------- lesson_progress ----------
CREATE TABLE IF NOT EXISTS lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, lesson_id)
);
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS lesson_progress_user_idx ON lesson_progress(user_id);

DROP POLICY IF EXISTS "progress_select_own" ON lesson_progress;
CREATE POLICY "progress_select_own" ON lesson_progress FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "progress_insert_own" ON lesson_progress;
CREATE POLICY "progress_insert_own" ON lesson_progress FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "progress_update_own" ON lesson_progress;
CREATE POLICY "progress_update_own" ON lesson_progress FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "progress_delete_own" ON lesson_progress;
CREATE POLICY "progress_delete_own" ON lesson_progress FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ---------- reviews ----------
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (course_id, user_id)
);
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS reviews_course_idx ON reviews(course_id);

DROP POLICY IF EXISTS "reviews_select_all" ON reviews;
CREATE POLICY "reviews_select_all" ON reviews FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "reviews_insert_own" ON reviews;
CREATE POLICY "reviews_insert_own" ON reviews FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "reviews_update_own" ON reviews;
CREATE POLICY "reviews_update_own" ON reviews FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "reviews_delete_own" ON reviews;
CREATE POLICY "reviews_delete_own" ON reviews FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ---------- favorites ----------
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id)
);
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS favorites_user_idx ON favorites(user_id);

DROP POLICY IF EXISTS "favorites_select_own" ON favorites;
CREATE POLICY "favorites_select_own" ON favorites FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "favorites_insert_own" ON favorites;
CREATE POLICY "favorites_insert_own" ON favorites FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "favorites_delete_own" ON favorites;
CREATE POLICY "favorites_delete_own" ON favorites FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ---------- handle_new_user trigger ----------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
