-- Remove practitioner table and all related constraints/indexes

-- Drop foreign key constraints that reference practitioner table
ALTER TABLE ONLY public.patient_registration DROP CONSTRAINT IF EXISTS fk_registration_created_by;
ALTER TABLE ONLY public.patient_registration DROP CONSTRAINT IF EXISTS fk_registration_assigned_to;
ALTER TABLE ONLY public.patient_registration DROP CONSTRAINT IF EXISTS patient_registration_first_viewed_by_fkey;
ALTER TABLE ONLY public.patient_registration DROP CONSTRAINT IF EXISTS patient_registration_last_activity_by_fkey;

-- Drop indexes related to practitioner
DROP INDEX IF EXISTS idx_practitioner_auth_user_id;
DROP INDEX IF EXISTS idx_practitioner_email;
DROP INDEX IF EXISTS idx_practitioner_org_roles;
DROP INDEX IF EXISTS idx_registration_assigned_to;

-- Drop practitioner columns from patient_registration
ALTER TABLE public.patient_registration 
    DROP COLUMN IF EXISTS created_by_practitioner_id,
    DROP COLUMN IF EXISTS assigned_practitioner_id,
    DROP COLUMN IF EXISTS first_viewed_by,
    DROP COLUMN IF EXISTS last_activity_by;

-- Drop the practitioner table
DROP TABLE IF EXISTS public.practitioner CASCADE;