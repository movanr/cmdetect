import { useMemo } from "react";
import { usePatientRecords } from "./usePatientRecords";
import { getCaseStatus, isSubmissionStatus } from "../utils/status";

export function useSubmissions() {
  const { data, ...rest } = usePatientRecords();

  const submissions = useMemo(() => {
    return data ? data.filter((record) => isSubmissionStatus(getCaseStatus(record))) : [];
  }, [data]);

  return { data: submissions, ...rest };
}
