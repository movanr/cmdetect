import { DataTable, StatusBadge, ActionButtons } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/RoleLayout'
import { useInvites, getPatientRecordStatus } from '@/lib/patient-records'
import { formatDistanceToNow } from 'date-fns'
import { ExternalLink, Copy, Edit, Trash } from 'lucide-react'
import type { GetAllPatientRecordsQuery } from '@/graphql/graphql'

type PatientRecord = GetAllPatientRecordsQuery['patient_record'][number]

export function InvitesView() {
  const { data: invites, isLoading } = useInvites()

  const columns = [
    {
      key: 'created_at' as keyof PatientRecord,
      header: 'Created',
      width: '120px',
      render: (value: string) => formatDistanceToNow(new Date(value), { addSuffix: true })
    },
    {
      key: 'created_by' as keyof PatientRecord,
      header: 'Created By',
      width: '120px',
      render: (value: string) => value || 'System'
    },
    {
      key: 'clinic_internal_id' as keyof PatientRecord,
      header: 'Internal ID',
      width: '120px'
    },
    {
      key: 'invite_token' as keyof PatientRecord,
      header: 'Invite URL',
      width: '140px',
      render: (token: string) => (
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="font-mono text-xs">
            {token?.slice(-8) || 'N/A'}
          </Badge>
          {token && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                const url = `${window.location.origin}/patient?token=${token}`
                navigator.clipboard.writeText(url)
              }}
            >
              <Copy className="h-3 w-3" />
            </Button>
          )}
        </div>
      )
    },
    {
      key: 'invite_expires_at' as keyof PatientRecord,
      header: 'Expires',
      width: '120px',
      render: (value: string) => value ? formatDistanceToNow(new Date(value), { addSuffix: true }) : 'Never'
    },
    {
      key: 'notes' as keyof PatientRecord,
      header: 'Notes',
      render: (value: string) => value || '-'
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
      <Button size="sm" variant="ghost">
        <Edit className="h-3 w-3" />
      </Button>
      <Button size="sm" variant="ghost">
        <ExternalLink className="h-3 w-3" />
      </Button>
      <Button size="sm" variant="ghost">
        <Trash className="h-3 w-3" />
      </Button>
    </ActionButtons>
  )

  if (isLoading) {
    return <DataTable data={[]} columns={columns} loading={true} />
  }

  if (!invites || invites.length === 0) {
    return (
      <EmptyState
        icon={ExternalLink}
        title="No invites found"
        description="Patient invites will appear here. Create a new invite to get started."
        action={
          <Button>
            Create New Invite
          </Button>
        }
      />
    )
  }

  return (
    <DataTable
      data={invites}
      columns={columns}
      actions={renderActions}
    />
  )
}