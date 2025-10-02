import { graphql } from "../graphql";

// Get users from organization
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
