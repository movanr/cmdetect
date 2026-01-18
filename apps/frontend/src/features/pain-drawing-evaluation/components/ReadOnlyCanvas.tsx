import { useRef, useState, useEffect, useCallback } from "react";
import {
  Stage,
  Layer,
  Line,
  Circle,
  Arrow,
  Image as KonvaImage,
} from "react-konva";
import type { DrawingElement, ImageConfig, CanvasSize } from "../types";
import { DRAWING_STYLES, CANVAS_CONFIG } from "../constants";

interface ReadOnlyCanvasProps {
  imageConfig: ImageConfig;
  elements: DrawingElement[];
  maxWidth?: number;
  className?: string;
}

/**
 * Read-only canvas component for displaying pain drawings
 * Renders background image and drawing elements without any interaction handlers
 */
export function ReadOnlyCanvas({
  imageConfig,
  elements,
  maxWidth = CANVAS_CONFIG.maxWidth,
  className = "",
}: ReadOnlyCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [canvasSize, setCanvasSize] = useState<CanvasSize>({
    width: maxWidth,
    height: maxWidth * imageConfig.aspectRatio,
    scale: 1,
  });

  const [backgroundImage, setBackgroundImage] =
    useState<HTMLImageElement | null>(null);

  // Calculate canvas size to fit container while maintaining aspect ratio
  const calculateSize = useCallback(
    (containerWidth: number, imgWidth: number, imgHeight: number) => {
      const imageAspect = imgHeight / imgWidth;
      const width = Math.min(
        Math.max(containerWidth, CANVAS_CONFIG.minWidth),
        maxWidth
      );
      const height = width * imageAspect;

      return {
        width,
        height,
        scale: width / imgWidth,
      };
    },
    [maxWidth]
  );

  // Load background image
  useEffect(() => {
    const img = new window.Image();
    img.src = imageConfig.src;
    img.onload = () => {
      setBackgroundImage(img);
      if (containerRef.current) {
        const { offsetWidth } = containerRef.current;
        setCanvasSize(calculateSize(offsetWidth, img.width, img.height));
      }
    };
  }, [imageConfig.src, calculateSize]);

  // Handle responsive sizing
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: containerWidth } = entry.contentRect;
        const imgWidth = backgroundImage?.width ?? 100;
        const imgHeight =
          backgroundImage?.height ?? imgWidth * imageConfig.aspectRatio;
        setCanvasSize(calculateSize(containerWidth, imgWidth, imgHeight));
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [backgroundImage, imageConfig.aspectRatio, calculateSize]);

  // Scale for positioning (image coordinates to canvas coordinates)
  const positionScale = canvasSize.scale;
  // Scale for visual elements (consistent across all images, based on canvas width)
  const visualScale = canvasSize.width / 400; // 400px as reference width

  const renderElement = (element: DrawingElement) => {
    switch (element.type) {
      case "shade":
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
      case "point":
        return (
          <Circle
            key={element.id}
            x={element.x * positionScale}
            y={element.y * positionScale}
            radius={DRAWING_STYLES.point.radius * visualScale}
            fill={DRAWING_STYLES.point.fill}
          />
        );
      case "arrow":
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
      className={`flex justify-center items-center ${className}`}
      style={{ minHeight: canvasSize.height }}
    >
      <Stage
        width={canvasSize.width}
        height={canvasSize.height}
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
          {elements.filter((e) => e.type === "shade").map(renderElement)}
          {elements.filter((e) => e.type === "point").map(renderElement)}
          {elements.filter((e) => e.type === "arrow").map(renderElement)}
        </Layer>
      </Stage>
    </div>
  );
}
