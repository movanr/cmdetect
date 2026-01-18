import { Button } from '@/components/ui/button';
import type { DrawingTool } from './types';
import { TOOL_LABELS } from './constants';
import { cn } from '@/lib/utils';

interface DrawingToolbarProps {
  activeTool: DrawingTool;
  onToolChange: (tool: DrawingTool) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const tools: DrawingTool[] = ['shade', 'point', 'arrow'];

export function DrawingToolbar({
  activeTool,
  onToolChange,
  onUndo,
  onRedo,
  onClear,
  canUndo,
  canRedo,
}: DrawingToolbarProps) {
  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Drawing tools */}
      <div className="flex gap-2 justify-center flex-wrap">
        {tools.map((tool) => (
          <Button
            key={tool}
            variant={activeTool === tool ? 'default' : 'outline'}
            size="sm"
            onClick={() => onToolChange(tool)}
            className={cn(
              'min-w-[80px]',
              activeTool === tool && 'ring-2 ring-primary ring-offset-2'
            )}
          >
            <ToolIcon tool={tool} />
            {TOOL_LABELS[tool]}
          </Button>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={onUndo}
          disabled={!canUndo}
        >
          <UndoIcon />
          {TOOL_LABELS.undo}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onRedo}
          disabled={!canRedo}
        >
          <RedoIcon />
          {TOOL_LABELS.redo}
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={onClear}
        >
          <TrashIcon />
          {TOOL_LABELS.clear}
        </Button>
      </div>
    </div>
  );
}

function ToolIcon({ tool }: { tool: DrawingTool }) {
  switch (tool) {
    case 'shade':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 19l7-7 3 3-7 7-3-3z" />
          <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
          <path d="M2 2l7.586 7.586" />
          <circle cx="11" cy="11" r="2" />
        </svg>
      );
    case 'point':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="currentColor"
          stroke="none"
        >
          <circle cx="12" cy="12" r="6" />
        </svg>
      );
    case 'arrow':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      );
  }
}

function UndoIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 7v6h6" />
      <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
    </svg>
  );
}

function RedoIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 7v6h-6" />
      <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}
