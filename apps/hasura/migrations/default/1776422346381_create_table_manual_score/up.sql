CREATE TABLE public.manual_score (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    patient_record_id text NOT NULL,
    organization_id text NOT NULL,
    questionnaire_id text NOT NULL,
    scores jsonb NOT NULL DEFAULT '{}'::jsonb,
    note text NOT NULL DEFAULT '',
    updated_by text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz,

    CONSTRAINT manual_score_pkey PRIMARY KEY (id),
    CONSTRAINT manual_score_unique UNIQUE (patient_record_id, questionnaire_id),
    CONSTRAINT manual_score_scores_is_object CHECK (jsonb_typeof(scores) = 'object'),
    CONSTRAINT manual_score_questionnaire_id_valid CHECK (questionnaire_id IN (
        'phq-4',
        'jfls-8',
        'jfls-20',
        'obc',
        'gcps-1m',
        'dc-tmd-pain-drawing'
    )),

    CONSTRAINT manual_score_patient_record_id_fkey FOREIGN KEY (patient_record_id) REFERENCES public.patient_record(id) ON DELETE CASCADE,
    CONSTRAINT manual_score_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organization(id) ON DELETE CASCADE,
    CONSTRAINT manual_score_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public."user"(id) ON DELETE SET NULL
);

CREATE INDEX idx_manual_score_organization_id ON public.manual_score (organization_id) WHERE (deleted_at IS NULL);
CREATE INDEX idx_manual_score_patient_record_id ON public.manual_score (patient_record_id) WHERE (deleted_at IS NULL);
