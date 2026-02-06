/**
 * Pain Drawing Score Card - Displays pain region count with visual severity scale
 * Used in the dashboard for quick pain assessment before patient review
 * Follows the horizontal 3-column layout for consistent UI
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle, ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import { useState } from "react";
import { IMAGE_CONFIGS, REGION_ORDER, SEVERITY_SEGMENTS } from "../constants";
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
 * Shows severity scale, region count, and expandable thumbnail grid
 */
export function PainDrawingScoreCard({
  data,
  title = "Schmerzzeichnung",
  subtitle = "DC/TMD Schmerzareale",
}: PainDrawingScoreCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
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
  const activeSegmentIndex = Math.min(score.regionCount, 5);
  const isWidespread = score.patterns.hasWidespreadPain;

  return (
    <>
      <Card className="overflow-hidden py-0 gap-0">
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-[minmax(180px,1fr)_minmax(250px,2fr)_minmax(150px,1fr)] gap-x-6 gap-y-4 items-center">
            {/* LEFT: Title + warning */}
            <div className="min-w-0">
              <h4 className="font-medium text-sm leading-tight">{title}</h4>
              {subtitle && (
                <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
              )}
              {isWidespread && (
                <div className="flex items-center gap-1.5 text-red-600 mt-1.5">
                  <AlertTriangle className="size-3.5 shrink-0" />
                  <span className="text-xs font-medium">Schmerz in mehreren Körperbereichen</span>
                </div>
              )}
            </div>

            {/* CENTER: Severity scale */}
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground mb-1">
                Anzahl schmerzhafter Körperstellen
              </p>
              <div className="relative">
                <div className="flex h-6 rounded-md overflow-hidden gap-0.5 bg-muted">
                  {SEVERITY_SEGMENTS.map((segment, index) => {
                    const isActive = index === activeSegmentIndex;
                    return (
                      <div
                        key={segment.label}
                        className={`flex-1 ${
                          isActive
                            ? `${segment.color} ring-2 ring-black/60 ring-inset scale-105 z-10 rounded-sm shadow-md`
                            : "bg-gray-200"
                        } flex items-center justify-center transition-all`}
                      >
                        <span
                          className={`text-[9px] font-bold ${
                            isActive ? "text-white drop-shadow-sm" : "text-gray-400"
                          }`}
                        >
                          {segment.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              {/* Risk interpretation - only shown when pain is marked */}
              {score.regionCount >= 1 && (
                <p className="text-[9px] text-muted-foreground mt-1">
                  Jede markierte Körperstelle erhöht das Risiko für weitere Schmerzerkrankungen.
                </p>
              )}
            </div>

            {/* RIGHT: Region count + expand */}
            <div className="flex items-start justify-between gap-2 min-w-0">
              <div>
                <div className="text-xl font-bold leading-tight">
                  {score.regionCount}
                  <span className="text-sm text-muted-foreground font-normal"> {score.regionCount === 1 ? "Areal" : "Areale"}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {score.totalElements} Markierung{score.totalElements !== 1 ? "en" : ""}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-muted-foreground h-7 px-2 text-xs shrink-0"
              >
                {isExpanded ? (
                  <>
                    Ausblenden <ChevronUp className="ml-1 h-3 w-3" />
                  </>
                ) : (
                  <>
                    Details <ChevronDown className="ml-1 h-3 w-3" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Expandable details with thumbnail grid */}
        <div
          className="grid transition-[grid-template-rows] duration-300 ease-out"
          style={{ gridTemplateRows: isExpanded ? "1fr" : "0fr" }}
        >
          <div className="overflow-hidden">
            <CardContent className="border-t bg-muted/20 p-4">
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
            </CardContent>
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
              {/* Navigation and Canvas */}
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
