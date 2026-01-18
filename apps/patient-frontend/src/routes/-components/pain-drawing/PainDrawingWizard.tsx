import { useState, useRef, useCallback, useEffect } from 'react';
import type Konva from 'konva';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { DrawingTool, DrawingElement, PainDrawingData, ImageId } from './types';
import { WIZARD_STEPS, IMAGE_CONFIGS } from './constants';
import { InstructionStep } from './InstructionStep';
import { PainDrawingCanvas } from './PainDrawingCanvas';
import { DrawingToolbar } from './DrawingToolbar';
import { ReviewStep } from './ReviewStep';
import { usePainDrawing } from './hooks/usePainDrawing';
import { useCanvasExport } from './hooks/useCanvasExport';
import { useDrawingHistory } from './hooks/useDrawingHistory';

interface PainDrawingWizardProps {
  onComplete: (data: PainDrawingData) => void;
  onCancel?: () => void;
}

export function PainDrawingWizard({
  onComplete,
  onCancel,
}: PainDrawingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeTool, setActiveTool] = useState<DrawingTool>('shade');
  const stageRef = useRef<Konva.Stage>(null);
  const { exportToDataUrl } = useCanvasExport();

  const {
    drawings,
    updateElements,
    updatePngExport,
    getExportData,
  } = usePainDrawing();

  const totalSteps = WIZARD_STEPS.length;
  const reviewStepIndex = totalSteps - 1;
  const step = WIZARD_STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isReviewStep = step.type === 'review';
  const isDrawingStep = step.type === 'drawing';
  const progress = ((currentStep + 1) / totalSteps) * 100;

  // Get current image config for drawing steps
  const currentImageId = step.imageId;
  const currentImageConfig = currentImageId ? IMAGE_CONFIGS[currentImageId] : null;

  // Drawing history for current image
  const {
    elements: historyElements,
    canUndo,
    canRedo,
    addElement,
    undo,
    redo,
    clear,
    setElements,
  } = useDrawingHistory([]);

  // Keep refs for callbacks to avoid stale closures
  const updateElementsRef = useRef(updateElements);
  updateElementsRef.current = updateElements;
  const currentImageIdRef = useRef(currentImageId);

  // Reset history and tool when image changes
  useEffect(() => {
    if (currentImageId && currentImageId !== currentImageIdRef.current) {
      currentImageIdRef.current = currentImageId;
      setElements(drawings[currentImageId].elements);
      setActiveTool('shade'); // Reset to default tool
    }
  }, [currentImageId, drawings, setElements]);

  // Initialize on first mount for drawing step
  const initializedRef = useRef(false);
  useEffect(() => {
    if (currentImageId && !initializedRef.current) {
      initializedRef.current = true;
      setElements(drawings[currentImageId].elements);
    }
  }, [currentImageId, drawings, setElements]);

  // Sync history elements back to central state (debounced to avoid loops)
  const lastSyncedRef = useRef<DrawingElement[]>([]);
  useEffect(() => {
    const imageId = currentImageIdRef.current;
    if (imageId && historyElements !== lastSyncedRef.current) {
      lastSyncedRef.current = historyElements;
      updateElementsRef.current(imageId, historyElements);
    }
  }, [historyElements]);

  const exportCurrentCanvas = useCallback(() => {
    if (step.type === 'drawing' && step.imageId && stageRef.current) {
      const dataUrl = exportToDataUrl(stageRef.current);
      if (dataUrl) {
        updatePngExport(step.imageId, dataUrl);
      }
    }
  }, [exportToDataUrl, step, updatePngExport]);

  const goToReview = useCallback(() => {
    setCurrentStep(reviewStepIndex);
    setIsEditMode(false);
  }, [reviewStepIndex]);

  const handleNext = useCallback(() => {
    exportCurrentCanvas();

    if (isReviewStep) {
      const data = getExportData();
      console.log('Pain Drawing Data:', data);
      onComplete(data);
    } else if (isEditMode) {
      goToReview();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  }, [exportCurrentCanvas, getExportData, goToReview, isEditMode, isReviewStep, onComplete]);

  const handlePrevious = useCallback(() => {
    exportCurrentCanvas();

    if (isEditMode) {
      goToReview();
    } else if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [exportCurrentCanvas, goToReview, isEditMode, isFirstStep]);

  const handleEditStep = useCallback((stepIndex: number) => {
    setIsEditMode(true);
    setCurrentStep(stepIndex);
  }, []);

  const handleAddElement = useCallback((element: DrawingElement) => {
    addElement(element);
  }, [addElement]);

  const renderStepContent = () => {
    switch (step.type) {
      case 'instruction':
        return <InstructionStep />;

      case 'drawing':
        if (!currentImageConfig) return null;
        return (
          <PainDrawingCanvas
            key={currentImageId}
            imageConfig={currentImageConfig}
            elements={historyElements}
            activeTool={activeTool}
            onAddElement={handleAddElement}
            stageRef={stageRef}
            fillContainer
          />
        );

      case 'review':
        return (
          <ReviewStep drawings={drawings} onEditStep={handleEditStep} />
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-dvh overflow-hidden bg-background">
      {/* Fixed header */}
      <div className="shrink-0 px-4 pt-4 pb-2 bg-background">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            Schritt {currentStep + 1} von {totalSteps}
          </span>
          <span className="text-sm font-medium">{step.title}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Content area - fills remaining space */}
      <div className={`flex-1 overflow-hidden ${isDrawingStep ? 'flex flex-col px-4 py-2' : 'overflow-y-auto px-4 py-4'}`}>
        {renderStepContent()}
      </div>

      {/* Fixed bottom area */}
      <div className="shrink-0 bg-background border-t px-4 py-3 space-y-3">
        {/* Toolbar (only for drawing steps) */}
        {isDrawingStep && (
          <div className="pb-2 border-b">
            <DrawingToolbar
              activeTool={activeTool}
              onToolChange={setActiveTool}
              onUndo={undo}
              onRedo={redo}
              onClear={clear}
              canUndo={canUndo}
              canRedo={canRedo}
            />
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex gap-3">
          {onCancel && isFirstStep && !isEditMode && (
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Abbrechen
            </Button>
          )}

          {isEditMode && (
            <Button
              variant="outline"
              onClick={handlePrevious}
              className="flex-1"
            >
              <ChevronLeftIcon />
              Abbrechen
            </Button>
          )}

          {!isFirstStep && !isEditMode && (
            <Button
              variant="outline"
              onClick={handlePrevious}
              className="flex-1"
            >
              <ChevronLeftIcon />
              Zurueck
            </Button>
          )}

          <Button onClick={handleNext} className="flex-1">
            {isReviewStep ? (
              <>
                Fertig
                <CheckIcon />
              </>
            ) : isEditMode ? (
              <>
                Speichern
                <CheckIcon />
              </>
            ) : (
              <>
                Weiter
                <ChevronRightIcon />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ChevronLeftIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
