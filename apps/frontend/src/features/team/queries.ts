/**
 * Team GraphQL Queries
 */

import { graphql } from "@/graphql/gql";

export const GET_USERS = graphql(`
  query GetUsers {
    user(
      where: { isAnonymous: { _eq: false } }
      order_by: [{ createdAt: desc }]
    ) {
      id
      email
      name
      createdAt
      emailVerified
      organizationId
    }
  }
`);
