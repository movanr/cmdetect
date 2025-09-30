import { DataTable, StatusBadge, ActionButtons } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/RoleLayout'
import { useSubmissions, getPatientRecordStatus } from '@/lib/patient-records'
import { formatDistanceToNow } from 'date-fns'
import { Eye, FileText, Edit } from 'lucide-react'
import type { GetAllPatientRecordsQuery } from '@/graphql/graphql'

type PatientRecord = GetAllPatientRecordsQuery['patient_record'][number]

export function SubmissionsView() {
  const { data: submissions, isLoading } = useSubmissions()

  const columns = [
    {
      key: 'patient_data_completed_at' as keyof PatientRecord,
      header: 'Submitted',
      width: '120px',
      render: (value: string) => value ? formatDistanceToNow(new Date(value), { addSuffix: true }) : '-'
    },
    {
      key: 'first_name_encrypted' as keyof PatientRecord,
      header: 'Patient Name',
      width: '160px',
      render: (_: any, record: PatientRecord) => (
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">
            Encrypted
          </Badge>
          <span className="text-muted-foreground text-sm">
            {record.clinic_internal_id || 'No ID'}
          </span>
        </div>
      )
    },
    {
      key: 'date_of_birth_encrypted' as keyof PatientRecord,
      header: 'DOB',
      width: '100px',
      render: () => (
        <Badge variant="outline" className="text-xs">
          Encrypted
        </Badge>
      )
    },
    {
      key: 'notes' as keyof PatientRecord,
      header: 'Notes',
      render: (value: string) => value || '-'
    },
    {
      key: 'first_viewed_at' as keyof PatientRecord,
      header: 'First Viewed',
      width: '120px',
      render: (value: string) => value ? formatDistanceToNow(new Date(value), { addSuffix: true }) : 'Not viewed'
    },
    {
      key: 'id' as keyof PatientRecord,
      header: 'Status',
      width: '100px',
      render: (_: any, record: PatientRecord) => (
        <StatusBadge status={getPatientRecordStatus(record)} />
      )
    },
    {
      key: 'actions' as keyof PatientRecord,
      header: 'Actions',
      width: '120px'
    }
  ]

  const renderActions = (_record: PatientRecord) => (
    <ActionButtons>
      <Button size="sm" variant="ghost" title="Open Patient Record">
        <Eye className="h-3 w-3" />
      </Button>
      <Button size="sm" variant="ghost" title="Edit Notes">
        <Edit className="h-3 w-3" />
      </Button>
    </ActionButtons>
  )

  if (isLoading) {
    return <DataTable data={[]} columns={columns} loading={true} />
  }

  if (!submissions || submissions.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No submissions found"
        description="Patient submissions will appear here when patients complete their questionnaires."
      />
    )
  }

  return (
    <DataTable
      data={submissions}
      columns={columns}
      actions={renderActions}
    />
  )
}