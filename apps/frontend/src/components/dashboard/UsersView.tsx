import { DataTable, ActionButtons } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/RoleLayout'
import { useUsers, type User } from '@/lib/patient-records'
import { formatDistanceToNow } from 'date-fns'
import { Users, Edit, Trash, UserPlus } from 'lucide-react'

export function UsersView() {
  const { data: users, isLoading } = useUsers()

  const columns = [
    {
      key: 'createdAt' as keyof User,
      header: 'Created',
      width: '120px',
      render: (value: string) => formatDistanceToNow(new Date(value), { addSuffix: true })
    },
    {
      key: 'name' as keyof User,
      header: 'Name',
      width: '160px',
      render: (value: string) => value || '-'
    },
    {
      key: 'email' as keyof User,
      header: 'Email',
      render: (value: string) => value
    },
    {
      key: 'emailVerified' as keyof User,
      header: 'Status',
      width: '100px',
      render: (value: boolean) => (
        <Badge variant={value ? 'default' : 'destructive'}>
          {value ? 'Verified' : 'Unverified'}
        </Badge>
      )
    },
    {
      key: 'actions' as keyof User,
      header: 'Actions',
      width: '120px'
    }
  ]

  const renderActions = (_user: User) => (
    <ActionButtons>
      <Button size="sm" variant="ghost" title="Edit User">
        <Edit className="h-3 w-3" />
      </Button>
      <Button size="sm" variant="ghost" title="Delete User">
        <Trash className="h-3 w-3" />
      </Button>
    </ActionButtons>
  )

  if (isLoading) {
    return <DataTable data={[]} columns={columns} loading={true} />
  }

  if (!users || users.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No users found"
        description="Organization users will appear here. Create a new user to get started."
        action={
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Create New User
          </Button>
        }
      />
    )
  }

  return (
    <DataTable
      data={users}
      columns={columns}
      actions={renderActions}
    />
  )
}