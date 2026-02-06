import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lock } from "lucide-react";
import { E1Summary } from "./E1Summary";
import { E2Summary } from "./E2Summary";
import { E3Summary } from "./E3Summary";
import { E4Summary } from "./E4Summary";
import { E5Summary } from "./E5Summary";
import { E9Summary } from "./E9Summary";

export function ExaminationSummary() {
  return (
    <div className="space-y-6">
      <Alert>
        <Lock className="h-4 w-4" />
        <AlertTitle>Untersuchung abgeschlossen</AlertTitle>
        <AlertDescription>
          Die Untersuchungsdaten sind schreibgeschützt und können nicht mehr bearbeitet werden.
        </AlertDescription>
      </Alert>

      <E1Summary />
      <E2Summary />
      <E3Summary />
      <E4Summary />
      <E5Summary />
      <E9Summary />
    </div>
  );
}
