CREATE TABLE public.examination_response (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    patient_record_id text NOT NULL,
    organization_id text NOT NULL,
    examined_by text NOT NULL,
    response_data jsonb NOT NULL,
    status varchar NOT NULL DEFAULT 'draft',
    completed_sections jsonb NOT NULL DEFAULT '[]'::jsonb,
    started_at timestamptz DEFAULT now(),
    completed_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    deleted_at timestamptz,

    CONSTRAINT examination_response_pkey PRIMARY KEY (id),
    CONSTRAINT examination_response_patient_record_unique UNIQUE (patient_record_id),
    CONSTRAINT examination_response_status_valid CHECK (status IN ('draft', 'in_progress', 'completed')),
    CONSTRAINT examination_response_data_not_empty CHECK (jsonb_typeof(response_data) = 'object' AND response_data <> '{}'::jsonb),
    CONSTRAINT examination_response_completed_sections_is_array CHECK (jsonb_typeof(completed_sections) = 'array'),
    CONSTRAINT examination_response_completed_at_consistency CHECK ((completed_at IS NULL) OR (status = 'completed')),

    CONSTRAINT examination_response_patient_record_id_fkey FOREIGN KEY (patient_record_id) REFERENCES public.patient_record(id) ON DELETE CASCADE,
    CONSTRAINT examination_response_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organization(id) ON DELETE CASCADE,
    CONSTRAINT examination_response_examined_by_fkey FOREIGN KEY (examined_by) REFERENCES public."user"(id) ON DELETE RESTRICT
);

CREATE INDEX idx_examination_response_organization_id ON public.examination_response (organization_id) WHERE (deleted_at IS NULL);
CREATE INDEX idx_examination_response_patient_record_id ON public.examination_response (patient_record_id) WHERE (deleted_at IS NULL);
CREATE INDEX idx_examination_response_status ON public.examination_response (organization_id, status) WHERE (deleted_at IS NULL);