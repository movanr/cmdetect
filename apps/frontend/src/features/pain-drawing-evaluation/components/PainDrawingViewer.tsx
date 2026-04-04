import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Circle, MoveRight, PenLine } from "lucide-react";
import { useState } from "react";
import { IMAGE_CONFIGS, REGION_ORDER } from "../constants";
import { calculatePainDrawingScore } from "../scoring/calculatePainScore";
import type { ImageId, PainDrawingData } from "../types";
import { ReadOnlyCanvas } from "./ReadOnlyCanvas";
import { RegionThumbnail } from "./RegionThumbnail";

interface PainDrawingViewerProps {
  data: PainDrawingData;
}

/**
 * Full-page viewer component for pain drawing evaluation.
 * Shows region count, tab navigation for regions, and detailed element counts.
 */
export function PainDrawingViewer({ data }: PainDrawingViewerProps) {
  const [selectedRegion, setSelectedRegion] = useState<ImageId>("head-right");
  const score = calculatePainDrawingScore(data);

  return (
    <div className="space-y-6">
      {/* Score Summary Card */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Schmerzzeichnung</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Score Display */}
          <div className="flex items-center justify-center py-2">
            <span className="text-3xl font-bold">{score.regionCount}</span>
            <span className="text-xl text-muted-foreground ml-1">/ 5</span>
            <span className="ml-3 text-lg font-medium">
              {score.regionCount} {score.regionCount === 1 ? "Schmerzgebiet" : "Schmerzgebiete"}
            </span>
          </div>

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
          <Tabs value={selectedRegion} onValueChange={(v) => setSelectedRegion(v as ImageId)}>
            {/* Tab Navigation */}
            <TabsList className="grid w-full grid-cols-5 mb-4">
              {REGION_ORDER.map((regionId) => {
                const config = IMAGE_CONFIGS[regionId];
                const hasElements = (data.drawings[regionId]?.elements?.length ?? 0) > 0;
                return (
                  <TabsTrigger key={regionId} value={regionId} className="relative text-xs">
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
                        {score.elementCounts[regionId].shadings !== 1 ? "en" : ""}
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
