import { DataTable, StatusBadge, ActionButtons } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { useInvites, getPatientRecordStatus } from '@/lib/patient-records'
import { formatDistanceToNow } from 'date-fns'
import { ExternalLink, Copy, Edit, Trash } from 'lucide-react'
import type { GetAllPatientRecordsQuery } from '@/graphql/graphql'
import { getTranslations } from '@/config/i18n'

type PatientRecord = GetAllPatientRecordsQuery['patient_record'][number]

export function InvitesView() {
  const { data: invites, isLoading } = useInvites()
  const t = getTranslations()

  const columns = [
    {
      key: 'created_at' as keyof PatientRecord,
      header: t.dashboard.columns.created,
      width: '120px',
      render: (value: string) => formatDistanceToNow(new Date(value), { addSuffix: true })
    },
    {
      key: 'created_by' as keyof PatientRecord,
      header: t.dashboard.columns.createdBy,
      width: '120px',
      render: (value: string) => value || t.dashboard.system
    },
    {
      key: 'clinic_internal_id' as keyof PatientRecord,
      header: t.dashboard.columns.internalId,
      width: '120px'
    },
    {
      key: 'invite_token' as keyof PatientRecord,
      header: t.dashboard.columns.inviteUrl,
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
              title={t.dashboard.actions.copyInviteUrl}
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
      header: t.dashboard.columns.expires,
      width: '120px',
      render: (value: string) => value ? formatDistanceToNow(new Date(value), { addSuffix: true }) : t.dashboard.never
    },
    {
      key: 'notes' as keyof PatientRecord,
      header: t.dashboard.columns.notes,
      render: (value: string) => value || '-'
    },
    {
      key: 'id' as keyof PatientRecord,
      header: t.dashboard.columns.status,
      width: '100px',
      render: (_: any, record: PatientRecord) => (
        <StatusBadge status={getPatientRecordStatus(record)} />
      )
    },
    {
      key: 'actions' as keyof PatientRecord,
      header: t.dashboard.columns.actions,
      width: '120px'
    }
  ]

  const renderActions = (_record: PatientRecord) => (
    <ActionButtons>
      <Button size="sm" variant="ghost" title={t.dashboard.actions.editNotes}>
        <Edit className="h-3 w-3" />
      </Button>
      <Button size="sm" variant="ghost" title={t.dashboard.actions.openInvite}>
        <ExternalLink className="h-3 w-3" />
      </Button>
      <Button size="sm" variant="ghost" title={t.dashboard.actions.deleteInvite}>
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
        title={t.dashboard.emptyStates.invites.title}
        description={t.dashboard.emptyStates.invites.description}
        action={
          <Button>
            {t.dashboard.actions.createNewInvite}
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