-- Add status field to profiles table for user activation/deactivation
-- This migration adds a status column to track if users are active or inactive

DO $$ BEGIN
  -- Add status column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'status'
  ) THEN
    ALTER TABLE profiles ADD COLUMN status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive'));
  END IF;

  -- Create index on status for better query performance
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'profiles' 
    AND indexname = 'idx_profiles_status'
  ) THEN
    CREATE INDEX idx_profiles_status ON profiles(status);
  END IF;

  -- Update all existing profiles to be active by default
  UPDATE profiles SET status = 'active' WHERE status IS NULL;

END $$;

-- Add comment to the status column
COMMENT ON COLUMN profiles.status IS 'User account status: active or inactive';
