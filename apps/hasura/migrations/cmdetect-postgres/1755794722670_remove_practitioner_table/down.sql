-- Restore practitioner table and all related constraints/indexes

-- Recreate practitioner table
CREATE TABLE public.practitioner (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    auth_user_id character varying NOT NULL,
    email character varying NOT NULL,
    first_name character varying NOT NULL,
    last_name character varying NOT NULL,
    roles text[] DEFAULT '{}'::text[] NOT NULL,
    organization_id uuid NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    deleted_at timestamp with time zone,
    CONSTRAINT practitioner_roles_not_empty CHECK ((array_length(roles, 1) > 0)),
    CONSTRAINT practitioner_roles_valid CHECK ((roles <@ ARRAY['org_admin'::text, 'physician'::text, 'receptionist'::text]))
);

-- Add primary key and unique constraints
ALTER TABLE ONLY public.practitioner
    ADD CONSTRAINT practitioner_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.practitioner
    ADD CONSTRAINT practitioner_auth_user_id_key UNIQUE (auth_user_id);

ALTER TABLE ONLY public.practitioner
    ADD CONSTRAINT practitioner_email_key UNIQUE (email);

-- Add foreign key to organization
ALTER TABLE ONLY public.practitioner
    ADD CONSTRAINT fk_practitioner_organization 
    FOREIGN KEY (organization_id) 
    REFERENCES public.organization(id) 
    ON DELETE CASCADE;

-- Recreate indexes
CREATE UNIQUE INDEX idx_practitioner_auth_user_id ON public.practitioner USING btree (auth_user_id) WHERE (deleted_at IS NULL);
CREATE UNIQUE INDEX idx_practitioner_email ON public.practitioner USING btree (email) WHERE (deleted_at IS NULL);
CREATE INDEX idx_practitioner_org_roles ON public.practitioner USING btree (organization_id, roles) WHERE (deleted_at IS NULL);

-- Restore practitioner columns to patient_registration
ALTER TABLE public.patient_registration 
    ADD COLUMN created_by_practitioner_id uuid,
    ADD COLUMN assigned_practitioner_id uuid,
    ADD COLUMN first_viewed_by uuid,
    ADD COLUMN last_activity_by uuid;

-- Restore foreign key constraints from patient_registration to practitioner
ALTER TABLE ONLY public.patient_registration
    ADD CONSTRAINT fk_registration_created_by 
    FOREIGN KEY (created_by_practitioner_id) 
    REFERENCES public.practitioner(id) 
    ON DELETE RESTRICT;

ALTER TABLE ONLY public.patient_registration
    ADD CONSTRAINT fk_registration_assigned_to 
    FOREIGN KEY (assigned_practitioner_id) 
    REFERENCES public.practitioner(id) 
    ON DELETE RESTRICT;

ALTER TABLE ONLY public.patient_registration
    ADD CONSTRAINT patient_registration_first_viewed_by_fkey 
    FOREIGN KEY (first_viewed_by) 
    REFERENCES public.practitioner(id);

ALTER TABLE ONLY public.patient_registration
    ADD CONSTRAINT patient_registration_last_activity_by_fkey 
    FOREIGN KEY (last_activity_by) 
    REFERENCES public.practitioner(id);

-- Restore index on assigned practitioner
CREATE INDEX idx_registration_assigned_to ON public.patient_registration USING btree (assigned_practitioner_id) WHERE (deleted_at IS NULL);