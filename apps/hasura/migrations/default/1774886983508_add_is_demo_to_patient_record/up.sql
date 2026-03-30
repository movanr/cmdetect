ALTER TABLE public.patient_record ADD COLUMN is_demo boolean NOT NULL DEFAULT false;
CREATE INDEX idx_patient_record_is_demo ON public.patient_record (organization_id, is_demo) WHERE is_demo = true AND deleted_at IS NULL;
