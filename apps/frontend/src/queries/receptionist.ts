import { graphql } from "../graphql";

// Search for patients by clinic internal ID
export const searchPatientsByClinicId = graphql(`
  query SearchPatientsByClinicId($clinicInternalId: String!) {
    patient(
      where: { 
        clinic_internal_id: { _eq: $clinicInternalId }
      }
    ) {
      id
      clinic_internal_id
      first_name_encrypted
      last_name_encrypted
      date_of_birth_encrypted
      gender_encrypted
      created_at
      organization_id
    }
  }
`);

// Get physicians from organization for assignment (filtered by Hasura permissions)
export const getOrganizationPhysicians = graphql(`
  query GetOrganizationPhysicians {
    user {
      id
      firstName
      lastName
      email
    }
  }
`);

// Create a new patient
export const createPatient = graphql(`
  mutation CreatePatient($patient: patient_insert_input!) {
    insert_patient_one(object: $patient) {
      id
      clinic_internal_id
      first_name_encrypted
      last_name_encrypted
      date_of_birth_encrypted
      gender_encrypted
      created_at
      organization_id
    }
  }
`);

// Create a patient record (case)
export const createPatientRecord = graphql(`
  mutation CreatePatientRecord($patientRecord: patient_record_insert_input!) {
    insert_patient_record_one(object: $patientRecord) {
      id
      patient_id
      assigned_to
      notes
      created_at
      created_by
      organization_id
      patient {
        id
        clinic_internal_id
        first_name_encrypted
        last_name_encrypted
      }
      user {
        id
        firstName
        lastName
        email
      }
    }
  }
`);