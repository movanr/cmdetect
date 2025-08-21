// User JWT payload structure for authorization validation
export interface UserJWTPayload {
  'https://hasura.io/jwt/claims': {
    'x-hasura-user-id': string;
    'x-hasura-organization-id': string;
    'x-hasura-default-role': string;
    'x-hasura-allowed-roles': string[];
    'x-hasura-roles': string[];
    'x-hasura-practitioner-id'?: string;
  };
  iat: number;
  exp: number;
  iss: string;
}