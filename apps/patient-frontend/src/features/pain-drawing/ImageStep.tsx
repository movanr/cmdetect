import { useState, useEffect, useRef } from 'react';
import type Konva from 'konva';
import type { DrawingTool, DrawingElement, ImageId } from './types';
import { IMAGE_CONFIGS } from './constants';
import { PainDrawingCanvas } from './PainDrawingCanvas';
import { DrawingToolbar } from './DrawingToolbar';
import { useDrawingHistory } from './hooks/useDrawingHistory';

interface ImageStepProps {
  imageId: ImageId;
  initialElements?: DrawingElement[];
  onElementsChange: (elements: DrawingElement[]) => void;
  stageRef?: React.RefObject<Konva.Stage | null>;
}

/**
 * Standalone ImageStep component with integrated toolbar.
 * For use outside the wizard or when fixed layout is not needed.
 */
export function ImageStep({
  imageId,
  initialElements = [],
  onElementsChange,
  stageRef,
}: ImageStepProps) {
  const [activeTool, setActiveTool] = useState<DrawingTool>('shade');
  const imageConfig = IMAGE_CONFIGS[imageId];
  const isFirstRender = useRef(true);
  const onElementsChangeRef = useRef(onElementsChange);
  onElementsChangeRef.current = onElementsChange;

  const {
    elements,
    canUndo,
    canRedo,
    addElement,
    undo,
    redo,
    clear,
  } = useDrawingHistory(initialElements);

  // Sync elements changes to parent (skip first render to avoid overwriting)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    onElementsChangeRef.current(elements);
  }, [elements]);

  return (
    <div className="flex flex-col gap-4">
      {/* Image label */}
      <h2 className="text-lg font-semibold text-center">{imageConfig.label}</h2>

      {/* Canvas */}
      <PainDrawingCanvas
        imageConfig={imageConfig}
        elements={elements}
        activeTool={activeTool}
        onAddElement={addElement}
        stageRef={stageRef}
      />

      {/* Toolbar */}
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
  );
}
