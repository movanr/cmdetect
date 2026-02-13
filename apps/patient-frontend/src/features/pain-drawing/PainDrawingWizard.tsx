import { useState, useRef, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type Konva from 'konva';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { DrawingTool, DrawingElement, PainDrawingData, HistoryState } from './types';
import { WIZARD_STEPS, IMAGE_CONFIGS, INSTRUCTION_TEXT } from './constants';
import { PainDrawingCanvas } from './PainDrawingCanvas';
import { DrawingToolbar } from './DrawingToolbar';
import { ReviewStep } from './ReviewStep';
import { usePainDrawing } from './hooks/usePainDrawing';
import { useDrawingHistory } from './hooks/useDrawingHistory';

export type TransitionPhase =
  | "active"     // Normal interaction
  | "completing" // Progress bar filling to 100%
  | "success"    // Green bar + checkmark animation
  | "exiting";   // Transitioning to next questionnaire

// Animation timing (ms)
const TIMING = {
  fillProgress: 280,
  successPause: 560,
};

interface PainDrawingWizardProps {
  onComplete: (data: PainDrawingData) => void;
  onCancel?: () => void;
  transitionPhase?: TransitionPhase;
  onTransitionPhaseComplete?: (phase: TransitionPhase) => void;
}

export function PainDrawingWizard({
  onComplete,
  onCancel,
  transitionPhase = "active",
  onTransitionPhaseComplete,
}: PainDrawingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeTool, setActiveTool] = useState<DrawingTool>('shade');
  const [showHelp, setShowHelp] = useState(true); // Show help on first load
  const stageRef = useRef<Konva.Stage>(null);

  // Transition phase tracking
  const isTransitioning = transitionPhase !== "active";
  const isSuccess = transitionPhase === "success" || transitionPhase === "exiting";
  const isAnimating = transitionPhase === "completing" || transitionPhase === "success";

  // Handle transition phase timing
  useEffect(() => {
    if (!onTransitionPhaseComplete) return;

    if (transitionPhase === "completing") {
      const timer = setTimeout(() => {
        onTransitionPhaseComplete("completing");
      }, TIMING.fillProgress);
      return () => clearTimeout(timer);
    }

    if (transitionPhase === "success") {
      const timer = setTimeout(() => {
        onTransitionPhaseComplete("success");
      }, TIMING.successPause);
      return () => clearTimeout(timer);
    }
  }, [transitionPhase, onTransitionPhaseComplete]);

  const {
    drawings,
    updateElements,
    getExportData,
  } = usePainDrawing();

  const totalSteps = WIZARD_STEPS.length;
  const reviewStepIndex = totalSteps - 1;
  const step = WIZARD_STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isReviewStep = step.type === 'review';
  const isDrawingStep = step.type === 'drawing';
  const baseProgress = ((currentStep + 1) / totalSteps) * 100;
  // During transition, show 100%
  const progress = isTransitioning ? 100 : baseProgress;

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
    getHistoryState,
    restoreState,
  } = useDrawingHistory([]);

  // Keep refs for callbacks to avoid stale closures
  const updateElementsRef = useRef(updateElements);
  const currentImageIdRef = useRef(currentImageId);

  // Update refs in effect to avoid accessing during render
  useEffect(() => {
    updateElementsRef.current = updateElements;
  });

  // Per-image history storage (preserves undo/redo stacks across navigation)
  const savedHistoriesRef = useRef<Record<string, HistoryState>>({});

  // Save and restore history when switching between images
  useEffect(() => {
    if (currentImageId && currentImageId !== currentImageIdRef.current) {
      const oldImageId = currentImageIdRef.current;
      currentImageIdRef.current = currentImageId;

      // Save history state for the image we're leaving
      if (oldImageId) {
        savedHistoriesRef.current[oldImageId] = getHistoryState();
      }

      // Restore saved history or initialize from stored elements
      const saved = savedHistoriesRef.current[currentImageId];
      if (saved) {
        restoreState(saved);
      } else {
        setElements(drawings[currentImageId].elements);
      }

      // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional reset on image change
      setActiveTool('shade');
    }
  }, [currentImageId, drawings, setElements, getHistoryState, restoreState]);

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

  const goToReview = useCallback(() => {
    setCurrentStep(reviewStepIndex);
    setIsEditMode(false);
  }, [reviewStepIndex]);

  const handleNext = useCallback(() => {
    if (isReviewStep) {
      const data = getExportData();
      onComplete(data);
    } else if (isEditMode) {
      goToReview();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  }, [getExportData, goToReview, isEditMode, isReviewStep, onComplete]);

  const handlePrevious = useCallback(() => {
    if (isEditMode) {
      goToReview();
    } else if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [goToReview, isEditMode, isFirstStep]);

  const handleEditStep = useCallback((stepIndex: number) => {
    setIsEditMode(true);
    setCurrentStep(stepIndex);
  }, []);

  const handleAddElement = useCallback((element: DrawingElement) => {
    addElement(element);
  }, [addElement]);

  const renderStepContent = () => {
    switch (step.type) {
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
    <div className="flex flex-col h-dvh overflow-hidden bg-background max-w-2xl mx-auto w-full">
      {/* Help overlay */}
      {showHelp && (
        <div className="absolute inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg shadow-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-semibold">{INSTRUCTION_TEXT.title}</h2>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setShowHelp(false)}
              >
                <CloseIcon />
              </Button>
            </div>
            <div className="p-4 space-y-4">
              {INSTRUCTION_TEXT.paragraphs.map((paragraph, index) => (
                <p key={index} className="text-muted-foreground">
                  {paragraph}
                </p>
              ))}
              <div className="space-y-3 pt-2">
                {INSTRUCTION_TEXT.tools.map((tool) => (
                  <div key={tool.name} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                    <div>
                      <span className="font-medium">{tool.name}:</span>{' '}
                      <span className="text-muted-foreground">{tool.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 border-t">
              <Button onClick={() => setShowHelp(false)} className="w-full">
                Verstanden
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Fixed header */}
      <div className="shrink-0 px-4 pt-4 pb-2 bg-background">
        <div className="flex items-center justify-between mb-2">
          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1 text-green-600"
              >
                <Check className="h-4 w-4" />
                <span className="text-sm font-medium">Schmerzzeichnung Abgeschlossen</span>
              </motion.div>
            ) : (
              <motion.span
                key="progress"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm text-muted-foreground"
              >
                Schritt {currentStep + 1} von {totalSteps}
              </motion.span>
            )}
          </AnimatePresence>
          {!isSuccess && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{step.title}</span>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setShowHelp(true)}
                title="Hilfe anzeigen"
                disabled={isTransitioning}
              >
                <HelpIcon />
              </Button>
            </div>
          )}
        </div>
        {/* Animated progress bar */}
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-primary/20">
          <motion.div
            className={`h-full rounded-full ${isSuccess ? "bg-green-500" : "bg-primary"}`}
            initial={{ width: `${baseProgress}%` }}
            animate={{ width: `${progress}%` }}
            transition={{
              duration: isAnimating ? TIMING.fillProgress / 1000 : 0.2,
              ease: "easeOut",
            }}
          />
          {/* Success pulse overlay */}
          <AnimatePresence>
            {transitionPhase === "success" && (
              <motion.div
                className="absolute inset-0 rounded-full bg-green-400"
                initial={{ opacity: 0.6 }}
                animate={{ opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            )}
          </AnimatePresence>
        </div>
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
        {!isTransitioning && (
          <div className="flex gap-3 justify-center">
            {onCancel && isFirstStep && !isEditMode && (
              <Button variant="outline" onClick={onCancel}>
                Abbrechen
              </Button>
            )}

            {isEditMode && (
              <Button
                variant="outline"
                onClick={handlePrevious}
              >
                <ChevronLeftIcon />
                Abbrechen
              </Button>
            )}

            {!isFirstStep && !isEditMode && (
              <Button
                variant="outline"
                onClick={handlePrevious}
              >
                <ChevronLeftIcon />
                Zurück
              </Button>
            )}

            <Button onClick={handleNext}>
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
        )}
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

function HelpIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
