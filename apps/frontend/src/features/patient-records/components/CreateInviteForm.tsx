import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useCreatePatientRecord } from "@/features/patient-records";
import { Button } from "@/components/ui/button";
import { getTranslations } from "@/config/i18n";
import { Copy, CheckCircle2, Mail } from "lucide-react";
import { toast } from "sonner";

const DEMO_PREFIX = "DEMO-";

function buildInviteUrl(token: string) {
  return `${window.location.protocol}//${window.location.hostname.replace(/^app\./, "patient.")}?token=${token}`;
}

export function CreateInviteForm() {
  const navigate = useNavigate();
  const t = getTranslations();
  const isDemo = true;
  const [clinicInternalId, setClinicInternalId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);

  const createMutation = useCreatePatientRecord();

  const fullClinicId = isDemo ? `${DEMO_PREFIX}${clinicInternalId.trim()}` : clinicInternalId.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!clinicInternalId.trim()) {
      setError(t.createInvite.patientInternalIdRequired);
      return;
    }

    createMutation.mutate({ clinicInternalId: fullClinicId, isDemo }, {
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

  const handleCopyEmail = () => {
    if (inviteUrl) {
      const emailText = t.createInvite.emailTemplate.replace("{url}", inviteUrl);
      navigator.clipboard.writeText(emailText);
      toast.success(t.messages.copiedToClipboard);
    }
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

        <div className="space-y-2">
          <label className="block text-sm font-medium">
            <Mail className="inline h-4 w-4 mr-1.5 -mt-0.5" />
            {t.createInvite.emailTemplateLabel}
          </label>
          <textarea
            readOnly
            value={t.createInvite.emailTemplate.replace("{url}", inviteUrl)}
            rows={12}
            className="w-full px-3 py-2 border rounded-md bg-muted text-sm resize-none"
            onFocus={(e) => e.target.select()}
          />
          <Button type="button" variant="outline" size="sm" onClick={handleCopyEmail}>
            <Copy className="h-4 w-4 mr-2" />
            {t.createInvite.copyEmailText}
          </Button>
        </div>

        <div className="flex gap-3">
          <Button asChild>
            <Link to="/invites">{t.createInvite.backToInvites}</Link>
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
          <div className="flex">
            {isDemo && (
              <span className="inline-flex items-center px-3 border border-r-0 rounded-l-md bg-muted text-muted-foreground text-sm font-mono">
                {DEMO_PREFIX}
              </span>
            )}
            <input
              type="text"
              id="clinicInternalId"
              value={clinicInternalId}
              onChange={(e) => setClinicInternalId(e.target.value)}
              placeholder={isDemo ? "001" : t.createInvite.patientInternalIdPlaceholder}
              className={`w-full px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDemo ? "rounded-r-md" : "rounded-md"
              }`}
              autoComplete="off"
              required
              disabled={createMutation.isPending}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            {t.createInvite.patientInternalIdHint}
          </p>
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? t.createInvite.creating : t.createInvite.createButton}
          </Button>
          <Button variant="outline" asChild>
            <Link to="/invites">{t.createInvite.cancel}</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
