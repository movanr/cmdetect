SET check_function_bodies = false;
CREATE TABLE public.account (
    id text NOT NULL,
    "accountId" text NOT NULL,
    "providerId" text NOT NULL,
    "userId" text NOT NULL,
    "accessToken" text,
    "refreshToken" text,
    "idToken" text,
    "accessTokenExpiresAt" timestamp without time zone,
    "refreshTokenExpiresAt" timestamp without time zone,
    scope text,
    password text,
    "createdAt" timestamp without time zone NOT NULL,
    "updatedAt" timestamp without time zone NOT NULL
);
CREATE TABLE public.jwks (
    id text NOT NULL,
    "publicKey" text NOT NULL,
    "privateKey" text NOT NULL,
    "createdAt" timestamp without time zone NOT NULL
);
CREATE TABLE public.organization (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    name character varying NOT NULL,
    address_line1 character varying,
    address_line2 character varying,
    city character varying,
    postal_code character varying,
    country character varying,
    phone character varying,
    email character varying,
    website character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    deleted_at timestamp with time zone,
    public_key_pem text,
    key_created_at timestamp with time zone DEFAULT now(),
    key_fingerprint text,
    CONSTRAINT organization_deleted_at_consistency CHECK (((deleted_at IS NULL) OR (deleted_at <= now()))),
    CONSTRAINT organization_email_format CHECK (((email IS NULL) OR ((email)::text ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text))),
    CONSTRAINT organization_name_not_empty CHECK ((length(TRIM(BOTH FROM name)) > 0))
);
CREATE TABLE public.patient_consent (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    patient_record_id text NOT NULL,
    organization_id text NOT NULL,
    consent_given boolean NOT NULL,
    consent_text text NOT NULL,
    consent_version character varying NOT NULL,
    consented_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    deleted_at timestamp with time zone,
    CONSTRAINT patient_consent_deleted_at_consistency CHECK (((deleted_at IS NULL) OR (deleted_at <= now()))),
    CONSTRAINT patient_consent_text_not_empty CHECK ((length(TRIM(BOTH FROM consent_text)) > 0)),
    CONSTRAINT patient_consent_version_not_empty CHECK ((length(TRIM(BOTH FROM consent_version)) > 0))
);
CREATE TABLE public.patient_record (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    organization_id text NOT NULL,
    created_by text NOT NULL,
    assigned_to text NOT NULL,
    invite_token text DEFAULT (gen_random_uuid())::text NOT NULL,
    invite_expires_at timestamp with time zone DEFAULT (now() + '7 days'::interval) NOT NULL,
    first_viewed_at timestamp with time zone,
    first_viewed_by text,
    last_activity_at timestamp with time zone,
    last_activity_by text,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    deleted_at timestamp with time zone,
    clinic_internal_id character varying NOT NULL,
    first_name_encrypted text,
    last_name_encrypted text,
    gender_encrypted text,
    date_of_birth_encrypted text,
    patient_data_completed_at timestamp with time zone,
    CONSTRAINT patient_record_clinic_internal_id_not_empty CHECK ((length(TRIM(BOTH FROM clinic_internal_id)) > 0)),
    CONSTRAINT patient_remaked_at IS NULL) OR (deleted_at <= now()))),
    CONSTRAINT patient_record_first_viewed_after_creation CHECK (((first_viewed_at IS NULL) OR (first_viewed_at >= created_at))),
    CONSTRAINT patient_record_invite_expires_future CHECK ((invite_expires_at > created_at)),
    CONSTRAINT patient_record_invite_token_not_empty CHECK ((length(TRIM(BOTH FROM invite_token)) > 0)),
    CONSTRAINT patient_record_last_activity_after_creation CHECK (((last_activity_at IS NULL) OR (last_activity_at >= created_at))),
    CONSTRAINT patient_record_patient_data_complete CHECK ((((first_name_encrypted IS NULL) AND (last_name_encrypted IS NULL) AND (patient_data_completed_at IS NULL)) OR ((first_name_encrypted IS NOT NULL) AND (last_name_encrypted IS NOT NULL) AND (patient_data_completed_at IS NOT NULL) AND (length(TRIM(BOTH FROM first_name_encrypted)) > 0) AND (length(TRIM(BOTH FROM last_name_encrypted)) > 0))))
);
CREATE TABLE public.questionnaire_response (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    patient_record_id text NOT NULL,
    organization_id text NOT NULL,
    patient_consent_id text NOT NULL,
    fhir_resource jsonb NOT NULL,
    submitted_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    deleted_at timestamp with time zone,
    CONSTRAINT questionnaire_response_deleted_at_consistency CHECK (((deleted_at IS NULL) OR (deleted_at <= now()))),
    CONSTRAINT questionnaire_response_fhir_has_questionnaire CHECK (((fhir_resource ? 'questionnaire'::text) AND ((fhir_resource ->> 'questionnaire'::text) <> ''::text))),
    CONSTRAINT questionnaire_response_fhir_not_empty CHECK (((jsonb_typeof(fhir_resource) = 'object'::text) AND (fhir_resource <> '{}'::jsonb))),
    CONSTRAINT questionnaire_response_submitted_at_reasonable CHECK (((submitted_at >= (created_at - '01:00:00'::interval)) AND (submitted_at <= (created_at + '01:00:00'::interval))))
);
CREATE TABLE public.session (
    id text NOT NULL,
    "expiresAt" timestamp without time zone NOT NULL,
    token text NOT NULL,
    "createdAt" timestamp without time zone NOT NULL,
    "updatedAt" timestamp without time zone NOT NULL,
    "ipAddress" text,
    "userAgent" text,
    "userId" text NOT NULL
);
CREATE TABLE public."user" (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    "emailVerified" boolean NOT NULL,
    image text,
    "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "isAnonymous" boolean,
    "firstName" text,
    "lastName" text,
    roles jsonb,
    "activeRole" text,
    "organizationId" text,
    app_uuid text,
    "isActive" boolean,
    "deletedAt" timestamp without time zone,
    CONSTRAINT user_deleted_at_consistency CHECK ((("deletedAt" IS NULL) OR ("deletedAt" <= now()))),
    CONSTRAINT user_email_format CHECK ((email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.:/%-]+$'::text)),
    CONSTRAINT user_name_not_empty CHECK ((length(TRIM(BOTH FROM name)) > 0)),
    CONSTRAINT user_roles_is_array CHECK ((jsonb_typeof(roles) = 'array'::text))
);
CREATE TABLE public.verification (
    id text NOT NULL,
    identifier text NOT NULL,
    value text NOT NULL,
    "expiresAt" timestamp without time zone NOT NULL,
    "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.jwks
    ADD CONSTRAINT jwks_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.organization
    ADD CONSTRAINT organization_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.patient_consent
    ADD CONSTRAINT patient_consent_patient_record_unique UNIQUE (patient_record_id);
ALTER TABLE ONLY public.patient_consent
    ADD CONSTRAINT patient_consent_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.patient_record
    ADD CONSTRAINT patient_record_invite_token_unique UNIQUE (invite_token);
ALTER TABLE ONLY public.patient_record
    ADD CONSTRAINT patient_record_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.questionnaire_response
    ADD CONSTRAINT questionnaire_response_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_token_key UNIQUE (token);
ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_email_key UNIQUE (email);
ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_email_unique UNIQUE (email);
ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.verification
    ADD CONSTRAINT verification_pkey PRIMARY KEY (id);
CREATE INDEX idx_patient_consent_consented_at ON public.patient_consent USING btree (consented_at DESC) WHERE (deleted_at IS NULL);
CREATE INDEX idx_patient_consent_organization_id ON public.patient_consent USING btree (organization_id) WHERE (deleted_at IS NULL);
CREATE INDEX idx_patient_record_activity_times ON public.patient_record USING btree (last_activity_at DESC, first_viewed_at) WHERE (deleted_at IS NULL);
CREATE INDEX idx_patient_record_assigned_to ON public.patient_record USING btree (assigned_to) WHERE (deleted_at IS NULL);
CREATE INDEX idx_patient_record_clinic_internal_id ON public.patient_record USING btree (organization_id, clinic_internal_id) WHERE (deleted_at IS NULL);
CREATE INDEX idx_patient_record_completed ON public.patient_record USING btree (organization_id, patient_data_completed_at DESC) WHERE ((patient_data_completed_at IS NOT NULL) AND (deleted_at IS NULL));
CREATE INDEX idx_patient_record_created_by ON public.patient_record USING btree (created_by) WHERE (deleted_at IS NULL);
CREATE INDEX idx_patient_record_incomplete ON public.patient_record USING btree (organization_id, created_at) WHERE ((patient_data_completed_at IS NULL) AND (deleted_at IS NULL));
CREATE INDEX idx_patient_record_invite_token ON public.patient_record USING btree (invite_token) WHERE (deleted_at IS NULL);
CREATE INDEX idx_patient_record_organization_id ON public.patient_record USING btree (organization_id) WHERE (deleted_at IS NULL);
CREATE INDEX idx_questionnaire_response_fhir_questionnaire ON public.questionnaire_response USING btree (((fhir_resource ->> 'questionnaire'::text))) WHERE (deleted_at IS NULL);
CREATE INDEX idx_questionnaire_response_organization_id ON public.questionnaire_response USING btree (organization_id) WHERE (deleted_at IS NULL);
CREATE INDEX idx_questionnaire_response_patient_consent_id ON public.questionnaire_response USING btree (patient_consent_id) WHERE (deleted_at IS NULL);
CREATE INDEX idx_questionnaire_response_patient_record_id ON public.questionnaire_response USING btree (patient_record_id) WHERE (deleted_at IS NULL);
CREATE INDEX idx_questionnaire_response_submitted_at ON public.questionnaire_response USING btree (submitted_at DESC) WHERE (deleted_at IS NULL);
CREATE INDEX idx_user_organization_id ON public."user" USING btree ("organizationId") WHERE ("deletedAt" IS NULL);
CREATE INDEX idx_user_roles ON public."user" USING gin (roles) WHERE ("deletedAt" IS NULL);
CREATE UNIQUE INDEX questionnaire_response_unique_per_questionnaire ON public.questionnaire_response USING btree (patient_record_id, ((fhir_resource ->> 'questionnaire'::text))) WHERE (deleted_at IS NULL);
ALTER TABLE ONLY public.account
    ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.patient_consent
    ADD CONSTRAINT patient_consent_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organization(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.patient_consent
    ADD CONSTRAINT patient_consent_patient_record_id_fkey FOREIGN KEY (patient_record_id) REFERENCES public.patient_record(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.patient_record
    ADD CONSTRAINT patient_record_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public."user"(id) ON DELETE RESTRICT;
ALTER TABLE ONLY public.patient_record
    ADD CONSTRAINT patient_record_created_by_fkey FOREIGN KEY (created_by) REFERENCES public."user"(id) ON DELETE RESTRICT;
ALTER TABLE ONLY public.patient_record
    ADD CONSTRAINT patient_record_first_viewed_by_fkey FOREIGN KEY (first_viewed_by) REFERENCES public."user"(id) ON DELETE SET NULL;
ALTER TABLE ONLY public.patient_record
    ADD CONSTRAINT patient_record_last_activity_by_fkey FOREIGN KEY (last_activity_by) REFERENCES public."user"(id) ON DELETE SET NULL;
ALTER TABLE ONLY public.patient_record
    ADD CONSTRAINT patient_record_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organization(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.questionnaire_response
    ADD CONSTRAINT questionnaire_response_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organization(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.questionnaire_response
    ADD CONSTRAINT questionnaire_response_patient_consent_id_fkey FOREIGN KEY (patient_consent_id) REFERENCES public.patient_consent(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.questionnaire_response
    ADD CONSTRAINT questionnaire_response_patient_record_id_fkey FOREIGN KEY (patient_record_id) REFERENCES public.patient_record(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.session
    ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_organization_id_fkey FOREIGN KEY ("organizationId") REFERENCES public.organization(id) ON DELETE SET NULL;
