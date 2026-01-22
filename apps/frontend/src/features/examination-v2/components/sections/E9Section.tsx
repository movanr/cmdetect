import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useExaminationForm } from "../../form/use-examination-form";
import { SECTION_LABELS } from "../../labels";
import { SIDES, type PalpationMode } from "../../model/regions";
import { TablePalpationStep } from "../ui";
import { PalpationModeToggle } from "../inputs/PalpationModeToggle";

export function E9Section() {
  const { getInstancesForStep } = useExaminationForm();
  const { watch, setValue } = useFormContext();

  const rightInstances = getInstancesForStep("e9-right");
  const leftInstances = getInstancesForStep("e9-left");
  const palpationMode = watch("e9.palpationMode") as PalpationMode;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>{SECTION_LABELS.e9.cardTitle}</CardTitle>
        <PalpationModeToggle
          value={palpationMode}
          onChange={(mode) => setValue("e9.palpationMode", mode)}
        />
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Right side */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground border-b pb-1">
            {SIDES.right}
          </h3>
          <TablePalpationStep key="right" instances={rightInstances} palpationMode={palpationMode} />
        </div>

        {/* Left side */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground border-b pb-1">
            {SIDES.left}
          </h3>
          <TablePalpationStep key="left" instances={leftInstances} palpationMode={palpationMode} />
        </div>
      </CardContent>
    </Card>
  );
}
