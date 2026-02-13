import { useState } from "react";
import { AlertTriangle, Circle, MoveRight, PenLine } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { IMAGE_CONFIGS, REGION_ORDER, SEVERITY_SEGMENTS } from "../constants";
import { calculatePainDrawingScore } from "../scoring/calculatePainScore";
import type { ImageId, PainDrawingData } from "../types";
import { ReadOnlyCanvas } from "./ReadOnlyCanvas";
import { RegionThumbnail } from "./RegionThumbnail";

interface PainDrawingViewerProps {
  data: PainDrawingData;
}

/**
 * Full-page viewer component for pain drawing evaluation
 * Shows score summary, tab navigation for regions, and detailed element counts
 */
export function PainDrawingViewer({ data }: PainDrawingViewerProps) {
  const [selectedRegion, setSelectedRegion] = useState<ImageId>("head-right");
  const score = calculatePainDrawingScore(data);

  // Get active segment index for severity scale
  const activeSegmentIndex = Math.min(score.regionCount, 5);

  return (
    <div className="space-y-6">
      {/* Score Summary Card */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Schmerzzeichnung - Auswertung</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Severity Scale */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Betroffene Regionen
            </p>
            <div className="flex h-8 rounded-md overflow-hidden gap-0.5 bg-muted">
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
                      className={`text-sm font-bold ${
                        isActive ? "text-white drop-shadow-sm" : "text-gray-400"
                      }`}
                    >
                      {segment.label}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex mt-1 text-[9px]">
              {SEVERITY_SEGMENTS.map((segment, index) => (
                <div
                  key={segment.label}
                  className={`flex-1 text-center ${
                    index === activeSegmentIndex
                      ? "font-medium text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {segment.label}
                </div>
              ))}
            </div>
          </div>

          {/* Score Display */}
          <div className="flex items-center justify-center py-2">
            <span className="text-3xl font-bold">{score.regionCount}</span>
            <span className="text-xl text-muted-foreground ml-1">/ 5</span>
            <span className="ml-3 text-lg font-medium">
              {score.regionCount} {score.regionCount === 1 ? "Region" : "Regionen"}
            </span>
          </div>

          {/* Widespread Pain Warning */}
          {score.patterns.hasWidespreadPain && (
            <div className="flex items-center justify-center gap-2 text-red-600 bg-red-50 py-2 px-4 rounded-md">
              <AlertTriangle className="size-5" />
              <span className="font-medium">
                Schmerz in mehreren Körperbereichen
              </span>
            </div>
          )}

          {/* Affected Regions List */}
          {score.affectedRegions.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center pt-2 border-t">
              {score.affectedRegions.map((regionId) => (
                <Badge key={regionId} variant="secondary">
                  {IMAGE_CONFIGS[regionId].label}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Region Viewer Card */}
      <Card>
        <CardContent className="pt-6">
          <Tabs
            value={selectedRegion}
            onValueChange={(v) => setSelectedRegion(v as ImageId)}
          >
            {/* Tab Navigation */}
            <TabsList className="grid w-full grid-cols-5 mb-4">
              {REGION_ORDER.map((regionId) => {
                const config = IMAGE_CONFIGS[regionId];
                const hasElements =
                  (data.drawings[regionId]?.elements?.length ?? 0) > 0;
                return (
                  <TabsTrigger
                    key={regionId}
                    value={regionId}
                    className="relative text-xs"
                  >
                    {config.label}
                    {hasElements && (
                      <span className="absolute -top-1 -right-1 size-2 rounded-full bg-red-500" />
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* Tab Content */}
            {REGION_ORDER.map((regionId) => (
              <TabsContent key={regionId} value={regionId} className="mt-0">
                <div className="flex flex-col items-center">
                  {/* Canvas */}
                  <div className="w-full max-w-md">
                    <ReadOnlyCanvas
                      imageConfig={IMAGE_CONFIGS[regionId]}
                      elements={data.drawings[regionId]?.elements ?? []}
                    />
                  </div>

                  {/* Element counts */}
                  <div className="flex gap-6 mt-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <PenLine className="size-4" />
                      <span>
                        {score.elementCounts[regionId].shadings} Schattierung
                        {score.elementCounts[regionId].shadings !== 1
                          ? "en"
                          : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Circle className="size-4" />
                      <span>
                        {score.elementCounts[regionId].points} Punkt
                        {score.elementCounts[regionId].points !== 1 ? "e" : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MoveRight className="size-4" />
                      <span>
                        {score.elementCounts[regionId].arrows} Pfeil
                        {score.elementCounts[regionId].arrows !== 1 ? "e" : ""}
                      </span>
                    </div>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Grid View Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Alle Regionen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {REGION_ORDER.map((regionId) => (
              <RegionThumbnail
                key={regionId}
                imageId={regionId}
                elements={data.drawings[regionId]?.elements ?? []}
                isSelected={regionId === selectedRegion}
                onClick={() => setSelectedRegion(regionId)}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
