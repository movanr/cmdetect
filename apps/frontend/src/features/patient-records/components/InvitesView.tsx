import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { DataTable, ActionButtons } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchField } from "@/components/ui/search-field";
import { StatusFilterDropdown } from "@/components/ui/status-filter-dropdown";
import { EmptyState } from "@/components/ui/empty-state";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useInvites,
  getInviteStatus,
  useDeletePatientRecord,
  useResetInviteToken,
  StatusBadge,
  type PatientRecord,
  type InviteStatus,
} from "@/features/patient-records";
import { formatDistanceToNow } from "@/lib/date-utils";
import {
  MoreVertical,
  Trash,
  Plus,
  Copy,
  ExternalLink,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { getTranslations, interpolate } from "@/config/i18n";
import { toast } from "sonner";

const INVITE_STATUSES: readonly InviteStatus[] = [
  "pending",
  "submitted",
  "expired",
  "consent_denied",
] as const;

export function InvitesView() {
  const { data: patientRecords, isLoading } = useInvites();
  const t = getTranslations();
  const deleteMutation = useDeletePatientRecord();
  const resetMutation = useResetInviteToken();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<InviteStatus | "all">("all");

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success(t.messages.deletedSuccessfully);
      },
      onError: (error) => {
        toast.error("Failed to delete invite: " + error.message);
      },
    });
  };

  const handleReset = (id: string) => {
    resetMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Invite token reset successfully. New expiration: 7 days from now.");
      },
      onError: (error) => {
        toast.error("Failed to reset invite: " + error.message);
      },
    });
  };

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
        const userName =
          record.userByCreatedBy?.name ||
          record.userByCreatedBy?.email ||
          t.commonValues.system;
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
      render: (token: string, record: PatientRecord) => {
        const status = getInviteStatus(record);
        const isPending = status === "pending";
        const isSuccess = status === "submitted";
        const isFailure = status === "expired" || status === "consent_denied";
        const url = token
          ? `${window.location.protocol}//${window.location.hostname.replace(/^app\./, 'patient.')}?token=${token}`
          : "";

        return (
          <div className="flex items-center space-x-2">
            <Badge
              variant="outline"
              className={`font-mono text-xs ${
                isPending ? "cursor-pointer" : "opacity-50 cursor-not-allowed"
              }`}
              title={isPending ? url : undefined}
              onClick={() => {
                if (isPending) {
                  navigator.clipboard.writeText(url);
                  toast.success(t.messages.copiedToClipboard);
                }
              }}
            >
              {"..." + token?.slice(-8) || "N/A"}
            </Badge>
            {isSuccess && (
              <div title="Submitted successfully">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
            )}
            {isFailure && (
              <div title={status === "expired" ? "Expired" : "Consent denied"}>
                <XCircle className="h-4 w-4 text-red-600" />
              </div>
            )}
            {token && isPending && (
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
        <StatusBadge status={getInviteStatus(record)} />
      ),
    },
    {
      key: "actions" as keyof PatientRecord,
      header: t.columns.actions,
      width: "10%",
    },
  ];

  const renderActions = (record: PatientRecord) => {
    const status = getInviteStatus(record);
    const isSubmitted = status === "submitted";
    const isExpired = status === "expired";
    const canReset = isExpired || isSubmitted;

    return (
      <ActionButtons>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="ghost" title="Actions">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {canReset && (
              <DropdownMenuItem
                onClick={() => handleReset(record.id)}
                disabled={resetMutation.isPending}
              >
                <RefreshCw className="h-4 w-4" />
                {resetMutation.isPending ? "Resetting..." : "Reset Invite"}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              variant="destructive"
              onClick={() => handleDelete(record.id)}
              disabled={deleteMutation.isPending || isSubmitted}
            >
              <Trash className="h-4 w-4" />
              {deleteMutation.isPending
                ? t.loadingStates.deleting
                : t.actions.deleteInvite}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </ActionButtons>
    );
  };

  // Filter invites by search query and status
  const filteredInvites = useMemo(() => {
    if (!patientRecords) return [];

    let filtered = patientRecords;

    // Filter by status
    if (selectedStatus !== "all") {
      filtered = filtered.filter((record) => {
        const status = getInviteStatus(record);
        return status === selectedStatus;
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((record) => {
        return record.clinic_internal_id?.toLowerCase().includes(query);
      });
    }

    return filtered;
  }, [patientRecords, searchQuery, selectedStatus]);

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

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchField value={searchQuery} onChange={setSearchQuery} />
        <StatusFilterDropdown
          statuses={INVITE_STATUSES}
          selectedStatus={selectedStatus}
          onChange={setSelectedStatus}
        />
      </div>

      {/* Table */}
      {filteredInvites.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {searchQuery.trim()
            ? interpolate(t.search.noResultsFound, { query: searchQuery })
            : t.search.noResultsForFilter}
        </div>
      ) : (
        <DataTable
          data={filteredInvites}
          columns={columns}
          actions={renderActions}
        />
      )}
    </div>
  );
}
