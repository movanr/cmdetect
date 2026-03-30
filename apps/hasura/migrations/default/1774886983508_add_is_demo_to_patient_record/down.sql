DROP INDEX IF EXISTS idx_patient_record_is_demo;
ALTER TABLE public.patient_record DROP COLUMN is_demo;
