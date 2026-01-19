import { useState, useEffect } from 'react';
import { Stage, Layer, Line, Circle, Arrow, Image as KonvaImage } from 'react-konva';
import type { DrawingElement, ImageConfig } from './types';
import { DRAWING_STYLES } from './constants';

interface DrawingPreviewProps {
  imageConfig: ImageConfig;
  elements: DrawingElement[];
  size?: number;
}

export function DrawingPreview({
  imageConfig,
  elements,
  size = 150,
}: DrawingPreviewProps) {
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: size, height: size, scale: 1 });

  // Load background image
  useEffect(() => {
    const img = new window.Image();
    img.src = imageConfig.src;
    img.onload = () => {
      setBackgroundImage(img);
      // Calculate size to fit within square while maintaining aspect ratio
      const imageAspect = img.height / img.width;
      let width: number;
      let height: number;

      if (imageAspect > 1) {
        // Taller than wide - constrain by height
        height = size;
        width = size / imageAspect;
      } else {
        // Wider than tall - constrain by width
        width = size;
        height = size * imageAspect;
      }

      setCanvasSize({
        width,
        height,
        scale: width / img.width,
      });
    };
  }, [imageConfig.src, size]);

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
    <div className="flex justify-center items-center w-full h-full">
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
