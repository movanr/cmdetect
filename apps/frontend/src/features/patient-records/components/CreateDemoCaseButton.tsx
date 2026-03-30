import { useState } from "react";
import { useCreatePatientRecord } from "@/features/patient-records";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FlaskConical, Copy, CheckCircle2, Loader2, ExternalLink } from "lucide-react";
import { getTranslations } from "@/config/i18n";
import { toast } from "sonner";

function buildInviteUrl(token: string) {
  return `${window.location.protocol}//${window.location.hostname.replace(/^app\./, "patient.")}?token=${token}`;
}

function generateDemoId() {
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `DEMO-${suffix}`;
}

export function CreateDemoCaseButton() {
  const t = getTranslations();
  const createMutation = useCreatePatientRecord();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = () => {
    setCopied(false);
    setInviteUrl(null);

    createMutation.mutate(
      { clinicInternalId: generateDemoId(), isDemo: true },
      {
        onSuccess: (data) => {
          const token = data?.insert_patient_record_one?.invite_token;
          if (token) {
            setInviteUrl(buildInviteUrl(token));
            setDialogOpen(true);
          }
        },
        onError: (err) => {
          toast.error(
            t.demoCase.error,
            { description: err instanceof Error ? err.message : undefined }
          );
        },
      }
    );
  };

  const handleCopy = () => {
    if (inviteUrl) {
      navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      toast.success(t.messages.copiedToClipboard);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenLink = () => {
    if (inviteUrl) {
      window.open(inviteUrl, "_blank");
    }
  };

  return (
    <>
      <Button variant="outline" onClick={handleCreate} disabled={createMutation.isPending}>
        {createMutation.isPending ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <FlaskConical className="h-4 w-4 mr-2" />
        )}
        {t.demoCase.createButton}
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              {t.demoCase.successMessage}
            </DialogTitle>
            <DialogDescription>{t.demoCase.linkDescription}</DialogDescription>
          </DialogHeader>

          {inviteUrl && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={inviteUrl}
                  className="w-full px-3 py-2 border rounded-md bg-muted font-mono text-sm"
                  onFocus={(e) => e.target.select()}
                />
                <Button variant="outline" size="icon" onClick={handleCopy} title={t.createInvite.copy}>
                  {copied ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <Button variant="outline" className="w-full" onClick={handleOpenLink}>
                <ExternalLink className="h-4 w-4 mr-2" />
                {t.demoCase.openLink}
              </Button>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t.demoCase.close}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
