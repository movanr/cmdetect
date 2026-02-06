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
  REGIONS,
  REGION_KEYS,
  getMovementPainQuestions,
  type PainType,
  type Region,
  type Side,
} from "@cmdetect/dc-tmd";
import { formatMeasurement } from "./summary-helpers";

export interface MovementGroup {
  label: string;
  movementKey: string;
  sectionPrefix: string;
  measurement: number | null | undefined;
  refused: boolean;
  terminated?: boolean;
  interviewRefused?: boolean;
  hasPainInterview: boolean;
  painTypes: readonly PainType[];
  regions: readonly Region[];
  getValue: (path: string) => unknown;
}

const PAIN_TYPE_HEADERS: Record<PainType, string> = {
  pain: "Schmerz",
  familiarPain: "Bek. Schmerz",
  familiarHeadache: "Bek. Kopfschmerz",
  referredPain: "Übertr. Schmerz",
  spreadingPain: "Ausbr. Schmerz",
};

export function MovementPainTable({ groups }: { groups: MovementGroup[] }) {
  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <MovementGroupDisplay key={group.movementKey} group={group} />
      ))}
    </div>
  );
}

function MovementGroupDisplay({ group }: { group: MovementGroup }) {
  const fmt = formatMeasurement(group.measurement, group.refused, group.terminated);

  return (
    <div className="space-y-2">
      {/* Movement header: label + measurement */}
      <div className="flex items-baseline gap-3 text-sm">
        <span className="font-medium">{group.label}:</span>
        {fmt.variant === "refused" ? (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            RF
          </Badge>
        ) : fmt.variant === "empty" ? (
          <span className="text-muted-foreground">{fmt.text}</span>
        ) : (
          <span>{fmt.text}</span>
        )}
      </div>

      {/* Pain interview table */}
      {group.hasPainInterview && !group.refused && (
        <PainInterviewTable group={group} />
      )}
    </div>
  );
}

function PainInterviewTable({ group }: { group: MovementGroup }) {
  const { painTypes, interviewRefused } = group;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Region</TableHead>
          {painTypes.map((pt) => (
            <TableHead key={pt} colSpan={2} className="text-center whitespace-normal">
              {PAIN_TYPE_HEADERS[pt]}
            </TableHead>
          ))}
        </TableRow>
        <TableRow>
          <TableHead />
          {painTypes.map((pt) => (
            <SideSubHeaders key={pt} />
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {REGION_KEYS.map((region) => (
          <RegionRow
            key={region}
            region={region}
            painTypes={painTypes}
            interviewRefused={interviewRefused}
            sectionPrefix={group.sectionPrefix}
            movementKey={group.movementKey}
            getValue={group.getValue}
          />
        ))}
      </TableBody>
    </Table>
  );
}

function SideSubHeaders() {
  return (
    <>
      <TableHead className="text-center w-[40px]">R</TableHead>
      <TableHead className="text-center w-[40px]">L</TableHead>
    </>
  );
}

function RegionRow({
  region,
  painTypes,
  interviewRefused,
  sectionPrefix,
  movementKey,
  getValue,
}: {
  region: Region;
  painTypes: readonly PainType[];
  interviewRefused?: boolean;
  sectionPrefix: string;
  movementKey: string;
  getValue: (path: string) => unknown;
}) {
  const applicableQuestions = getMovementPainQuestions(region);
  const sides: Side[] = ["right", "left"];

  return (
    <TableRow>
      <TableCell className="font-medium whitespace-normal">{REGIONS[region]}</TableCell>
      {painTypes.map((pt) => {
        const isApplicable = (applicableQuestions as readonly string[]).includes(pt);

        return sides.map((side) => {
          if (!isApplicable) {
            return (
              <TableCell key={`${pt}-${side}`} className="text-center text-muted-foreground">
                —
              </TableCell>
            );
          }

          if (interviewRefused) {
            return (
              <TableCell key={`${pt}-${side}`} className="text-center">
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  RF
                </Badge>
              </TableCell>
            );
          }

          const path = `${sectionPrefix}.${movementKey}.${side}.${region}.${pt}`;
          const value = getValue(path) as string | null | undefined;

          if (value == null) {
            return (
              <TableCell key={`${pt}-${side}`} className="text-center text-muted-foreground">
                —
              </TableCell>
            );
          }

          return (
            <TableCell
              key={`${pt}-${side}`}
              className={`text-center ${value === "yes" ? "font-medium" : "text-muted-foreground"}`}
            >
              {value === "yes" ? "Ja" : "Nein"}
            </TableCell>
          );
        });
      })}
    </TableRow>
  );
}
