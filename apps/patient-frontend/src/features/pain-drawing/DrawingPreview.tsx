import { useState, useEffect, useRef, useMemo } from 'react';
import { Stage, Layer, Line, Circle, Arrow, Image as KonvaImage } from 'react-konva';
import type { DrawingElement, ImageConfig } from './types';
import { DRAWING_STYLES } from './constants';

interface DrawingPreviewProps {
  imageConfig: ImageConfig;
  elements: DrawingElement[];
  /** Fixed pixel size. If omitted, auto-sizes to fill the container. */
  size?: number;
}

export function DrawingPreview({
  imageConfig,
  elements,
  size: sizeProp,
}: DrawingPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState(sizeProp ?? 150);
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);

  const size = sizeProp ?? containerSize;

  // Auto-measure container when no explicit size is given
  useEffect(() => {
    if (sizeProp) return;
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width > 0 && height > 0) {
        setContainerSize(Math.floor(Math.min(width, height)));
      }
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [sizeProp]);

  // Load background image (independent of size)
  useEffect(() => {
    const img = new window.Image();
    img.src = imageConfig.src;
    img.onload = () => setBackgroundImage(img);
  }, [imageConfig.src]);

  // Calculate canvas dimensions from image aspect ratio and current size
  const canvasSize = useMemo(() => {
    if (!backgroundImage) return { width: size, height: size, scale: 1 };
    const imageAspect = backgroundImage.height / backgroundImage.width;
    let width: number;
    let height: number;

    if (imageAspect > 1) {
      height = size;
      width = size / imageAspect;
    } else {
      width = size;
      height = size * imageAspect;
    }

    return { width, height, scale: width / backgroundImage.width };
  }, [backgroundImage, size]);

  // Scale for positioning (image coordinates to canvas coordinates)
  const positionScale = canvasSize.scale;
  // Scale for visual elements (consistent across all images)
  const visualScale = canvasSize.width / 400;

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
    <div ref={containerRef} className="flex justify-center items-center w-full h-full">
      <Stage
        width={canvasSize.width}
        height={canvasSize.height}
        className="bg-white"
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

          {/* Elements - rendered in order: shading, points, arrows (arrows on top) */}
          {elements.filter((e) => e.type === 'shade').map(renderElement)}
          {elements.filter((e) => e.type === 'point').map(renderElement)}
          {elements.filter((e) => e.type === 'arrow').map(renderElement)}
        </Layer>
      </Stage>
    </div>
  );
}
