import { useRef, useState, useEffect, useCallback } from 'react';
import { Stage, Layer, Line, Circle, Arrow, Image as KonvaImage } from 'react-konva';
import type Konva from 'konva';
import type {
  DrawingTool,
  DrawingElement,
  ShadingStroke,
  PointMarker,
  ArrowMarker,
  ImageConfig,
  CanvasSize,
} from './types';
import { DRAWING_STYLES, CANVAS_CONFIG } from './constants';

interface PainDrawingCanvasProps {
  imageConfig: ImageConfig;
  elements: DrawingElement[];
  activeTool: DrawingTool;
  onAddElement: (element: DrawingElement) => void;
  stageRef?: React.RefObject<Konva.Stage | null>;
  fillContainer?: boolean;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function PainDrawingCanvas({
  imageConfig,
  elements,
  activeTool,
  onAddElement,
  stageRef: externalStageRef,
  fillContainer = false,
}: PainDrawingCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const internalStageRef = useRef<Konva.Stage>(null);
  const stageRef = externalStageRef ?? internalStageRef;

  const [canvasSize, setCanvasSize] = useState<CanvasSize>({
    width: CANVAS_CONFIG.maxWidth,
    height: CANVAS_CONFIG.maxWidth * imageConfig.aspectRatio,
    scale: 1,
  });

  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<number[]>([]);
  const [arrowStart, setArrowStart] = useState<{ x: number; y: number } | null>(null);
  const [arrowEnd, setArrowEnd] = useState<{ x: number; y: number } | null>(null);

  // Calculate canvas size to fit container while maintaining aspect ratio
  const calculateSize = useCallback(
    (containerWidth: number, containerHeight: number, imgWidth: number, imgHeight: number) => {
      const imageAspect = imgHeight / imgWidth;

      let width: number;
      let height: number;

      if (fillContainer && containerHeight > 0) {
        // Fit within both width and height constraints
        const widthFromHeight = containerHeight / imageAspect;
        const heightFromWidth = containerWidth * imageAspect;

        if (heightFromWidth <= containerHeight) {
          // Width-constrained
          width = Math.min(containerWidth, CANVAS_CONFIG.maxWidth);
          height = width * imageAspect;
        } else {
          // Height-constrained
          height = containerHeight;
          width = Math.min(widthFromHeight, CANVAS_CONFIG.maxWidth);
          // Recalculate height if width was capped
          if (width < widthFromHeight) {
            height = width * imageAspect;
          }
        }
      } else {
        // Original behavior: width-based scaling
        width = Math.min(Math.max(containerWidth, CANVAS_CONFIG.minWidth), CANVAS_CONFIG.maxWidth);
        height = width * imageAspect;
      }

      return {
        width,
        height,
        scale: width / imgWidth,
      };
    },
    [fillContainer]
  );

  // Load background image
  useEffect(() => {
    const img = new window.Image();
    img.src = imageConfig.src;
    img.onload = () => {
      setBackgroundImage(img);
      if (containerRef.current) {
        const { offsetWidth, offsetHeight } = containerRef.current;
        setCanvasSize(calculateSize(offsetWidth, offsetHeight, img.width, img.height));
      }
    };
  }, [imageConfig.src, calculateSize]);

  // Handle responsive sizing
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: containerWidth, height: containerHeight } = entry.contentRect;
        const imgWidth = backgroundImage?.width ?? 100;
        const imgHeight = backgroundImage?.height ?? imgWidth * imageConfig.aspectRatio;
        setCanvasSize(calculateSize(containerWidth, containerHeight, imgWidth, imgHeight));
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [backgroundImage, imageConfig.aspectRatio, calculateSize]);

  // Prevent scroll during single-finger touch drawing
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const preventScroll = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        e.preventDefault();
      }
    };

    container.addEventListener('touchstart', preventScroll, { passive: false });
    container.addEventListener('touchmove', preventScroll, { passive: false });

    return () => {
      container.removeEventListener('touchstart', preventScroll);
      container.removeEventListener('touchmove', preventScroll);
    };
  }, []);

  const getPointerPosition = useCallback((): { x: number; y: number } | null => {
    const stage = stageRef.current;
    if (!stage) return null;
    const pos = stage.getPointerPosition();
    if (!pos) return null;
    // Convert to image coordinates (unscaled)
    return {
      x: pos.x / canvasSize.scale,
      y: pos.y / canvasSize.scale,
    };
  }, [canvasSize.scale, stageRef]);

  const handleMouseDown = useCallback(() => {
    const pos = getPointerPosition();
    if (!pos) return;

    if (activeTool === 'shade') {
      setIsDrawing(true);
      setCurrentStroke([pos.x, pos.y]);
    } else if (activeTool === 'point') {
      const point: PointMarker = {
        id: generateId(),
        type: 'point',
        x: pos.x,
        y: pos.y,
      };
      onAddElement(point);
    } else if (activeTool === 'arrow') {
      setArrowStart(pos);
    }
  }, [activeTool, getPointerPosition, onAddElement]);

  const handleMouseMove = useCallback(() => {
    const pos = getPointerPosition();
    if (!pos) return;

    if (isDrawing && activeTool === 'shade') {
      setCurrentStroke((prev) => [...prev, pos.x, pos.y]);
    } else if (arrowStart && activeTool === 'arrow') {
      setArrowEnd(pos);
    }
  }, [activeTool, arrowStart, getPointerPosition, isDrawing]);

  const handleMouseUp = useCallback(() => {
    if (activeTool === 'shade' && isDrawing && currentStroke.length >= 4) {
      const stroke: ShadingStroke = {
        id: generateId(),
        type: 'shade',
        points: currentStroke,
      };
      onAddElement(stroke);
    } else if (activeTool === 'arrow' && arrowStart) {
      const pos = getPointerPosition();
      if (pos) {
        const dx = pos.x - arrowStart.x;
        const dy = pos.y - arrowStart.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        // Only create arrow if dragged a minimum distance
        if (distance > 20) {
          const arrow: ArrowMarker = {
            id: generateId(),
            type: 'arrow',
            points: [arrowStart.x, arrowStart.y, pos.x, pos.y],
          };
          onAddElement(arrow);
        }
      }
    }

    setIsDrawing(false);
    setCurrentStroke([]);
    setArrowStart(null);
    setArrowEnd(null);
  }, [activeTool, arrowStart, currentStroke, getPointerPosition, isDrawing, onAddElement]);

  // Scale for positioning (image coordinates to canvas coordinates)
  const positionScale = canvasSize.scale;
  // Scale for visual elements (consistent across all images, based on canvas width)
  const visualScale = canvasSize.width / 400; // 400px as reference width

  const renderElement = (element: DrawingElement) => {
    switch (element.type) {
      case 'shade':
        return (
          <Line
            key={element.id}
            points={element.points.map((p) => p * positionScale)}
            stroke={DRAWING_STYLES.shade.stroke}
            strokeWidth={DRAWING_STYLES.shade.strokeWidth * visualScale}
            opacity={DRAWING_STYLES.shade.opacity}
            lineCap={DRAWING_STYLES.shade.lineCap}
            lineJoin={DRAWING_STYLES.shade.lineJoin}
            tension={DRAWING_STYLES.shade.tension}
          />
        );
      case 'point':
        return (
          <Circle
            key={element.id}
            x={element.x * positionScale}
            y={element.y * positionScale}
            radius={DRAWING_STYLES.point.radius * visualScale}
            fill={DRAWING_STYLES.point.fill}
          />
        );
      case 'arrow':
        return (
          <Arrow
            key={element.id}
            points={element.points.map((p) => p * positionScale)}
            stroke={DRAWING_STYLES.arrow.stroke}
            strokeWidth={DRAWING_STYLES.arrow.strokeWidth * visualScale}
            fill={DRAWING_STYLES.arrow.fill}
            pointerLength={DRAWING_STYLES.arrow.pointerLength * visualScale}
            pointerWidth={DRAWING_STYLES.arrow.pointerWidth * visualScale}
          />
        );
    }
  };

  return (
    <div
      ref={containerRef}
      className={`flex justify-center items-center touch-none ${fillContainer ? 'flex-1 h-full' : ''}`}
      style={fillContainer ? undefined : { minHeight: canvasSize.height }}
    >
      <Stage
        ref={stageRef}
        width={canvasSize.width}
        height={canvasSize.height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
        className="border border-gray-300 rounded-lg bg-white"
      >
        <Layer>
          {/* Background image */}
          {backgroundImage && (
            <KonvaImage
              image={backgroundImage}
              width={canvasSize.width}
              height={canvasSize.height}
              scaleX={imageConfig.mirror ? -1 : 1}
              x={imageConfig.mirror ? canvasSize.width : 0}
            />
          )}

          {/* Existing elements - rendered in order: shading, points, arrows (arrows on top) */}
          {elements.filter((e) => e.type === 'shade').map(renderElement)}
          {elements.filter((e) => e.type === 'point').map(renderElement)}
          {elements.filter((e) => e.type === 'arrow').map(renderElement)}

          {/* Current stroke being drawn */}
          {isDrawing && currentStroke.length >= 4 && (
            <Line
              points={currentStroke.map((p) => p * positionScale)}
              stroke={DRAWING_STYLES.shade.stroke}
              strokeWidth={DRAWING_STYLES.shade.strokeWidth * visualScale}
              opacity={DRAWING_STYLES.shade.opacity}
              lineCap={DRAWING_STYLES.shade.lineCap}
              lineJoin={DRAWING_STYLES.shade.lineJoin}
              tension={DRAWING_STYLES.shade.tension}
            />
          )}

          {/* Arrow preview while dragging */}
          {arrowStart && arrowEnd && activeTool === 'arrow' && (
            <Arrow
              points={[
                arrowStart.x * positionScale,
                arrowStart.y * positionScale,
                arrowEnd.x * positionScale,
                arrowEnd.y * positionScale,
              ]}
              stroke={DRAWING_STYLES.arrow.stroke}
              strokeWidth={DRAWING_STYLES.arrow.strokeWidth * visualScale}
              fill={DRAWING_STYLES.arrow.fill}
              pointerLength={DRAWING_STYLES.arrow.pointerLength * visualScale}
              pointerWidth={DRAWING_STYLES.arrow.pointerWidth * visualScale}
              opacity={0.6}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
}
