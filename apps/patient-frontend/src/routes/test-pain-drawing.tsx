import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PainDrawingWizard } from './-components/pain-drawing';
import type { PainDrawingData } from './-components/pain-drawing/types';

export const Route = createFileRoute('/test-pain-drawing')({
  component: TestPainDrawingPage,
});

function TestPainDrawingPage() {
  const [isStarted, setIsStarted] = useState(false);
  const [completedData, setCompletedData] = useState<PainDrawingData | null>(
    null
  );

  const handleComplete = (data: PainDrawingData) => {
    setCompletedData(data);
    setIsStarted(false);
    console.log('Completed Pain Drawing Data:', JSON.stringify(data, null, 2));
  };

  const handleCancel = () => {
    setIsStarted(false);
  };

  const handleReset = () => {
    setCompletedData(null);
  };

  if (isStarted) {
    // Wizard uses full viewport height, no wrapper needed
    return (
      <PainDrawingWizard
        onComplete={handleComplete}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-lg mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Pain Drawing Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              This is a test page for the DC/TMD pain drawing feature. Click the
              button below to start the pain drawing wizard.
            </p>

            <Button onClick={() => setIsStarted(true)} className="w-full">
              Start Pain Drawing
            </Button>
          </CardContent>
        </Card>

        {completedData && (
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">
                Drawing Completed!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Completed at: {completedData.completedAt}
              </p>

              <div className="space-y-2">
                <p className="font-medium">Drawings Summary:</p>
                {Object.entries(completedData.drawings).map(
                  ([imageId, drawing]) => (
                    <div
                      key={imageId}
                      className="flex items-center justify-between text-sm"
                    >
                      <span>{imageId}</span>
                      <span className="text-muted-foreground">
                        {drawing.elements.length} elements
                        {drawing.pngExport ? ' (PNG exported)' : ''}
                      </span>
                    </div>
                  )
                )}
              </div>

              <div className="pt-4 space-y-2">
                <p className="font-medium text-sm">PNG Previews:</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(completedData.drawings)
                    .filter(([, drawing]) => drawing.pngExport)
                    .map(([imageId, drawing]) => (
                      <div key={imageId} className="space-y-1">
                        <p className="text-xs text-muted-foreground">
                          {imageId}
                        </p>
                        <img
                          src={drawing.pngExport}
                          alt={imageId}
                          className="w-full border rounded"
                        />
                      </div>
                    ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="flex-1"
                >
                  Clear Results
                </Button>
                <Button
                  onClick={() => setIsStarted(true)}
                  className="flex-1"
                >
                  Draw Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">JSON Data (Console)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Open browser DevTools (F12) and check the Console tab to see the
              full JSON data structure when you complete the wizard.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
