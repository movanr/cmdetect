/**
 * Core hook for fetching all patient records
 */

import { useQuery } from "@tanstack/react-query";
import { execute } from "@/graphql/execute";
import { GET_ALL_PATIENT_RECORDS } from "../queries";

export function usePatientRecords() {
  return useQuery({
    queryKey: ["patient-records"],
    queryFn: async () => {
      try {
        const result = await execute(GET_ALL_PATIENT_RECORDS);
        return result.patient_record || [];
      } catch (error) {
        throw error;
      }
    },
  });
}
