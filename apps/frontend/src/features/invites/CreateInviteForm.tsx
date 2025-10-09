import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { execute } from "@/graphql/execute";
import { CREATE_PATIENT_RECORD } from "./queries";
import { Button } from "@/components/ui/button";
import { getTranslations } from "@/config/i18n";

export function CreateInviteForm() {
  const t = getTranslations();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [clinicInternalId, setClinicInternalId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: async (data: { clinic_internal_id: string }) => {
      return execute(CREATE_PATIENT_RECORD, data);
    },
    onSuccess: () => {
      // Invalidate patient records cache to refetch data
      queryClient.invalidateQueries({ queryKey: ["patient-records"] });
      // Navigate back to invites list
      navigate({ to: "/invites" });
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Failed to create invite");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!clinicInternalId.trim()) {
      setError("Patient internal ID is required");
      return;
    }

    await createMutation.mutateAsync({
      clinic_internal_id: clinicInternalId.trim(),
    });
  };

  const handleCancel = () => {
    navigate({ to: "/invites" });
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
