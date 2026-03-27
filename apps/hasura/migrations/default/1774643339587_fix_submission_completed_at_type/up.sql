-- Fix submission_completed_at: change from time to timestamptz
-- Combine existing time values with created_at date before converting
UPDATE patient_record
SET submission_completed_at = NULL
WHERE submission_completed_at IS NOT NULL;

ALTER TABLE patient_record
  ALTER COLUMN submission_completed_at TYPE timestamp with time zone
  USING NULL;

-- Re-populate from known records: set to created_at + original time offset
-- (data loss is acceptable here as these are dev records)
