/**
 * DiagnosisBlock — Full display for a single diagnosis evaluation result.
 *
 * Layout:
 * 1. Diagnosis title (heading)
 * 2. Head diagram pair (per-diagnosis)
 * 3. Overall status: dot + name + badge
 * 4. Anamnesis status badge
 * 5. Region × Side table with status badges
 */

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ALL_DIAGNOSES,
  REGIONS,
  SIDE_KEYS,
  SIDES,
  type CriterionStatus,
  type DiagnosisEvaluationResult,
  type Side,
} from "@cmdetect/dc-tmd";
import { SummaryDiagrams } from "./SummaryDiagrams";

const STATUS_CONFIG: Record<CriterionStatus, { label: string; badgeClass: string; dotClass: string }> = {
  positive: {
    label: "Positiv",
    badgeClass: "bg-blue-100 text-blue-800 border-blue-200",
    dotClass: "bg-blue-500",
  },
  negative: {
    label: "Negativ",
    badgeClass: "bg-gray-100 text-gray-600 border-gray-200",
    dotClass: "bg-gray-400",
  },
  pending: {
    label: "Ausstehend",
    badgeClass: "bg-yellow-100 text-yellow-800 border-yellow-200",
    dotClass: "border-2 border-yellow-500 bg-transparent",
  },
};

function StatusBadge({ status }: { status: CriterionStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={config.badgeClass}>
      {config.label}
    </Badge>
  );
}

interface DiagnosisBlockProps {
  result: DiagnosisEvaluationResult;
}

// Right side first
const SIDES_DISPLAY: Side[] = [...SIDE_KEYS].reverse() as Side[];

export function DiagnosisBlock({ result }: DiagnosisBlockProps) {
  const def = ALL_DIAGNOSES.find((d) => d.id === result.diagnosisId);
  const diagnosisName = def?.nameDE ?? result.diagnosisId;
  const regions = def?.examination.regions ?? [];
  const overallConfig = STATUS_CONFIG[result.status];

  return (
    <div className="space-y-3">
      {/* 1. Title */}
      <h3 className="text-base font-semibold">{diagnosisName}</h3>

      {/* 2. Head diagrams */}
      <div className="flex justify-center">
        <SummaryDiagrams results={[result]} regions={regions} />
      </div>

      {/* 3. Overall status */}
      <div className="flex items-center gap-2">
        <span
          className={`inline-block w-2.5 h-2.5 rounded-full shrink-0 ${overallConfig.dotClass}`}
        />
        <span className="text-sm font-medium">{diagnosisName}</span>
        <StatusBadge status={result.status} />
      </div>

      {/* 4. Anamnesis */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Anamnese:</span>
        <StatusBadge status={result.anamnesisStatus} />
      </div>

      {/* 5. Region × Side table */}
      {regions.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[140px]">Region</TableHead>
              {SIDES_DISPLAY.map((side) => (
                <TableHead key={side}>{SIDES[side]}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {regions.map((region) => (
              <TableRow key={region}>
                <TableCell className="font-medium">
                  {REGIONS[region] ?? region}
                </TableCell>
                {SIDES_DISPLAY.map((side) => {
                  const loc = result.locationResults.find(
                    (l) => l.side === side && l.region === region
                  );
                  return (
                    <TableCell key={side}>
                      {loc ? <StatusBadge status={loc.status} /> : "—"}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
