import { useMemo } from "react";
import { usePatientRecords } from "./usePatientRecords";
import { getInviteStatus } from "../utils/status";

export function useInvites() {
  const { data, ...rest } = usePatientRecords();

  const invites = useMemo(() => {
    return data ? data.filter((record) => getInviteStatus(record) !== "submitted") : [];
  }, [data]);

  return { data: invites, ...rest };
}
