import { useState, useEffect, useMemo } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { useSubmissions, getPatientRecordStatus } from "@/lib/patient-records";
import { formatDistanceToNow } from "date-fns";
import { FileText, Search } from "lucide-react";
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
  const [searchQuery, setSearchQuery] = useState("");

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
        const status = getPatientRecordStatus(record);
        return status === "submitted" ? (
          <div className="flex items-center justify-center">
            <div
              className="w-2 h-2 bg-blue-500 rounded-full"
              title="New submission"
            />
          </div>
        ) : null;
      },
    },
    {
      key: "first_name_encrypted" as keyof PatientRecord,
      header: t.dashboard.columns.patientName,
      width: "24%",
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
          const dob = patientData.dateOfBirth
            ? new Date(patientData.dateOfBirth).toLocaleDateString()
            : null;

          return (
            <div className="flex flex-col min-w-0">
              <span
                className="font-medium truncate block"
                title={`${patientData.firstName} ${patientData.lastName}`}
              >
                {patientData.firstName} {patientData.lastName}
              </span>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {dob && <span>{dob}</span>}
                {dob && record.clinic_internal_id && <span>•</span>}
                {record.clinic_internal_id && (
                  <span
                    className="truncate block"
                    title={record.clinic_internal_id}
                  >
                    {record.clinic_internal_id}
                  </span>
                )}
              </div>
            </div>
          );
        }

        return (
          <div className="flex items-center space-x-2 min-w-0">
            <Badge variant="outline" className="text-xs flex-shrink-0">
              {t.dashboard.encrypted}
            </Badge>
            <span
              className="text-muted-foreground text-sm truncate block"
              title={record.clinic_internal_id || t.dashboard.noId}
            >
              {record.clinic_internal_id || t.dashboard.noId}
            </span>
          </div>
        );
      },
    },
    {
      key: "patient_data_completed_at" as keyof PatientRecord,
      header: t.dashboard.columns.submitted,
      width: "24%",
      render: (value: string) =>
        value ? formatDistanceToNow(new Date(value), { addSuffix: true }) : "-",
    },
    {
      key: "last_viewed_at" as keyof PatientRecord,
      header: "Zuletzt geöffnet",
      width: "25%",
      render: (_: any, record: PatientRecord) => {
        if (!record.last_viewed_at) {
          return <span className="text-muted-foreground">-</span>;
        }

        const timeAgo = formatDistanceToNow(new Date(record.last_viewed_at), {
          addSuffix: true,
        });
        const userName =
          record.userByLastViewedBy?.name ||
          record.userByLastViewedBy?.email ||
          "Unknown";

        return (
          <div className="flex flex-col min-w-0">
            <span
              className="text-sm truncate block"
              title={`${timeAgo} von ${userName}`}
            >
              {timeAgo}
            </span>
            <span
              className="text-xs text-muted-foreground truncate block"
              title={userName}
            >
              von {userName}
            </span>
          </div>
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
        title={t.dashboard.emptyStates.submissions.title}
        description={t.dashboard.emptyStates.submissions.description}
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
            placeholder="Search by internal ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        {searchQuery && (
          <Button variant="ghost" size="sm" onClick={() => setSearchQuery("")}>
            Clear
          </Button>
        )}
      </div>

      {/* Table */}
      {filteredSubmissions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No cases found matching "{searchQuery}"
        </div>
      ) : (
        <DataTable
          data={filteredSubmissions}
          columns={columns}
        />
      )}
    </div>
  );
}
