-- diagnosis_evaluation: one per patient_record (evaluation session metadata)
CREATE TABLE public.diagnosis_evaluation (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    patient_record_id text NOT NULL,
    organization_id text NOT NULL,
    source_data_hash text NOT NULL,
    evaluated_by text NOT NULL,
    evaluated_at timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    deleted_at timestamptz,

    CONSTRAINT diagnosis_evaluation_pkey PRIMARY KEY (id),
    CONSTRAINT diagnosis_evaluation_patient_record_unique UNIQUE (patient_record_id),

    CONSTRAINT diagnosis_evaluation_patient_record_id_fkey FOREIGN KEY (patient_record_id) REFERENCES public.patient_record(id) ON DELETE CASCADE,
    CONSTRAINT diagnosis_evaluation_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organization(id) ON DELETE CASCADE,
    CONSTRAINT diagnosis_evaluation_evaluated_by_fkey FOREIGN KEY (evaluated_by) REFERENCES public."user"(id) ON DELETE RESTRICT
);

CREATE INDEX idx_diagnosis_evaluation_organization_id ON public.diagnosis_evaluation (organization_id) WHERE (deleted_at IS NULL);
CREATE INDEX idx_diagnosis_evaluation_patient_record_id ON public.diagnosis_evaluation (patient_record_id) WHERE (deleted_at IS NULL);

-- diagnosis_result: one per (patient_record, diagnosis, side, region)
CREATE TABLE public.diagnosis_result (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    diagnosis_evaluation_id text NOT NULL,
    patient_record_id text NOT NULL,
    organization_id text NOT NULL,
    diagnosis_id text NOT NULL,
    side text NOT NULL,
    region text NOT NULL,
    computed_status text NOT NULL,
    practitioner_decision text,
    decided_by text,
    decided_at timestamptz,
    note text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),

    CONSTRAINT diagnosis_result_pkey PRIMARY KEY (id),
    CONSTRAINT diagnosis_result_unique UNIQUE (patient_record_id, diagnosis_id, side, region),
    CONSTRAINT diagnosis_result_side_valid CHECK (side IN ('left', 'right')),
    CONSTRAINT diagnosis_result_region_valid CHECK (region IN ('temporalis', 'masseter', 'tmj', 'otherMast', 'nonMast')),
    CONSTRAINT diagnosis_result_computed_status_valid CHECK (computed_status IN ('positive', 'negative', 'pending')),
    CONSTRAINT diagnosis_result_practitioner_decision_valid CHECK (practitioner_decision IS NULL OR practitioner_decision IN ('confirmed', 'rejected', 'added')),

    CONSTRAINT diagnosis_result_evaluation_id_fkey FOREIGN KEY (diagnosis_evaluation_id) REFERENCES public.diagnosis_evaluation(id) ON DELETE CASCADE,
    CONSTRAINT diagnosis_result_patient_record_id_fkey FOREIGN KEY (patient_record_id) REFERENCES public.patient_record(id) ON DELETE CASCADE,
    CONSTRAINT diagnosis_result_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organization(id) ON DELETE CASCADE,
    CONSTRAINT diagnosis_result_decided_by_fkey FOREIGN KEY (decided_by) REFERENCES public."user"(id) ON DELETE SET NULL
);

CREATE INDEX idx_diagnosis_result_evaluation_id ON public.diagnosis_result (diagnosis_evaluation_id);
CREATE INDEX idx_diagnosis_result_patient_record_id ON public.diagnosis_result (patient_record_id);
CREATE INDEX idx_diagnosis_result_organization_id ON public.diagnosis_result (organization_id);
