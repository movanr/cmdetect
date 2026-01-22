import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useExaminationForm } from "../../form/use-examination-form";
import { ALL_REGIONS, BASE_REGIONS } from "../../model/regions";
import { TableInterviewStep } from "../ui";
import { getLabel } from "../../labels";
import { QuestionField } from "../QuestionField";

interface E4SectionProps {
  onComplete?: () => void;
}

export function E4Section({ onComplete: _onComplete }: E4SectionProps) {
  const { getInstancesForStep } = useExaminationForm();
  const [includeAllRegions, setIncludeAllRegions] = useState(false);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>U4 - Öffnungs- und Schließbewegungen</CardTitle>
          <div className="flex items-center gap-2">
            <Checkbox
              id="alle-regionen-header"
              checked={includeAllRegions}
              onCheckedChange={(checked) => setIncludeAllRegions(checked === true)}
            />
            <Label
              htmlFor="alle-regionen-header"
              className="text-xs text-muted-foreground cursor-pointer"
            >
              Alle Regionen
            </Label>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* E4A: Schmerzfreie Mundöffnung */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline">U4A</Badge>
            <h4 className="font-medium">Schmerzfreie Mundöffnung</h4>
          </div>
          {getInstancesForStep("e4a").map((instance) => (
            <QuestionField
              key={instance.path}
              instance={instance}
              label={getLabel(instance.labelKey)}
            />
          ))}
        </div>

        {/* E4B: Maximale aktive Mundöffnung */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline">U4B</Badge>
            <h4 className="font-medium">Maximale aktive Mundöffnung</h4>
          </div>
          {getInstancesForStep("e4b-measure").map((instance) => (
            <QuestionField
              key={instance.path}
              instance={instance}
              label={getLabel(instance.labelKey)}
            />
          ))}
          <TableInterviewStep
            instances={getInstancesForStep("e4b-interview")}
            regions={includeAllRegions ? ALL_REGIONS : BASE_REGIONS}
          />
        </div>

        {/* E4C: Maximale passive Mundöffnung */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline">U4C</Badge>
            <h4 className="font-medium">Maximale passive Mundöffnung</h4>
          </div>
          {getInstancesForStep("e4c-measure").map((instance) => (
            <QuestionField
              key={instance.path}
              instance={instance}
              label={getLabel(instance.labelKey)}
            />
          ))}
          <TableInterviewStep
            instances={getInstancesForStep("e4c-interview")}
            regions={includeAllRegions ? ALL_REGIONS : BASE_REGIONS}
          />
        </div>
      </CardContent>
    </Card>
  );
}
