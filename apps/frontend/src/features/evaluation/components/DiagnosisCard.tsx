/**
 * DiagnosisCard — Displays the evaluation result for a single diagnosis.
 *
 * Shows overall status, anamnesis result, and per-location breakdown.
 * Subtypes (local myalgia, spreading, referral) are visually indented.
 */

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  MYALGIA_SUBTYPE_IDS,
  SIDES,
  REGIONS,
  type DiagnosisEvaluationResult,
  type CriterionStatus,
  type Side,
} from "@cmdetect/dc-tmd";

interface DiagnosisCardProps {
  result: DiagnosisEvaluationResult;
}

const STATUS_CONFIG: Record<CriterionStatus, { label: string; className: string }> = {
  positive: {
    label: "Positiv",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  negative: {
    label: "Negativ",
    className: "bg-gray-100 text-gray-600 border-gray-200",
  },
  pending: {
    label: "Ausstehend",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
};

/** German diagnosis names by ID */
const DIAGNOSIS_NAMES: Record<string, string> = {
  myalgia: "Myalgie",
  localMyalgia: "Lokale Myalgie",
  myofascialPainWithSpreading: "Myofaszialer Schmerz mit Ausbreitung",
  myofascialPainWithReferral: "Myofaszialer Schmerz mit Übertragung",
};

function StatusBadge({ status }: { status: CriterionStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}

export function DiagnosisCard({ result }: DiagnosisCardProps) {
  const isSubtype = MYALGIA_SUBTYPE_IDS.includes(result.diagnosisId);
  const diagnosisName = DIAGNOSIS_NAMES[result.diagnosisId] ?? result.diagnosisId;

  // Get unique regions from location results
  const regions = [...new Set(result.locationResults.map((l) => l.region))];
  const sides: Side[] = ["left", "right"];

  return (
    <Card className={isSubtype ? "ml-6 border-dashed" : ""}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{diagnosisName}</CardTitle>
          <StatusBadge status={result.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Anamnesis status */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Anamnese:</span>
          <StatusBadge status={result.anamnesisStatus} />
        </div>

        {/* Location breakdown table */}
        {regions.length > 0 && (
          <div>
            <div className="text-sm text-muted-foreground mb-2">
              Untersuchungsbefunde nach Lokalisation:
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[140px]">Region</TableHead>
                  {sides.map((side) => (
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
                    {sides.map((side) => {
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
          </div>
        )}

        {/* Positive locations summary */}
        {result.positiveLocations.length > 0 && (
          <div className="text-sm">
            <span className="text-muted-foreground">Positive Lokalisationen: </span>
            {result.positiveLocations
              .map(
                (loc) =>
                  `${REGIONS[loc.region] ?? loc.region} (${SIDES[loc.side]})`
              )
              .join(", ")}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
