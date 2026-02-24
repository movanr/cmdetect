declare const _brand: unique symbol;
type Brand<T, TBrand> = T & { readonly [_brand]: TBrand };

export type ValidatedRole = Brand<string, 'ValidatedRole'>;
export type OrganizationUserId = Brand<string, 'OrganizationUserId'>;

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