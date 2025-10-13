/**
 * Team Feature Types
 */

import type { GetUsersQuery } from "@/graphql/graphql";

export type User = GetUsersQuery["user"][number];
