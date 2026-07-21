/*
# Make first user admin + auto-admin for first signup

1. Promotes the earliest-created profile to role = 'admin' if no admin exists yet.
2. Updates handle_new_user() so that the FIRST user ever to sign up becomes an admin
   automatically (when no admin profile exists). Subsequent signups stay 'student'.
*/

-- Promote the earliest existing profile to admin if there is no admin yet.
UPDATE profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM profiles
  ORDER BY created_at ASC
  LIMIT 1
)
AND NOT EXISTS (SELECT 1 FROM profiles WHERE role = 'admin');

-- Replace the trigger function: first user becomes admin automatically.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_exists boolean;
BEGIN
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE role = 'admin') INTO admin_exists;
  INSERT INTO public.profiles (id, username, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    CASE WHEN NOT admin_exists THEN 'admin' ELSE 'student' END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
