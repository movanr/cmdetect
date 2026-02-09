/**
 * RegionDiagnosisList — Decision tree types applicable to the selected region.
 *
 * Shows a list of clickable rows, one per tree type (e.g. "Myalgie",
 * "Myalgie-Subtypen", "Arthralgie").
 */

import { cn } from "@/lib/utils";

interface TreeTypeEntry {
  id: string;
  label: string;
}

interface RegionDiagnosisListProps {
  treeTypes: readonly TreeTypeEntry[];
  selectedTree: string | null;
  onTreeSelect: (id: string) => void;
}

export function RegionDiagnosisList({
  treeTypes,
  selectedTree,
  onTreeSelect,
}: RegionDiagnosisListProps) {
  if (treeTypes.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Keine Entscheidungsbäume für diese Region
      </p>
    );
  }

  return (
    <div className="space-y-1">
      {treeTypes.map((t) => {
        const isSelected = selectedTree === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onTreeSelect(t.id)}
            className={cn(
              "flex items-center gap-2 w-full text-left text-sm px-3 py-2 rounded-md transition-colors",
              isSelected
                ? "bg-accent"
                : "hover:bg-muted"
            )}
          >
            <span className="min-w-0">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
