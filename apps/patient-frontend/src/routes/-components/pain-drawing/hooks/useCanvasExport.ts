import { useCallback } from 'react';
import type Konva from 'konva';

interface UseCanvasExportOptions {
  pixelRatio?: number;
  mimeType?: 'image/png' | 'image/jpeg';
  quality?: number;
}

export interface UseCanvasExportReturn {
  exportToDataUrl: (stage: Konva.Stage | null) => string | null;
  exportToBlob: (stage: Konva.Stage | null) => Promise<Blob | null>;
}

export function useCanvasExport(
  options: UseCanvasExportOptions = {}
): UseCanvasExportReturn {
  const {
    pixelRatio = 2,
    mimeType = 'image/png',
    quality = 0.92,
  } = options;

  const exportToDataUrl = useCallback(
    (stage: Konva.Stage | null): string | null => {
      if (!stage) return null;

      try {
        return stage.toDataURL({
          pixelRatio,
          mimeType,
          quality,
        });
      } catch (error) {
        console.error('Failed to export canvas:', error);
        return null;
      }
    },
    [mimeType, pixelRatio, quality]
  );

  const exportToBlob = useCallback(
    async (stage: Konva.Stage | null): Promise<Blob | null> => {
      if (!stage) return null;

      return new Promise((resolve) => {
        try {
          stage.toBlob({
            pixelRatio,
            mimeType,
            quality,
            callback: (blob) => {
              resolve(blob);
            },
          });
        } catch (error) {
          console.error('Failed to export canvas to blob:', error);
          resolve(null);
        }
      });
    },
    [mimeType, pixelRatio, quality]
  );

  return {
    exportToDataUrl,
    exportToBlob,
  };
}
