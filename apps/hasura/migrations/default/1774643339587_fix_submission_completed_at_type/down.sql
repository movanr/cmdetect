ALTER TABLE patient_record
  ALTER COLUMN submission_completed_at TYPE time without time zone
  USING submission_completed_at::time;
