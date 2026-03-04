/**
 * Pain Drawing Score Card - Displays pain region thumbnails always expanded
 * Used in the dashboard for pain assessment before patient review
 */

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { IMAGE_CONFIGS, REGION_ORDER } from "../constants";
import { calculatePainDrawingScore } from "../scoring/calculatePainScore";
import type { ImageId, PainDrawingData } from "../types";
import { ReadOnlyCanvas } from "./ReadOnlyCanvas";
import { RegionThumbnail } from "./RegionThumbnail";

interface PainDrawingScoreCardProps {
  data: PainDrawingData | null;
  title?: string;
  subtitle?: string;
}

/**
 * Dashboard card component for pain drawing evaluation
 * Shows region thumbnails always visible; click to zoom in on a region
 */
export function PainDrawingScoreCard({
  data,
  title = "Schmerzzeichnung",
  subtitle = "DC/TMD Schmerzgebiete",
}: PainDrawingScoreCardProps) {
  const [selectedRegion, setSelectedRegion] = useState<ImageId | null>(null);

  // Check if data is empty (null, undefined, empty object, or missing drawings)
  const hasData = data && data.drawings && Object.keys(data.drawings).length > 0;

  // Handle no data case (including empty submissions from SQ screening negative)
  if (!hasData) {
    return (
      <Card className="bg-muted/30">
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-[minmax(180px,1fr)_minmax(250px,2fr)_minmax(150px,1fr)] gap-x-6 gap-y-4 items-center">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">{title}</h4>
              {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
            </div>
            <div />
            <div className="text-left">
              <p className="text-sm text-muted-foreground">Keine Daten</p>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  const score = calculatePainDrawingScore(data);
  const isWidespread = score.patterns.hasWidespreadPain;

  return (
    <>
      <Card className="overflow-hidden py-0 gap-0">
        <div className="p-4 pb-2 flex items-start justify-between">
          <div>
            <h4 className="font-medium text-sm leading-tight">{title}</h4>
            {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
            {isWidespread && (
              <div className="flex items-center gap-1.5 text-red-600 mt-1">
                <AlertTriangle className="size-3.5 shrink-0" />
                <span className="text-xs font-medium">Schmerz in mehreren Körperbereichen</span>
              </div>
            )}
          </div>
          <Link
            to="/docs/scoring-manual"
            hash="pain-drawing"
            onClick={() => sessionStorage.setItem("docs-return-url", window.location.pathname)}
            className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary hover:underline shrink-0 ml-3"
          >
            <BookOpen className="h-3 w-3" />
            Scoring-Anleitung
          </Link>
        </div>

        <div className="px-4 pb-4">
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
        </div>
      </Card>

      {/* Single Region Modal */}
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

              <p className="text-sm text-muted-foreground mt-3">
                {score.elementCounts[selectedRegion].total} Markierung
                {score.elementCounts[selectedRegion].total !== 1 ? "en" : ""}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
