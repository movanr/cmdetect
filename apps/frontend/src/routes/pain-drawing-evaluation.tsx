import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  PainDrawingViewer,
  PainDrawingScoreCard,
} from "../features/pain-drawing-evaluation";
import {
  mockPainDrawingData,
  emptyPainDrawingData,
  widespreadPainDrawingData,
} from "../features/pain-drawing-evaluation/testData";

export const Route = createFileRoute("/pain-drawing-evaluation")({
  component: PainDrawingEvaluationPage,
});

type TestDataType = "mock" | "empty" | "widespread";

function PainDrawingEvaluationPage() {
  const [selectedData, setSelectedData] = useState<TestDataType>("mock");

  const testDataOptions = {
    mock: { data: mockPainDrawingData, label: "Regional (3 Regionen)" },
    empty: { data: emptyPainDrawingData, label: "Keine Zeichnung" },
    widespread: { data: widespreadPainDrawingData, label: "Weitverbreitet (5 Regionen)" },
  };

  const currentData = testDataOptions[selectedData].data;

  return (
    <div className="container mx-auto max-w-5xl py-8 px-4">
      <div className="space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Schmerzzeichnung - Test
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Testseite für die Schmerzzeichnungs-Auswertung
          </p>
        </div>

        {/* Test data selector */}
        <div className="flex gap-2 flex-wrap">
          {(Object.keys(testDataOptions) as TestDataType[]).map((key) => (
            <Button
              key={key}
              variant={selectedData === key ? "default" : "outline"}
              onClick={() => setSelectedData(key)}
              size="sm"
            >
              {testDataOptions[key].label}
            </Button>
          ))}
        </div>

        {/* Score Card Demo */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Dashboard-Karte</h2>
          <div className="max-w-md">
            <PainDrawingScoreCard data={currentData} />
          </div>
        </div>

        {/* Full Viewer Demo */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Vollständige Ansicht</h2>
          <PainDrawingViewer data={currentData} />
        </div>
      </div>
    </div>
  );
}
