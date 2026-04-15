/**
 * Pain Drawing Score Card — documentation only.
 * Practitioner enters the region count and free-text classification manually;
 * the expanded view shows the patient's drawings as a thumbnail grid.
 */

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScoreCardLayout } from "@/features/questionnaire-viewer/components/dashboard/ScoreCardLayout";
import { ScoreInputRow } from "@/features/questionnaire-viewer/components/dashboard/ScoreInputRow";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { IMAGE_CONFIGS, REGION_ORDER } from "../constants";
import type { ImageId, PainDrawingData } from "../types";
import { ReadOnlyCanvas } from "./ReadOnlyCanvas";
import { RegionThumbnail } from "./RegionThumbnail";

interface PainDrawingScoreCardProps {
  data: PainDrawingData | null;
  title?: string;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export function PainDrawingScoreCard({
  data,
  title = "Schmerzzeichnung",
  isExpanded,
  onToggleExpand,
}: PainDrawingScoreCardProps) {
  const [selectedRegion, setSelectedRegion] = useState<ImageId | null>(null);
  const [regionCount, setRegionCount] = useState("");
  const [classification, setClassification] = useState("");
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
      <ScoreCardLayout
        title={title}
        manualAnchor="pain-drawing"
        isExpanded={isExpanded}
        onToggleExpand={onToggleExpand}
        note={note}
        onNoteChange={setNote}
        scoreInputs={
          <>
            <ScoreInputRow
              label="Regionen"
              rangeHint="≥ 0"
              formula={<>= Anzahl Regionen mit ≥ 1 Markierung</>}
            >
              <Input
                type="number"
                inputMode="numeric"
                value={regionCount}
                onChange={(e) => setRegionCount(e.target.value)}
                min={0}
                step={1}
                className="h-8 text-sm w-20"
              />
            </ScoreInputRow>
            <ScoreInputRow
              label="Einordnung"
              formula={<>frei (keine validierten Normwerte)</>}
            >
              <Input
                value={classification}
                onChange={(e) => setClassification(e.target.value)}
                placeholder="Einordnung eingeben"
                className="h-8 text-sm w-[200px]"
              />
            </ScoreInputRow>
          </>
        }
        expandedContent={
          <div className="grid grid-cols-5 gap-2">
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
