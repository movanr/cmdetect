# Application Database Schema

## Core Application Tables

### Organization

```sql
CREATE TABLE public.organization (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
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
    deleted_at timestamp with time zone
);
```

### Patient

```sql
CREATE TABLE public.patient (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    organization_id uuid NOT NULL,
    clinic_internal_id character varying NOT NULL,
    first_name_encrypted text NOT NULL,
    last_name_encrypted text NOT NULL,
    gender_encrypted text,
    date_of_birth_encrypted text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    deleted_at timestamp with time zone
);
```

### Patient Record (Questionnaire Cases)

```sql
CREATE TABLE public.patient_record (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    organization_id uuid NOT NULL,
    patient_id uuid NOT NULL,
    created_by uuid NOT NULL,
    assigned_to uuid NOT NULL,
    invite_token uuid DEFAULT public.uuid_generate_v4(),
    invite_expires_at timestamp with time zone DEFAULT (now() + '7 days'::interval),
    first_viewed_at timestamp with time zone,
    first_viewed_by uuid,
    last_activity_at timestamp with time zone,
    last_activity_by uuid,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    deleted_at timestamp with time zone
);
```

### Patient Consent

```sql
CREATE TABLE public.patient_consent (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    patient_record_id uuid NOT NULL,
    organization_id uuid NOT NULL,
    consent_given boolean NOT NULL,
    consent_text text NOT NULL,
    consent_version character varying NOT NULL,
    ip_address inet,
    user_agent text,
    consented_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    deleted_at timestamp with time zone
);
```

### Questionnaire Response

```sql
CREATE TABLE public.questionnaire_response (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    patient_record_id uuid NOT NULL,
    organization_id uuid NOT NULL,
    patient_consent_id uuid NOT NULL,
    fhir_resource jsonb NOT NULL,
    submitted_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    deleted_at timestamp with time zone
);
```

## Better Auth Tables

### User

```sql
CREATE TABLE public."user" (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    "emailVerified" boolean NOT NULL,
    image text,
    "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "firstName" text,
    "lastName" text,
    roles jsonb,
    "organizationId" uuid,
    "isActive" boolean,
    "deletedAt" timestamp without time zone,
    app_uuid uuid DEFAULT public.uuid_generate_v4(),
    "isAnonymous" boolean
);
```

### Session

```sql
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
```

### Account

```sql
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
```

### Verification

```sql
CREATE TABLE public.verification (
    id text NOT NULL,
    identifier text NOT NULL,
    value text NOT NULL,
    "expiresAt" timestamp without time zone NOT NULL,
    "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
```

## Key Constraints

### Primary Keys

- All tables have UUID primary keys (application tables) or text primary keys (auth tables)

### Foreign Keys

```sql
-- Patient Record relationships
patient_record.organization_id -> organization.id
patient_record.patient_id -> patient.id
patient_record.created_by -> user.app_uuid
patient_record.assigned_to -> user.app_uuid

-- Patient Consent relationships
patient_consent.patient_record_id -> patient_record.id
patient_consent.organization_id -> organization.id

-- Questionnaire Response relationships
questionnaire_response.patient_record_id -> patient_record.id
questionnaire_response.patient_consent_id -> patient_consent.id
questionnaire_response.organization_id -> organization.id

-- User relationships
user.organizationId -> organization.id

-- Auth relationships
account.userId -> user.id
session.userId -> user.id
```

### Unique Constraints

```sql
-- One consent per patient record
patient_consent: UNIQUE(patient_record_id)

-- One response per questionnaire per patient record
questionnaire_response: UNIQUE(patient_record_id, fhir_resource->>'questionnaire')

-- Unique clinic patient IDs per organization
patient: UNIQUE(organization_id, clinic_internal_id)

-- Unique invite tokens
patient_record: UNIQUE(invite_token) WHERE deleted_at IS NULL
```

## Triggers & Functions

### Update Registration on Consent

```sql
CREATE FUNCTION public.update_registration_status_on_consent() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE patient_record
    SET updated_at = NOW()
    WHERE id = NEW.patient_record_id;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_registration_status_on_consent
    AFTER INSERT OR UPDATE ON public.patient_consent
    FOR EACH ROW EXECUTE FUNCTION public.update_registration_status_on_consent();
```

## Key Design Patterns

1. **Organization Isolation**: All data tables include `organization_id` for multi-tenancy
2. **Soft Deletes**: `deleted_at` timestamp instead of hard deletes
3. **Audit Trail**: `created_at`, `updated_at`, activity tracking fields
4. **Encrypted PII**: Patient names and sensitive data are encrypted
5. **UUID Tokens**: Cryptographically secure invite tokens
6. **FHIR Compliance**: Questionnaire responses stored as JSONB FHIR resource
