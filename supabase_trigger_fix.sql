-- ==========================================
-- Supabase Trigger Fix - Handle Database Error Saving New User
-- ==========================================

-- Drop the old trigger structure entirely to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create a robust handler with built-in error handling and safe JSON parsing
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_discord_id TEXT;
  v_username TEXT;
  v_avatar TEXT;
BEGIN
  -- 1. Safely extract discord_id (provider_id or sub)
  v_discord_id := COALESCE(
    NEW.raw_user_meta_data->>'provider_id',
    NEW.raw_user_meta_data->>'sub',
    NEW.raw_user_meta_data->>'custom_claims'->>'id',
    NEW.id::text -- Ultimate fallback (will never be null)
  );
  
  -- 2. Safely extract username
  v_username := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'custom_claims'->>'global_name',
    'Discord User'
  );
  
  -- 3. Extract avatar
  v_avatar := NEW.raw_user_meta_data->>'avatar_url';

  -- 4. Insert data using ON CONFLICT DO NOTHING to avoid duplicate key errors
  INSERT INTO public.profiles (id, discord_id, username, avatar_url)
  VALUES (NEW.id, v_discord_id, v_username, v_avatar)
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;

EXCEPTION
  WHEN OTHERS THEN
    -- If ANYTHING fails in the logic above, do not block the user's login process.
    -- Log the error internally and just return NEW. (Profile will be missing but Auth succeeds).
    RAISE LOG 'Error inside handle_new_user trigger: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
