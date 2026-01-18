import { Check, Minus } from "lucide-react";
import { IMAGE_CONFIGS, CANVAS_CONFIG } from "../constants";
import type { DrawingElement, ImageId } from "../types";
import { ReadOnlyCanvas } from "./ReadOnlyCanvas";

interface RegionThumbnailProps {
  imageId: ImageId;
  elements: DrawingElement[];
  isSelected?: boolean;
  onClick?: () => void;
}

/**
 * Small thumbnail card showing a body region with drawing preview
 * Shows checkmark badge if region has drawings, dash if empty
 */
export function RegionThumbnail({
  imageId,
  elements,
  isSelected = false,
  onClick,
}: RegionThumbnailProps) {
  const config = IMAGE_CONFIGS[imageId];
  const hasDrawings = elements.length > 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        relative flex flex-col items-center p-2 rounded-lg border-2 transition-all
        ${isSelected ? "border-primary bg-primary/5" : "border-transparent bg-muted/30"}
        ${onClick ? "cursor-pointer hover:border-primary/50 hover:bg-muted/50" : "cursor-default"}
      `}
    >
      {/* Thumbnail canvas */}
      <div className="w-full overflow-hidden rounded">
        <ReadOnlyCanvas
          imageConfig={config}
          elements={elements}
          maxWidth={CANVAS_CONFIG.thumbnailWidth}
          className="pointer-events-none"
        />
      </div>

      {/* Region label */}
      <span className="mt-1.5 text-xs font-medium text-center">
        {config.labelDe}
      </span>

      {/* Status badge */}
      <div
        className={`
          absolute -top-1 -right-1 size-5 rounded-full flex items-center justify-center
          ${hasDrawings ? "bg-red-500 text-white" : "bg-gray-300 text-gray-600"}
        `}
      >
        {hasDrawings ? (
          <Check className="size-3" strokeWidth={3} />
        ) : (
          <Minus className="size-3" strokeWidth={3} />
        )}
      </div>
    </button>
  );
}
