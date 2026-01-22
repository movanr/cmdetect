import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useExaminationForm } from "../../form/use-examination-form";
import { SECTION_LABELS } from "../../labels";
import { SIDES } from "../../model/regions";
import { TablePalpationStep } from "../ui";

export function E9Section() {
  const { getInstancesForStep } = useExaminationForm();

  const rightInstances = getInstancesForStep("e9-right");
  const leftInstances = getInstancesForStep("e9-left");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{SECTION_LABELS.e9.cardTitle}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Right side */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground border-b pb-1">
            {SIDES.right}
          </h3>
          <TablePalpationStep key="right" instances={rightInstances} />
        </div>

        {/* Left side */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground border-b pb-1">
            {SIDES.left}
          </h3>
          <TablePalpationStep key="left" instances={leftInstances} />
        </div>
      </CardContent>
    </Card>
  );
}
