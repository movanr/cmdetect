-- Add user relationships alongside existing practitioner relationships

-- Add user columns to patient_registration table
ALTER TABLE public.patient_registration 
    ADD COLUMN created_by_user_id text,
    ADD COLUMN assigned_user_id text,
    ADD COLUMN first_viewed_by_user_id text,
    ADD COLUMN last_activity_by_user_id text;

-- Add foreign key constraints to user table
ALTER TABLE ONLY public.patient_registration
    ADD CONSTRAINT fk_registration_created_by_user 
    FOREIGN KEY (created_by_user_id) 
    REFERENCES public."user"(id) 
    ON DELETE RESTRICT;

ALTER TABLE ONLY public.patient_registration
    ADD CONSTRAINT fk_registration_assigned_to_user 
    FOREIGN KEY (assigned_user_id) 
    REFERENCES public."user"(id) 
    ON DELETE RESTRICT;

ALTER TABLE ONLY public.patient_registration
    ADD CONSTRAINT fk_registration_first_viewed_by_user 
    FOREIGN KEY (first_viewed_by_user_id) 
    REFERENCES public."user"(id);

ALTER TABLE ONLY public.patient_registration
    ADD CONSTRAINT fk_registration_last_activity_by_user 
    FOREIGN KEY (last_activity_by_user_id) 
    REFERENCES public."user"(id);

-- Add indexes for performance
CREATE INDEX idx_registration_created_by_user 
    ON public.patient_registration(created_by_user_id) 
    WHERE deleted_at IS NULL;

CREATE INDEX idx_registration_assigned_to_user 
    ON public.patient_registration(assigned_user_id) 
    WHERE deleted_at IS NULL;

-- Link user table to organization via organizationId field
-- Better Auth defines organizationId as "string" type but stores UUID values
-- PostgreSQL can handle the conversion between text and uuid automatically
ALTER TABLE public."user" ALTER COLUMN "organizationId" TYPE uuid USING "organizationId"::uuid;

-- Add foreign key constraint to organization table
ALTER TABLE ONLY public."user"
    ADD CONSTRAINT fk_user_organization 
    FOREIGN KEY ("organizationId") 
    REFERENCES public.organization(id);

-- Add index for user -> organization relationship
CREATE INDEX idx_user_organization 
    ON public."user"("organizationId") 
    WHERE "deletedAt" IS NULL;