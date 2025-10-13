import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import {
  useSubmissions,
  getCaseStatus,
  type PatientRecord,
} from "@/features/patient-records";
import { formatDistanceToNow, formatDate } from "@/lib/date-utils";
import { FileText, Search } from "lucide-react";
import { getTranslations, interpolate } from "@/config/i18n";
import { decryptPatientData, loadPrivateKey } from "@/crypto";
import type { PatientPII } from "@/crypto/types";

interface DecryptedPatientData {
  [recordId: string]: PatientPII | null;
}

export function CasesView() {
  const { data: submissions, isLoading } = useSubmissions();
  const t = getTranslations();
  const navigate = useNavigate();
  const [decryptedData, setDecryptedData] = useState<DecryptedPatientData>({});
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleRowClick = (record: PatientRecord) => {
    navigate({ to: "/cases/$id", params: { id: record.id } });
  };

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
      key: "id" as keyof PatientRecord,
      header: "",
      width: "3%",
      render: (_: any, record: PatientRecord) => {
        const status = getCaseStatus(record);
        return status === "submitted" ? (
          <div className="flex items-center justify-center">
            <div
              className="w-2 h-2 bg-blue-500 rounded-full"
              title={t.indicators.newSubmission}
            />
          </div>
        ) : null;
      },
    },
    {
      key: "first_name_encrypted" as keyof PatientRecord,
      header: t.columns.patientName,
      width: "15%",
      render: (_: any, record: PatientRecord) => {
        const patientData = decryptedData[record.id];

        if (isDecrypting) {
          return (
            <Badge variant="outline" className="text-xs">
              {t.loadingStates.decrypting}
            </Badge>
          );
        }

        if (patientData) {
          return (
            <span
              className="font-medium truncate block"
              title={`${patientData.firstName} ${patientData.lastName}`}
            >
              {patientData.firstName} {patientData.lastName}
            </span>
          );
        }

        return (
          <Badge variant="outline" className="text-xs">
            {t.commonValues.encrypted}
          </Badge>
        );
      },
    },
    {
      key: "date_of_birth_encrypted" as keyof PatientRecord,
      header: t.columns.dob,
      width: "15%",
      render: (_: any, record: PatientRecord) => {
        const patientData = decryptedData[record.id];

        if (isDecrypting || !patientData?.dateOfBirth) {
          return <span className="text-muted-foreground">-</span>;
        }

        const dob = formatDate(new Date(patientData.dateOfBirth));
        return <span title={dob}>{dob}</span>;
      },
    },
    {
      key: "clinic_internal_id" as keyof PatientRecord,
      header: t.columns.internalId,
      width: "15%",
      render: (value: string) => (
        <span className="truncate block" title={value || undefined}>
          {value || "-"}
        </span>
      ),
    },
    {
      key: "patient_data_completed_at" as keyof PatientRecord,
      header: t.columns.submitted,
      width: "15%",
      render: (value: string) =>
        value ? formatDistanceToNow(new Date(value), { addSuffix: true }) : "-",
    },
    {
      key: "last_viewed_at" as keyof PatientRecord,
      header: t.columns.lastViewed,
      width: "15%",
      render: (value: string) =>
        value ? formatDistanceToNow(new Date(value), { addSuffix: true }) : "-",
    },
    {
      key: "last_viewed_by" as keyof PatientRecord,
      header: t.columns.lastViewedBy,
      width: "15%",
      render: (_: any, record: PatientRecord) => {
        if (!record.last_viewed_by) {
          return <span className="text-muted-foreground">-</span>;
        }

        const userName =
          record.userByLastViewedBy?.name ||
          record.userByLastViewedBy?.email ||
          t.common.unknown;

        return (
          <span className="truncate block" title={userName}>
            {userName}
          </span>
        );
      },
    },
  ];

  // Filter submissions by search query
  const filteredSubmissions = useMemo(() => {
    if (!submissions) return [];
    if (!searchQuery.trim()) return submissions;

    const query = searchQuery.toLowerCase().trim();
    return submissions.filter((record) => {
      return record.clinic_internal_id?.toLowerCase().includes(query);
    });
  }, [submissions, searchQuery]);

  if (isLoading) {
    return <DataTable data={[]} columns={columns} loading={true} />;
  }

  if (!submissions || submissions.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title={t.emptyStates.cases.title}
        description={t.emptyStates.cases.description}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Search field */}
      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t.search.searchByInternalId}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        {searchQuery && (
          <Button variant="ghost" size="sm" onClick={() => setSearchQuery("")}>
            {t.search.clear}
          </Button>
        )}
      </div>

      {/* Table */}
      {filteredSubmissions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {interpolate(t.search.noResultsFound, { query: searchQuery })}
        </div>
      ) : (
        <DataTable
          data={filteredSubmissions}
          columns={columns}
          onRowClick={handleRowClick}
        />
      )}
    </div>
  );
}
