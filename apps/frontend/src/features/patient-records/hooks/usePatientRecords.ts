/**
 * Core hook for fetching all patient records
 */

import { execute } from "@/graphql/execute";
import { useQuery } from "@tanstack/react-query";
import { GET_ALL_PATIENT_RECORDS } from "../queries";

export function usePatientRecords() {
  return useQuery({
    queryKey: ["patient-records"],
    queryFn: async () => {
      const result = await execute(GET_ALL_PATIENT_RECORDS, {});
      return result.patient_record || [];
    },
  });
}
