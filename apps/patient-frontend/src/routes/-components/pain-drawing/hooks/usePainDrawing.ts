import { useState, useCallback } from 'react';
import type {
  ImageId,
  DrawingElement,
  ImageDrawingData,
  PainDrawingData,
} from '../types';

const IMAGE_IDS: ImageId[] = [
  'mouth',
  'head-right',
  'head-left',
  'body-front',
  'body-back',
];

function createEmptyDrawings(): Record<ImageId, ImageDrawingData> {
  return IMAGE_IDS.reduce(
    (acc, id) => {
      acc[id] = { imageId: id, elements: [] };
      return acc;
    },
    {} as Record<ImageId, ImageDrawingData>
  );
}

export interface UsePainDrawingReturn {
  drawings: Record<ImageId, ImageDrawingData>;
  updateElements: (imageId: ImageId, elements: DrawingElement[]) => void;
  updatePngExport: (imageId: ImageId, pngExport: string) => void;
  getExportData: () => PainDrawingData;
  reset: () => void;
  hasAnyDrawing: boolean;
}

export function usePainDrawing(): UsePainDrawingReturn {
  const [drawings, setDrawings] = useState<Record<ImageId, ImageDrawingData>>(
    createEmptyDrawings
  );

  const updateElements = useCallback(
    (imageId: ImageId, elements: DrawingElement[]) => {
      setDrawings((prev) => ({
        ...prev,
        [imageId]: {
          ...prev[imageId],
          elements,
        },
      }));
    },
    []
  );

  const updatePngExport = useCallback(
    (imageId: ImageId, pngExport: string) => {
      setDrawings((prev) => ({
        ...prev,
        [imageId]: {
          ...prev[imageId],
          pngExport,
        },
      }));
    },
    []
  );

  const getExportData = useCallback((): PainDrawingData => {
    return {
      drawings,
      completedAt: new Date().toISOString(),
      version: '1.0',
    };
  }, [drawings]);

  const reset = useCallback(() => {
    setDrawings(createEmptyDrawings());
  }, []);

  const hasAnyDrawing = Object.values(drawings).some(
    (d) => d.elements.length > 0
  );

  return {
    drawings,
    updateElements,
    updatePngExport,
    getExportData,
    reset,
    hasAnyDrawing,
  };
}
