import { IMAGE_CONFIGS, CANVAS_CONFIG } from "../constants";
import type { DrawingElement, ImageId } from "../types";
import { ReadOnlyCanvas } from "./ReadOnlyCanvas";

interface RegionThumbnailProps {
  imageId: ImageId;
  elements: DrawingElement[];
  isSelected?: boolean;
  onClick?: () => void;
}

/** Small thumbnail card showing a body region with drawing preview. */
export function RegionThumbnail({
  imageId,
  elements,
  isSelected = false,
  onClick,
}: RegionThumbnailProps) {
  const config = IMAGE_CONFIGS[imageId];

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
      <div className="w-full overflow-hidden rounded">
        <ReadOnlyCanvas
          imageConfig={config}
          elements={elements}
          maxWidth={CANVAS_CONFIG.thumbnailWidth}
          className="pointer-events-none"
        />
      </div>
      <span className="mt-1.5 text-xs font-medium text-center">{config.label}</span>
    </button>
  );
}
