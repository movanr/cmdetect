/**
 * Pain Drawing Score Card — paper-split layout (70/30) matching Axis 2 tabs.
 * Left sheet shows the patient's drawings; right sheet shows manual scoring inputs.
 */

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Axis2DetailPanel } from "@/features/questionnaire-viewer/components/dashboard/Axis2DetailPanel";
import {
  CutoffTable,
  StackedField,
} from "@/features/questionnaire-viewer/components/dashboard/Axis2ScoreCard";
import { ClinicalNote } from "@/features/questionnaire-viewer/components/dashboard/ClinicalNote";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { IMAGE_CONFIGS, REGION_ORDER } from "../constants";
import type { ImageId, PainDrawingData } from "../types";
import { ReadOnlyCanvas } from "./ReadOnlyCanvas";
import { RegionThumbnail } from "./RegionThumbnail";

const NONE = "__none__";

const PAIN_DRAWING_SEVERITY_OPTIONS = [
  { value: "keine", label: "Keine" },
  { value: "leicht", label: "Leicht" },
  { value: "moderat", label: "Moderat" },
  { value: "schwer", label: "Schwer" },
] as const;

const PAIN_DRAWING_CUTOFFS: ReadonlyArray<readonly [string, string]> = [
  ["0", "Keine"],
  ["1", "Leicht"],
  ["2", "Moderat"],
  ["3", "—"],
  ["≥ 4", "Schwer"],
];

interface PainDrawingScoreCardProps {
  data: PainDrawingData | null;
  title?: string;
}

export function PainDrawingScoreCard({
  data,
  title = "Schmerzzeichnung",
}: PainDrawingScoreCardProps) {
  const [selectedRegion, setSelectedRegion] = useState<ImageId | null>(null);
  const [regionCount, setRegionCount] = useState("");
  const [severity, setSeverity] = useState("");
  const [note, setNote] = useState("");

  const hasData = data && data.drawings && Object.keys(data.drawings).length > 0;

  if (!hasData) {
    return (
      <Card className="bg-muted/30">
        <div className="p-4">
          <div className="flex items-start justify-between gap-4">
            <h4 className="font-medium text-sm text-muted-foreground">{title}</h4>
            <p className="text-sm text-muted-foreground">Keine Daten</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Axis2DetailPanel
        manualAnchor="pain-drawing"
        leftTitle={title}
        rightTitle="Bewertung"
        attachedTop={false}
        left={
          <div className="grid grid-cols-3 gap-2">
            {REGION_ORDER.map((regionId) => (
              <RegionThumbnail
                key={regionId}
                imageId={regionId}
                elements={data.drawings[regionId]?.elements ?? []}
                onClick={() => setSelectedRegion(regionId)}
              />
            ))}
          </div>
        }
        right={
          <div className="flex flex-col gap-5">
            <StackedField
              label="Anzahl Regionen"
              hint="≥ 0"
              formula={<>= Anzahl Regionen mit ≥ 1 Markierung</>}
            >
              <Input
                type="number"
                inputMode="numeric"
                value={regionCount}
                onChange={(e) => setRegionCount(e.target.value)}
                min={0}
                step={1}
                className="h-8 text-sm w-24"
              />
            </StackedField>

            <StackedField label="Schweregrad">
              <Select
                value={severity || NONE}
                onValueChange={(v) => setSeverity(v === NONE ? "" : v)}
              >
                <SelectTrigger size="sm" className="w-full max-w-[220px]">
                  <SelectValue placeholder="—" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>—</SelectItem>
                  {PAIN_DRAWING_SEVERITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </StackedField>

            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                Cutoffs (Appendix 3)
              </span>
              <CutoffTable label="Schweregrad" rows={PAIN_DRAWING_CUTOFFS} />
              <p className="text-[11px] text-muted-foreground italic">
                Keine validierten Normwerte — deskriptive Einteilung aus dem DC/TMD Scoring Manual
                (Appendix 3).
              </p>
            </div>

            <ClinicalNote value={note} onChange={setNote} />
          </div>
        }
      />

      <Dialog open={!!selectedRegion} onOpenChange={(open) => !open && setSelectedRegion(null)}>
        <DialogContent className="max-w-md sm:max-w-lg md:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between pr-8">
              <span>{selectedRegion ? IMAGE_CONFIGS[selectedRegion].label : ""}</span>
              <span className="text-sm font-normal text-muted-foreground">
                {selectedRegion ? REGION_ORDER.indexOf(selectedRegion) + 1 : 0} /{" "}
                {REGION_ORDER.length}
              </span>
            </DialogTitle>
          </DialogHeader>
          {selectedRegion && (
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 w-full">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const currentIndex = REGION_ORDER.indexOf(selectedRegion);
                    const prevIndex =
                      (currentIndex - 1 + REGION_ORDER.length) % REGION_ORDER.length;
                    setSelectedRegion(REGION_ORDER[prevIndex]);
                  }}
                  className="shrink-0"
                >
                  <ChevronLeft className="size-5" />
                </Button>

                <div className="flex-1 flex justify-center">
                  <ReadOnlyCanvas
                    imageConfig={IMAGE_CONFIGS[selectedRegion]}
                    elements={data.drawings[selectedRegion]?.elements ?? []}
                    maxWidth={400}
                  />
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const currentIndex = REGION_ORDER.indexOf(selectedRegion);
                    const nextIndex = (currentIndex + 1) % REGION_ORDER.length;
                    setSelectedRegion(REGION_ORDER[nextIndex]);
                  }}
                  className="shrink-0"
                >
                  <ChevronRight className="size-5" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
