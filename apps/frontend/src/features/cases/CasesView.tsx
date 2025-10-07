import {
  DataTable,
  StatusBadge,
  ActionButtons,
} from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useSubmissions, getPatientRecordStatus } from "@/lib/patient-records";
import { formatDistanceToNow } from "date-fns";
import { Eye, FileText, Edit } from "lucide-react";
import type { GetAllPatientRecordsQuery } from "@/graphql/graphql";
import { getTranslations } from "@/config/i18n";

type PatientRecord = GetAllPatientRecordsQuery["patient_record"][number];

export function CasesView() {
  const { data: submissions, isLoading } = useSubmissions();
  const t = getTranslations();

  const columns = [
    {
      key: "patient_data_completed_at" as keyof PatientRecord,
      header: t.dashboard.columns.submitted,
      width: "120px",
      render: (value: string) =>
        value ? formatDistanceToNow(new Date(value), { addSuffix: true }) : "-",
    },
    {
      key: "first_name_encrypted" as keyof PatientRecord,
      header: t.dashboard.columns.patientName,
      width: "160px",
      render: (_: any, record: PatientRecord) => (
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">
            {t.dashboard.encrypted}
          </Badge>
          <span className="text-muted-foreground text-sm">
            {record.clinic_internal_id || t.dashboard.noId}
          </span>
        </div>
      ),
    },
    {
      key: "date_of_birth_encrypted" as keyof PatientRecord,
      header: t.dashboard.columns.dob,
      width: "100px",
      render: () => (
        <Badge variant="outline" className="text-xs">
          {t.dashboard.encrypted}
        </Badge>
      ),
    },
    {
      key: "notes" as keyof PatientRecord,
      header: t.dashboard.columns.notes,
      render: (value: string) => value || "-",
    },
    {
      key: "first_viewed_at" as keyof PatientRecord,
      header: t.dashboard.columns.firstViewed,
      width: "120px",
      render: (value: string) =>
        value
          ? formatDistanceToNow(new Date(value), { addSuffix: true })
          : t.dashboard.notViewed,
    },
    {
      key: "id" as keyof PatientRecord,
      header: t.dashboard.columns.status,
      width: "100px",
      render: (_: any, record: PatientRecord) => (
        <StatusBadge status={getPatientRecordStatus(record)} />
      ),
    },
    {
      key: "actions" as keyof PatientRecord,
      header: t.dashboard.columns.actions,
      width: "120px",
    },
  ];

  const renderActions = (_record: PatientRecord) => (
    <ActionButtons>
      <Button
        size="sm"
        variant="ghost"
        title={t.dashboard.actions.openPatientRecord}
      >
        <Eye className="h-3 w-3" />
      </Button>
      <Button size="sm" variant="ghost" title={t.dashboard.actions.editNotes}>
        <Edit className="h-3 w-3" />
      </Button>
    </ActionButtons>
  );

  if (isLoading) {
    return <DataTable data={[]} columns={columns} loading={true} />;
  }

  if (!submissions || submissions.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title={t.dashboard.emptyStates.submissions.title}
        description={t.dashboard.emptyStates.submissions.description}
      />
    );
  }

  return (
    <DataTable data={submissions} columns={columns} actions={renderActions} />
  );
}
