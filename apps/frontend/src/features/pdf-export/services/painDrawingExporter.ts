/**
 * Pain Drawing Exporter
 *
 * Exports pain drawing canvases to base64 PNG images for PDF generation.
 * Uses Konva to render the drawings programmatically.
 */

import Konva from "konva";
import type {
  PainDrawingData,
  DrawingElement,
  ImageId,
  ImageConfig,
} from "@/features/pain-drawing-evaluation/types";
import {
  IMAGE_CONFIGS,
  REGION_ORDER,
  DRAWING_STYLES,
} from "@/features/pain-drawing-evaluation/constants";

/**
 * Export canvas dimensions for PDF (A4-friendly)
 */
const EXPORT_WIDTH = 400;

/**
 * Loads an image and returns a promise that resolves with the HTMLImageElement
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Renders a pain drawing region to a Konva stage and exports to base64 PNG.
 *
 * @param imageConfig - Configuration for the body region image
 * @param elements - Drawing elements (shadings, points, arrows)
 * @returns Promise resolving to base64 PNG data URL
 */
async function exportRegionToImage(
  imageConfig: ImageConfig,
  elements: DrawingElement[]
): Promise<string> {
  // Load the background image
  const backgroundImage = await loadImage(imageConfig.src);

  // Calculate dimensions maintaining aspect ratio
  const width = EXPORT_WIDTH;
  const height = width * imageConfig.aspectRatio;
  const scale = width / backgroundImage.width;
  const visualScale = width / 400; // Reference width for visual elements

  // Create a container div (required by Konva but won't be displayed)
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "-9999px";
  document.body.appendChild(container);

  try {
    // Create Konva stage
    const stage = new Konva.Stage({
      container,
      width,
      height,
    });

    // Create layer
    const layer = new Konva.Layer();
    stage.add(layer);

    // Add background image
    const konvaImage = new Konva.Image({
      image: backgroundImage,
      width,
      height,
      scaleX: imageConfig.mirror ? -1 : 1,
      x: imageConfig.mirror ? width : 0,
    });
    layer.add(konvaImage);

    // Render elements in order: shading, points, arrows
    const shadings = elements.filter((e) => e.type === "shade");
    const points = elements.filter((e) => e.type === "point");
    const arrows = elements.filter((e) => e.type === "arrow");

    // Add shadings
    for (const element of shadings) {
      if (element.type === "shade") {
        const line = new Konva.Line({
          points: element.points.map((p) => p * scale),
          stroke: DRAWING_STYLES.shade.stroke,
          strokeWidth: DRAWING_STYLES.shade.strokeWidth * visualScale,
          opacity: DRAWING_STYLES.shade.opacity,
          lineCap: DRAWING_STYLES.shade.lineCap,
          lineJoin: DRAWING_STYLES.shade.lineJoin,
          tension: DRAWING_STYLES.shade.tension,
        });
        layer.add(line);
      }
    }

    // Add points
    for (const element of points) {
      if (element.type === "point") {
        const circle = new Konva.Circle({
          x: element.x * scale,
          y: element.y * scale,
          radius: DRAWING_STYLES.point.radius * visualScale,
          fill: DRAWING_STYLES.point.fill,
        });
        layer.add(circle);
      }
    }

    // Add arrows
    for (const element of arrows) {
      if (element.type === "arrow") {
        const arrow = new Konva.Arrow({
          points: element.points.map((p) => p * scale),
          stroke: DRAWING_STYLES.arrow.stroke,
          strokeWidth: DRAWING_STYLES.arrow.strokeWidth * visualScale,
          fill: DRAWING_STYLES.arrow.fill,
          pointerLength: DRAWING_STYLES.arrow.pointerLength * visualScale,
          pointerWidth: DRAWING_STYLES.arrow.pointerWidth * visualScale,
        });
        layer.add(arrow);
      }
    }

    // Draw the layer
    layer.draw();

    // Export to data URL (PNG)
    const dataUrl = stage.toDataURL({
      mimeType: "image/png",
      pixelRatio: 2, // Higher resolution for PDF
    });

    // Cleanup
    stage.destroy();

    return dataUrl;
  } finally {
    // Always cleanup the container
    document.body.removeChild(container);
  }
}

/**
 * Exports all pain drawing regions to base64 PNG images.
 *
 * Only exports regions that have drawing elements.
 *
 * @param painDrawingData - Complete pain drawing data
 * @returns Promise resolving to a record of region ID -> base64 PNG
 */
export async function exportPainDrawingToImages(
  painDrawingData: PainDrawingData
): Promise<Record<ImageId, string>> {
  const images: Partial<Record<ImageId, string>> = {};

  // Export each region that has elements
  for (const regionId of REGION_ORDER) {
    const regionData = painDrawingData.drawings[regionId];
    const elements = regionData?.elements ?? [];

    // Only export if there are elements
    if (elements.length > 0) {
      const imageConfig = IMAGE_CONFIGS[regionId];
      try {
        const dataUrl = await exportRegionToImage(imageConfig, elements);
        images[regionId] = dataUrl;
      } catch (error) {
        console.error(`Failed to export pain drawing region ${regionId}:`, error);
        // Continue with other regions even if one fails
      }
    }
  }

  return images as Record<ImageId, string>;
}

/**
 * Exports a single pain drawing region to base64 PNG.
 *
 * @param regionId - The region to export
 * @param painDrawingData - Complete pain drawing data
 * @returns Promise resolving to base64 PNG data URL, or null if no elements
 */
export async function exportSingleRegion(
  regionId: ImageId,
  painDrawingData: PainDrawingData
): Promise<string | null> {
  const regionData = painDrawingData.drawings[regionId];
  const elements = regionData?.elements ?? [];

  if (elements.length === 0) {
    return null;
  }

  const imageConfig = IMAGE_CONFIGS[regionId];
  return exportRegionToImage(imageConfig, elements);
}
