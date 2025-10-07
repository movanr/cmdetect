import { DataTable, ActionButtons } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useUsers, type User } from "@/lib/patient-records";
import { formatDistanceToNow } from "date-fns";
import { Users, Edit, Trash, UserPlus } from "lucide-react";
import { getTranslations } from "@/config/i18n";

export function TeamView() {
  const { data: users, isLoading } = useUsers();
  const t = getTranslations();

  const columns = [
    {
      key: "createdAt" as keyof User,
      header: t.dashboard.columns.created,
      width: "120px",
      render: (value: string) =>
        formatDistanceToNow(new Date(value), { addSuffix: true }),
    },
    {
      key: "name" as keyof User,
      header: t.dashboard.columns.name,
      width: "160px",
      render: (value: string) => value || "-",
    },
    {
      key: "email" as keyof User,
      header: t.dashboard.columns.email,
      render: (value: string) => value,
    },
    {
      key: "emailVerified" as keyof User,
      header: t.dashboard.columns.status,
      width: "100px",
      render: (value: boolean) => (
        <Badge variant={value ? "default" : "destructive"}>
          {value ? t.dashboard.verified : t.dashboard.unverified}
        </Badge>
      ),
    },
    {
      key: "actions" as keyof User,
      header: t.dashboard.columns.actions,
      width: "120px",
    },
  ];

  const renderActions = (_user: User) => (
    <ActionButtons>
      <Button size="sm" variant="ghost" title={t.dashboard.actions.editUser}>
        <Edit className="h-3 w-3" />
      </Button>
      <Button size="sm" variant="ghost" title={t.dashboard.actions.deleteUser}>
        <Trash className="h-3 w-3" />
      </Button>
    </ActionButtons>
  );

  if (isLoading) {
    return <DataTable data={[]} columns={columns} loading={true} />;
  }

  if (!users || users.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title={t.dashboard.emptyStates.users.title}
        description={t.dashboard.emptyStates.users.description}
        action={
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            {t.dashboard.actions.createNewUser}
          </Button>
        }
      />
    );
  }

  return <DataTable data={users} columns={columns} actions={renderActions} />;
}
