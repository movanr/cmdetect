/**
 * Mutations for patient records (create, update, delete)
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { execute } from "@/graphql/execute";
import { CREATE_PATIENT_RECORD, DELETE_PATIENT_RECORD } from "../queries";

export function useCreatePatientRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (clinic_internal_id: string) => {
      return execute(CREATE_PATIENT_RECORD, { clinic_internal_id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient-records"] });
    },
  });
}

export function useDeletePatientRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return execute(DELETE_PATIENT_RECORD, { id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient-records"] });
    },
  });
}
