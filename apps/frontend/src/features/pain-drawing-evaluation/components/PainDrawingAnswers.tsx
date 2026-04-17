/**
 * Left-sheet content for the pain drawing tab — thumbnail grid + full-size dialog.
 */

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ChevronLeft, ChevronRight, ClipboardList } from "lucide-react";
import { useState } from "react";
import { IMAGE_CONFIGS, REGION_ORDER } from "../constants";
import type { ImageId, PainDrawingData } from "../types";
import { ReadOnlyCanvas } from "./ReadOnlyCanvas";
import { RegionThumbnail } from "./RegionThumbnail";

interface PainDrawingAnswersProps {
  data: PainDrawingData | null;
}

export function PainDrawingAnswers({ data }: PainDrawingAnswersProps) {
  const [selectedRegion, setSelectedRegion] = useState<ImageId | null>(null);

  if (!data || !data.drawings) {
    return (
      <div className="py-6">
        <EmptyState
          icon={ClipboardList}
          title="Keine Zeichnung eingereicht"
          description="Manuelle Scoring-Eingabe ist weiterhin möglich (z. B. von Papierbogen)."
        />
      </div>
    );
  }

  return (
    <>
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
