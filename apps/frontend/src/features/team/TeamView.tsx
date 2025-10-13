import { DataTable, ActionButtons } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useUsers, type User } from "./hooks/useUsers";
import { formatDistanceToNow } from "@/lib/date-utils";
import { Users, Edit, Trash, UserPlus } from "lucide-react";
import { getTranslations } from "@/config/i18n";

export function TeamView() {
  const { data: users, isLoading } = useUsers();
  const t = getTranslations();

  const columns = [
    {
      key: "createdAt" as keyof User,
      header: t.columns.created,
      width: "120px",
      render: (value: string) =>
        formatDistanceToNow(new Date(value), { addSuffix: true }),
    },
    {
      key: "name" as keyof User,
      header: t.columns.name,
      width: "160px",
      render: (value: string) => value || "-",
    },
    {
      key: "email" as keyof User,
      header: t.columns.email,
      render: (value: string) => value,
    },
    {
      key: "emailVerified" as keyof User,
      header: t.columns.status,
      width: "100px",
      render: (value: boolean) => (
        <Badge variant={value ? "default" : "destructive"}>
          {value ? t.commonValues.verified : t.commonValues.unverified}
        </Badge>
      ),
    },
    {
      key: "actions" as keyof User,
      header: t.columns.actions,
      width: "120px",
    },
  ];

  const renderActions = (_user: User) => (
    <ActionButtons>
      <Button size="sm" variant="ghost" title={t.actions.editUser}>
        <Edit className="h-3 w-3" />
      </Button>
      <Button size="sm" variant="ghost" title={t.actions.deleteUser}>
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
        title={t.emptyStates.team.title}
        description={t.emptyStates.team.description}
        action={
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            {t.actions.createNewUser}
          </Button>
        }
      />
    );
  }

  return <DataTable data={users} columns={columns} actions={renderActions} />;
}
