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
  E10_PAIN_QUESTIONS,
  E10_SITE_KEYS,
  PAIN_TYPES,
  PALPATION_SITES,
  type PalpationSite,
  type Side,
} from "@cmdetect/dc-tmd";
import { useFormContext } from "react-hook-form";
import type { FormValues } from "../../form/use-examination-form";
import { SummarySection } from "./SummarySection";

export function E10Summary() {
  const { getValues } = useFormContext<FormValues>();

  return (
    <SummarySection sectionId="e10">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[220px]">Palpationsstelle</TableHead>
            {E10_PAIN_QUESTIONS.map((q) => (
              <TableHead key={q} colSpan={2} className="text-center whitespace-normal">
                {PAIN_TYPES[q]}
              </TableHead>
            ))}
          </TableRow>
          <TableRow>
            <TableHead />
            {E10_PAIN_QUESTIONS.map((q) => (
              <SubHeaders key={q} />
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {E10_SITE_KEYS.map((site) => (
            <SiteRow key={site} site={site} getValues={getValues} />
          ))}
        </TableBody>
      </Table>
    </SummarySection>
  );
}

function SubHeaders() {
  return (
    <>
      <TableHead className="text-center w-[40px]">R</TableHead>
      <TableHead className="text-center w-[40px]">L</TableHead>
    </>
  );
}

function SiteRow({
  site,
  getValues,
}: {
  site: PalpationSite;
  getValues: (path: string) => unknown;
}) {
  return (
    <TableRow>
      <TableCell className="font-medium">{PALPATION_SITES[site]}</TableCell>
      {E10_PAIN_QUESTIONS.map((q) => (
        <PainCells key={q} site={site} painQuestion={q} getValues={getValues} />
      ))}
    </TableRow>
  );
}

function PainCells({
  site,
  painQuestion,
  getValues,
}: {
  site: PalpationSite;
  painQuestion: string;
  getValues: (path: string) => unknown;
}) {
  const sides: Side[] = ["right", "left"];

  return (
    <>
      {sides.map((side) => {
        const refused = getValues(`e10.${side}.refused`) as boolean | null;

        if (refused) {
          return (
            <TableCell key={side} className="text-center">
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                RF
              </Badge>
            </TableCell>
          );
        }

        const path = `e10.${side}.${site}.${painQuestion}`;
        const value = getValues(path) as string | null | undefined;

        if (value == null) {
          return (
            <TableCell key={side} className="text-center text-muted-foreground">
              —
            </TableCell>
          );
        }

        if (value === "yes") {
          return (
            <TableCell key={side} className="text-center font-medium">
              Ja
            </TableCell>
          );
        }

        return (
          <TableCell key={side} className="text-center text-muted-foreground">
            Nein
          </TableCell>
        );
      })}
    </>
  );
}
