/**
 * Hook to fetch active physicians in the organization.
 * Used by the Behandler (examiner) selector.
 */

import { useQuery } from "@tanstack/react-query";
import { execute } from "@/graphql/execute";
import { GET_PHYSICIANS } from "../queries";

export interface Physician {
  id: string;
  name: string;
}

export function usePhysicians() {
  return useQuery({
    queryKey: ["physicians"],
    queryFn: async () => {
      const result = await execute(GET_PHYSICIANS, {});
      return (result.user ?? []) as Physician[];
    },
    staleTime: 5 * 60 * 1000,
  });
}
