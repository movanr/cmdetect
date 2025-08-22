-- Remove user relationships from patient_registration table

-- Drop foreign key constraints first
ALTER TABLE ONLY public.patient_registration DROP CONSTRAINT IF EXISTS fk_registration_created_by_user;
ALTER TABLE ONLY public.patient_registration DROP CONSTRAINT IF EXISTS fk_registration_assigned_to_user;
ALTER TABLE ONLY public.patient_registration DROP CONSTRAINT IF EXISTS fk_registration_first_viewed_by_user;
ALTER TABLE ONLY public.patient_registration DROP CONSTRAINT IF EXISTS fk_registration_last_activity_by_user;

-- Drop indexes
DROP INDEX IF EXISTS idx_registration_created_by_user;
DROP INDEX IF EXISTS idx_registration_assigned_to_user;

-- Drop user columns
ALTER TABLE public.patient_registration 
    DROP COLUMN IF EXISTS created_by_user_id,
    DROP COLUMN IF EXISTS assigned_user_id,
    DROP COLUMN IF EXISTS first_viewed_by_user_id,
    DROP COLUMN IF EXISTS last_activity_by_user_id;

-- Remove user -> organization relationship
ALTER TABLE ONLY public."user" DROP CONSTRAINT IF EXISTS fk_user_organization;
DROP INDEX IF EXISTS idx_user_organization;

-- Change organizationId back to text type
ALTER TABLE public."user" ALTER COLUMN "organizationId" TYPE text;