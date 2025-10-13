/**
 * Hook for fetching patient records filtered to submissions only
 */

import { useMemo } from "react";
import { usePatientRecords } from "./usePatientRecords";
import { filterSubmissions } from "../utils/filters";

export function useSubmissions() {
  const { data, ...rest } = usePatientRecords();

  const submissions = useMemo(() => {
    return data ? filterSubmissions(data) : [];
  }, [data]);

  return { data: submissions, ...rest };
}
