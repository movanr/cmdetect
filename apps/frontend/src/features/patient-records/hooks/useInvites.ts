/**
 * Hook for fetching patient records filtered to invites only
 */

import { useMemo } from "react";
import { usePatientRecords } from "./usePatientRecords";
import { filterInvites } from "../utils/filters";

export function useInvites() {
  const { data, ...rest } = usePatientRecords();

  const invites = useMemo(() => {
    console.log(
      "[invites] Processing invites from",
      data?.length || 0,
      "records"
    );
    return data ? filterInvites(data) : [];
  }, [data]);

  return { data: invites, ...rest };
}
