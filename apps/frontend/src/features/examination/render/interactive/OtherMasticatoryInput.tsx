/**
 * OtherMasticatoryInput - Input for "other masticatory muscles" region.
 *
 * This region is not shown on the SVG diagram but still needs pain assessment.
 * Provides simple yes/no inputs for left and right sides.
 */

import { useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { Movement } from "../../model/movement";
import { PAIN_TYPES } from "../../model/pain";
import { REGIONS } from "../../model/region";
import { SIDES, type Side } from "../../model/side";
import { buildInstanceId } from "../../model/questionInstance";
import { ANSWER_VALUES } from "../../model/answer";

const QUESTIONNAIRE_ID = "examination";

interface OtherMasticatoryInputProps {
  /** Movement context */
  movement: Movement;
  /** Whether inputs are disabled */
  disabled?: boolean;
  /** Optional className */
  className?: string;
}

/**
 * Single side input for "other masticatory" pain.
 */
function SideInput({
  side,
  movement,
  disabled,
}: {
  side: Side;
  movement: Movement;
  disabled?: boolean;
}) {
  const { watch, setValue } = useFormContext();

  const instanceId = buildInstanceId(QUESTIONNAIRE_ID, PAIN_TYPES.PAIN, {
    movement,
    side,
    region: REGIONS.OTHER_MAST,
  });

  const value = watch(instanceId);

  const handleChange = (newValue: string) => {
    setValue(instanceId, newValue);
  };

  const sideLabel = side === SIDES.RIGHT ? "Rechts" : "Links";

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm font-medium min-w-[50px]">{sideLabel}:</span>
      <RadioGroup
        value={value ?? ""}
        onValueChange={handleChange}
        disabled={disabled}
        className="flex gap-4"
      >
        <div className="flex items-center gap-1.5">
          <RadioGroupItem
            value={ANSWER_VALUES.NO}
            id={`${instanceId}-no`}
          />
          <Label
            htmlFor={`${instanceId}-no`}
            className="text-sm font-normal cursor-pointer"
          >
            Nein
          </Label>
        </div>
        <div className="flex items-center gap-1.5">
          <RadioGroupItem
            value={ANSWER_VALUES.YES}
            id={`${instanceId}-yes`}
          />
          <Label
            htmlFor={`${instanceId}-yes`}
            className="text-sm font-normal cursor-pointer"
          >
            Ja
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
}

export function OtherMasticatoryInput({
  movement,
  disabled = false,
  className,
}: OtherMasticatoryInputProps) {
  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">
          Andere Kaumuskeln
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-6">
          <SideInput side={SIDES.RIGHT} movement={movement} disabled={disabled} />
          <SideInput side={SIDES.LEFT} movement={movement} disabled={disabled} />
        </div>
      </CardContent>
    </Card>
  );
}
