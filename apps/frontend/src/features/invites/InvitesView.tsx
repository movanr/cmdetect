import { Link } from "@tanstack/react-router";
import {
  DataTable,
  StatusBadge,
  ActionButtons,
} from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePatientRecords, getPatientRecordStatus } from "@/lib/patient-records";
import { formatDistanceToNow } from "@/lib/date-utils";
import { MoreVertical, Trash, Plus, Copy, ExternalLink } from "lucide-react";
import type { GetAllPatientRecordsQuery } from "@/graphql/graphql";
import { getTranslations } from "@/config/i18n";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { execute } from "@/graphql/execute";
import { DELETE_PATIENT_RECORD } from "./queries";

type PatientRecord = GetAllPatientRecordsQuery["patient_record"][number];

export function InvitesView() {
  const { data: patientRecords, isLoading } = usePatientRecords();
  const t = getTranslations();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return execute(DELETE_PATIENT_RECORD, { id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient-records"] });
      toast.success(t.messages.deletedSuccessfully);
    },
    onError: (error) => {
      toast.error("Failed to delete invite: " + error.message);
    },
  });

  const columns = [
    {
      key: "created_at" as keyof PatientRecord,
      header: t.columns.created,
      width: "12%",
      render: (value: string) =>
        formatDistanceToNow(new Date(value), { addSuffix: true }),
    },
    {
      key: "created_by" as keyof PatientRecord,
      header: t.columns.createdBy,
      width: "12%",
      render: (_value: string, record: PatientRecord) => {
        const userName = record.userByCreatedBy?.name || t.commonValues.system;
        return (
          <span className="truncate block" title={userName}>
            {userName}
          </span>
        );
      },
    },
    {
      key: "clinic_internal_id" as keyof PatientRecord,
      header: t.columns.internalId,
      width: "12%",
      render: (value: string) => (
        <span className="truncate block" title={value || undefined}>
          {value || "-"}
        </span>
      ),
    },
    {
      key: "invite_token" as keyof PatientRecord,
      header: t.columns.inviteUrl,
      width: "15%",
      render: (token: string) => {
        const url = token
          ? `${window.location.origin}/patient?token=${token}`
          : "";

        return (
          <div className="flex items-center space-x-2">
            <Badge
              variant="outline"
              className="font-mono text-xs cursor-pointer"
              title={url}
              onClick={() => {
                navigator.clipboard.writeText(url);
                toast.success(t.messages.copiedToClipboard);
              }}
            >
              {"..." + token?.slice(-8) || "N/A"}
            </Badge>
            {token && (
              <Button
                size="sm"
                variant="ghost"
                title={url}
                onClick={() => {
                  navigator.clipboard.writeText(url);
                  toast.success(t.messages.copiedToClipboard);
                }}
              >
                <Copy className="h-3 w-3" />
              </Button>
            )}
          </div>
        );
      },
    },
    {
      key: "invite_expires_at" as keyof PatientRecord,
      header: t.columns.expires,
      width: "12%",
      render: (value: string) =>
        value
          ? formatDistanceToNow(new Date(value), { addSuffix: true })
          : t.commonValues.never,
    },
    {
      key: "id" as keyof PatientRecord,
      header: t.columns.status,
      width: "12%",
      render: (_: any, record: PatientRecord) => (
        <StatusBadge status={getPatientRecordStatus(record)} />
      ),
    },
    {
      key: "actions" as keyof PatientRecord,
      header: t.columns.actions,
      width: "10%",
    },
  ];

  const renderActions = (record: PatientRecord) => {
    const status = getPatientRecordStatus(record);
    const isSubmitted = status === "submitted" || status === "viewed";

    return (
      <ActionButtons>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="ghost" title="Actions">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              variant="destructive"
              onClick={() => deleteMutation.mutate(record.id)}
              disabled={deleteMutation.isPending || isSubmitted}
            >
              <Trash className="h-4 w-4" />
              {deleteMutation.isPending ? t.loadingStates.deleting : t.actions.deleteInvite}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </ActionButtons>
    );
  };

  if (isLoading) {
    return <DataTable data={[]} columns={columns} loading={true} />;
  }

  if (!patientRecords || patientRecords.length === 0) {
    return (
      <EmptyState
        icon={ExternalLink}
        title={t.emptyStates.invites.title}
        description={t.emptyStates.invites.description}
        action={
          <Button asChild>
            <Link to="/invites/new">
              <Plus className="h-4 w-4 mr-2" />
              {t.actions.createNewInvite}
            </Link>
          </Button>
        }
      />
    );
  }

  return <DataTable data={patientRecords} columns={columns} actions={renderActions} />;
}
