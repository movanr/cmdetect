CREATE TABLE public.criterion_assessment (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    patient_record_id text NOT NULL,
    organization_id text NOT NULL,
    criterion_id text NOT NULL,
    side text,
    region text,
    site text,
    state text NOT NULL,
    assessed_by text NOT NULL,
    assessed_at timestamptz DEFAULT now() NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),

    CONSTRAINT criterion_assessment_pkey PRIMARY KEY (id),
    CONSTRAINT criterion_assessment_unique UNIQUE NULLS NOT DISTINCT
      (patient_record_id, criterion_id, side, region, site),
    CONSTRAINT criterion_assessment_site_valid CHECK (site IS NULL OR site IN
      ('posteriorMandibular', 'submandibular', 'lateralPterygoid', 'temporalisTendon')),
    CONSTRAINT criterion_assessment_state_valid CHECK (state IN ('positive', 'negative', 'pending')),
    CONSTRAINT criterion_assessment_side_valid CHECK (side IS NULL OR side IN ('left', 'right')),
    CONSTRAINT criterion_assessment_region_valid CHECK (region IS NULL OR region IN
      ('temporalis', 'masseter', 'tmj', 'otherMast', 'nonMast')),

    CONSTRAINT criterion_assessment_patient_record_id_fkey
      FOREIGN KEY (patient_record_id) REFERENCES public.patient_record(id) ON DELETE CASCADE,
    CONSTRAINT criterion_assessment_organization_id_fkey
      FOREIGN KEY (organization_id) REFERENCES public.organization(id) ON DELETE CASCADE,
    CONSTRAINT criterion_assessment_assessed_by_fkey
      FOREIGN KEY (assessed_by) REFERENCES public."user"(id) ON DELETE SET NULL
);

CREATE INDEX idx_criterion_assessment_patient_record_id ON public.criterion_assessment (patient_record_id);
CREATE INDEX idx_criterion_assessment_organization_id ON public.criterion_assessment (organization_id);
