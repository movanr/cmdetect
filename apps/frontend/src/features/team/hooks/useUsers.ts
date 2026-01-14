/**
 * Hook for fetching users in the organization
 */

import { useQuery } from "@tanstack/react-query";
import { execute } from "@/graphql/execute";
import { GET_USERS } from "../queries";
import type { User } from "../types";

export type { User };

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const result = await execute(GET_USERS, {});
      return result.user || [];
    },
  });
}
