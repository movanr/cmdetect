import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useCreatePatientRecord } from "@/features/patient-records";
import { Button } from "@/components/ui/button";
import { getTranslations } from "@/config/i18n";
import { Copy, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

function buildInviteUrl(token: string) {
  return `${window.location.protocol}//${window.location.hostname.replace(/^app\./, "patient.")}?token=${token}`;
}

export function CreateInviteForm() {
  const navigate = useNavigate();
  const t = getTranslations();
  const [clinicInternalId, setClinicInternalId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);

  const createMutation = useCreatePatientRecord();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!clinicInternalId.trim()) {
      setError(t.createInvite.patientInternalIdRequired);
      return;
    }

    createMutation.mutate(clinicInternalId.trim(), {
      onSuccess: (data) => {
        const token = data?.insert_patient_record_one?.invite_token;
        if (token) {
          setInviteUrl(buildInviteUrl(token));
        } else {
          navigate({ to: "/invites" });
        }
      },
      onError: (err) => {
        setError(err instanceof Error ? err.message : t.createInvite.failedToCreate);
      },
    });
  };

  const handleCopy = () => {
    if (inviteUrl) {
      navigator.clipboard.writeText(inviteUrl);
      toast.success(t.messages.copiedToClipboard);
    }
  };

  const handleCancel = () => {
    navigate({ to: "/invites" });
  };

  if (inviteUrl) {
    return (
      <div className="max-w-2xl space-y-6">
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded">
          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
          <p className="text-green-800 text-sm font-medium">
            {t.createInvite.successMessage}
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">
            {t.columns.inviteUrl}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={inviteUrl}
              className="w-full px-3 py-2 border rounded-md bg-muted font-mono text-sm"
              onFocus={(e) => e.target.select()}
            />
            <Button type="button" variant="outline" onClick={handleCopy}>
              <Copy className="h-4 w-4 mr-2" />
              {t.createInvite.copy}
            </Button>
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={() => navigate({ to: "/invites" })}>
            {t.createInvite.backToInvites}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setInviteUrl(null);
              setClinicInternalId("");
              createMutation.reset();
            }}
          >
            {t.createInvite.createAnother}
          </Button>
        </div>
      </div>
    );
  }

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
            {t.createInvite.patientInternalId} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="clinicInternalId"
            value={clinicInternalId}
            onChange={(e) => setClinicInternalId(e.target.value)}
            placeholder={t.createInvite.patientInternalIdPlaceholder}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoComplete="off"
            required
            disabled={createMutation.isPending}
          />
          <p className="text-sm text-muted-foreground">
            {t.createInvite.patientInternalIdHint}
          </p>
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? t.createInvite.creating : t.createInvite.createButton}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={createMutation.isPending}
          >
            {t.createInvite.cancel}
          </Button>
        </div>
      </form>
    </div>
  );
}
