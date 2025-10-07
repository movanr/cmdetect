import { graphql } from "../../graphql";

// Query single organization by ID
export const getOrganizationById = graphql(`
  query GetOrganizationById($id: String!) {
    organization_by_pk(id: $id) {
      id
      name
      city
      created_at
      public_key_pem
      key_fingerprint
      key_created_at
    }
  }
`);

// Update organization public key
export const updateOrganizationPublicKey = graphql(`
  mutation UpdateOrganizationPublicKey(
    $id: String!
    $public_key_pem: String!
    $key_fingerprint: String!
    $key_created_at: timestamptz!
  ) {
    update_organization_by_pk(
      pk_columns: { id: $id }
      _set: {
        public_key_pem: $public_key_pem
        key_fingerprint: $key_fingerprint
        key_created_at: $key_created_at
      }
    ) {
      id
      public_key_pem
      key_fingerprint
      key_created_at
    }
  }
`);
