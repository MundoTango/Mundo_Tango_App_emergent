-- ESA LIFE CEO 61x21 - Safe migration for capabilities column
-- This script safely converts the capabilities column to jsonb

-- Step 1: Add a new temporary column with jsonb type
ALTER TABLE agents ADD COLUMN IF NOT EXISTS capabilities_new jsonb DEFAULT '[]'::jsonb;

-- Step 2: Copy and convert existing data to jsonb
-- Handle different possible source types (text, varchar, or already jsonb)
UPDATE agents 
SET capabilities_new = 
  CASE 
    WHEN capabilities IS NULL THEN '[]'::jsonb
    WHEN pg_typeof(capabilities::text) = 'text'::regtype THEN 
      CASE 
        WHEN capabilities::text = '' THEN '[]'::jsonb
        ELSE capabilities::text::jsonb
      END
    ELSE '[]'::jsonb
  END
WHERE capabilities_new IS NULL OR capabilities_new = '[]'::jsonb;

-- Step 3: Drop the old column (only if it exists and is not already jsonb)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'agents' 
    AND column_name = 'capabilities'
    AND data_type != 'jsonb'
  ) THEN
    ALTER TABLE agents DROP COLUMN capabilities;
  END IF;
END $$;

-- Step 4: Rename the new column to capabilities
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'agents' 
    AND column_name = 'capabilities_new'
  ) THEN
    ALTER TABLE agents RENAME COLUMN capabilities_new TO capabilities;
  END IF;
END $$;

-- Step 5: Ensure the column has the correct default
ALTER TABLE agents ALTER COLUMN capabilities SET DEFAULT '[]'::jsonb;

-- Verify the migration
SELECT 
  'Migration complete. Capabilities column type:' as status,
  data_type 
FROM information_schema.columns 
WHERE table_name = 'agents' 
AND column_name = 'capabilities';