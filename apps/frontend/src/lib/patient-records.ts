import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { execute } from '@/graphql/execute'
import { GET_ALL_PATIENT_RECORDS, GET_USERS } from '@/queries/patient-records'
import type { GetAllPatientRecordsQuery, GetUsersQuery } from '@/graphql/graphql'

type PatientRecord = GetAllPatientRecordsQuery['patient_record'][number]
export type User = GetUsersQuery['user'][number]

// Status calculation functions
export function getPatientRecordStatus(record: PatientRecord): string {
  if (record.patient_consent?.consent_given === false) {
    return 'consent_denied'
  }
  if (record.first_viewed_at) {
    return 'viewed'
  }
  if (record.patient_data_completed_at) {
    return 'submitted'
  }
  if (record.invite_expires_at && new Date(record.invite_expires_at) <= new Date()) {
    return 'expired'
  }
  return 'pending'
}

export function isInviteStatus(status: string): boolean {
  return ['consent_denied', 'expired', 'pending'].includes(status)
}

export function isSubmissionStatus(status: string): boolean {
  return ['submitted', 'viewed'].includes(status)
}

// Fetch once, use everywhere
export const usePatientRecords = () => {
  return useQuery({
    queryKey: ['patient-records'],
    queryFn: async () => {
      const result = await execute(GET_ALL_PATIENT_RECORDS)
      return result.patient_record || []
    }
  })
}

// Derive invites
export const useInvites = () => {
  const { data, ...rest } = usePatientRecords()

  const invites = useMemo(() => {
    return data?.filter((record: PatientRecord) =>
      isInviteStatus(getPatientRecordStatus(record))
    ) ?? []
  }, [data])

  return { data: invites, ...rest }
}

// Derive submissions
export const useSubmissions = () => {
  const { data, ...rest } = usePatientRecords()

  const submissions = useMemo(() => {
    return data?.filter((record: PatientRecord) =>
      isSubmissionStatus(getPatientRecordStatus(record))
    ) ?? []
  }, [data])

  return { data: submissions, ...rest }
}

// Users query
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const result = await execute(GET_USERS)
      return result.user || []
    }
  })
}