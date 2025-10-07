import { useState, useEffect } from "react";
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
import { decryptPatientData, loadPrivateKey } from "@/crypto";
import type { PatientPII } from "@/crypto/types";

type PatientRecord = GetAllPatientRecordsQuery["patient_record"][number];

interface DecryptedPatientData {
  [recordId: string]: PatientPII | null;
}

export function CasesView() {
  const { data: submissions, isLoading } = useSubmissions();
  const t = getTranslations();
  const [decryptedData, setDecryptedData] = useState<DecryptedPatientData>({});
  const [isDecrypting, setIsDecrypting] = useState(false);

  // Decrypt patient data when submissions load
  useEffect(() => {
    async function decryptSubmissions() {
      if (!submissions || submissions.length === 0) return;

      setIsDecrypting(true);
      try {
        const privateKeyPem = await loadPrivateKey();
        if (!privateKeyPem) {
          console.warn("No private key found, cannot decrypt patient data");
          setIsDecrypting(false);
          return;
        }

        const decrypted: DecryptedPatientData = {};

        for (const record of submissions) {
          try {
            // Only decrypt if we have encrypted data
            if (record.first_name_encrypted) {
              const patientData = await decryptPatientData(
                record.first_name_encrypted,
                privateKeyPem
              );
              decrypted[record.id] = patientData;
            }
          } catch (error) {
            console.error(`Failed to decrypt patient ${record.id}:`, error);
            decrypted[record.id] = null;
          }
        }

        setDecryptedData(decrypted);
      } catch (error) {
        console.error("Failed to decrypt patient data:", error);
      } finally {
        setIsDecrypting(false);
      }
    }

    decryptSubmissions();
  }, [submissions]);

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
      width: "200px",
      render: (_: any, record: PatientRecord) => {
        const patientData = decryptedData[record.id];

        if (isDecrypting) {
          return (
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                Decrypting...
              </Badge>
            </div>
          );
        }

        if (patientData) {
          return (
            <div className="flex flex-col">
              <span className="font-medium">
                {patientData.firstName} {patientData.lastName}
              </span>
              <span className="text-muted-foreground text-xs">
                {record.clinic_internal_id || t.dashboard.noId}
              </span>
            </div>
          );
        }

        return (
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {t.dashboard.encrypted}
            </Badge>
            <span className="text-muted-foreground text-sm">
              {record.clinic_internal_id || t.dashboard.noId}
            </span>
          </div>
        );
      },
    },
    {
      key: "date_of_birth_encrypted" as keyof PatientRecord,
      header: t.dashboard.columns.dob,
      width: "120px",
      render: (_: any, record: PatientRecord) => {
        const patientData = decryptedData[record.id];

        if (isDecrypting) {
          return (
            <Badge variant="outline" className="text-xs">
              ...
            </Badge>
          );
        }

        if (patientData?.dateOfBirth) {
          return (
            <span className="text-sm">
              {new Date(patientData.dateOfBirth).toLocaleDateString()}
            </span>
          );
        }

        return (
          <Badge variant="outline" className="text-xs">
            {t.dashboard.encrypted}
          </Badge>
        );
      },
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
