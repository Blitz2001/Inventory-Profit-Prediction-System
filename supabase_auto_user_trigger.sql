-- 1. Create the Function that handles new user insertion
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
      new.id, 
      COALESCE(new.raw_user_meta_data ->> 'full_name', new.email), 
      'viewer'
  );
  RETURN new;
END;
$$;

-- 2. Create the Trigger on the auth.users table
-- This ensures that every time a user signs up, a profile is technically created.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. RE-RUN BACKFILL for missing users
-- This will insert any users that are in auth.users but NOT in profiles yet (like 'arunu' or 'geekspot')
INSERT INTO public.profiles (id, role, full_name)
SELECT id, 'viewer', email
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 4. Verification Check (Optional - you can see this in Table Editor)
-- SELECT count(*) FROM profiles;
