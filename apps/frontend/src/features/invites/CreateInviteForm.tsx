import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useCreatePatientRecord } from "@/features/patient-records";
import { Button } from "@/components/ui/button";
import { getTranslations } from "@/config/i18n";

export function CreateInviteForm() {
  const t = getTranslations();
  const navigate = useNavigate();
  const [clinicInternalId, setClinicInternalId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const createMutation = useCreatePatientRecord();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!clinicInternalId.trim()) {
      setError("Patient internal ID is required");
      return;
    }

    createMutation.mutate(clinicInternalId.trim(), {
      onSuccess: () => {
        navigate({ to: "/cases" });
      },
      onError: (err) => {
        setError(err instanceof Error ? err.message : "Failed to create invite");
      },
    });
  };

  const handleCancel = () => {
    navigate({ to: "/cases" });
  };

  return (
    <div className="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-2">
          <label
            htmlFor="clinicInternalId"
            className="block text-sm font-medium"
          >
            Patient Internal ID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="clinicInternalId"
            value={clinicInternalId}
            onChange={(e) => setClinicInternalId(e.target.value)}
            placeholder="e.g., PAT-2024-001"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoComplete="off"
            required
            disabled={createMutation.isPending}
          />
          <p className="text-sm text-muted-foreground">
            A unique identifier for this patient in your clinic system
          </p>
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Creating..." : "Create Invite"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={createMutation.isPending}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
