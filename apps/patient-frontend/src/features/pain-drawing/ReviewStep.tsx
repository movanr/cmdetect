import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IMAGE_CONFIGS, WIZARD_STEPS } from "./constants";
import type { ImageDrawingData, ImageId } from "./types";
import { DrawingPreview } from "./DrawingPreview";

interface ReviewStepProps {
  drawings: Record<ImageId, ImageDrawingData>;
  onEditStep: (stepIndex: number) => void;
}

export function ReviewStep({ drawings, onEditStep }: ReviewStepProps) {
  // Get the drawing steps (skip instruction and review steps)
  const drawingSteps = WIZARD_STEPS.filter((step) => step.type === "drawing");

  return (
    <div className="flex flex-col gap-6 max-w-md mx-auto w-full">
      <h2 className="text-lg font-semibold text-center">Überprüfung Ihrer Zeichnungen</h2>

      <div className="grid grid-cols-2 gap-4">
        {drawingSteps.map((step, index) => {
          const imageId = step.imageId!;
          const config = IMAGE_CONFIGS[imageId];
          const drawing = drawings[imageId];
          const hasDrawing = drawing && drawing.elements.length > 0;
          const wizardStepIndex = index;

          return (
            <Card
              key={imageId}
              className="cursor-pointer hover:ring-2 hover:ring-primary transition-all"
              onClick={() => onEditStep(wizardStepIndex)}
            >
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-sm font-medium text-center">{config.label}</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="relative aspect-square bg-muted rounded-md overflow-hidden">
                  <DrawingPreview
                    imageConfig={config}
                    elements={drawing?.elements ?? []}
                  />

                  {/* Overlay indicator */}
                  <div className="absolute bottom-1 right-1">
                    {hasDrawing ? (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-500 text-white text-xs">
                        <CheckIcon />
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-muted-foreground/20 text-muted-foreground text-xs">
                        -
                      </span>
                    )}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-2 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditStep(wizardStepIndex);
                  }}
                >
                  <EditIcon />
                  Bearbeiten
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <p className="text-sm text-muted-foreground text-center">
        Tippen Sie auf eine Zeichnung, um sie zu bearbeiten.
      </p>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}
