import { graphql } from "@/graphql/gql";

export const CREATE_PATIENT_RECORD = graphql(`
  mutation CreatePatientRecord($clinic_internal_id: String!) {
    insert_patient_record_one(
      object: { clinic_internal_id: $clinic_internal_id }
    ) {
      id
      clinic_internal_id
      invite_token
      invite_expires_at
      created_at
      created_by
    }
  }
`);

export const DELETE_PATIENT_RECORD = graphql(`
  mutation DeletePatientRecord($id: String!) {
    update_patient_record_by_pk(
      pk_columns: { id: $id }
      _set: { deleted_at: "now()" }
    ) {
      id
    }
  }
`);
