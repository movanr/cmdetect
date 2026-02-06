import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PALPATION_MODE_QUESTIONS,
  PALPATION_MODES,
  PALPATION_SITE_KEYS,
  PALPATION_SITES,
  PAIN_TYPES,
  SITE_CONFIG,
  type PalpationMode,
  type PalpationPainQuestion,
  type PalpationSite,
  type Side,
} from "@cmdetect/dc-tmd";
import { useFormContext } from "react-hook-form";
import type { FormValues } from "../../form/use-examination-form";
import { SummarySection } from "./SummarySection";

export function E9Summary() {
  const { getValues } = useFormContext<FormValues>();

  const palpationMode = getValues("e9.palpationMode") as PalpationMode | null;
  const activeQuestions = palpationMode
    ? PALPATION_MODE_QUESTIONS[palpationMode]
    : PALPATION_MODE_QUESTIONS.standard;

  const modeLabel = palpationMode ? PALPATION_MODES[palpationMode] : "—";

  return (
    <SummarySection sectionId="e9">
      <div className="space-y-4">
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
          <dt className="font-medium text-muted-foreground">Palpationsmodus</dt>
          <dd>{modeLabel}</dd>
        </dl>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[220px]">Palpationsstelle</TableHead>
              {activeQuestions.map((q) => (
                <TableHead key={q} colSpan={2} className="text-center whitespace-normal">
                  {PAIN_TYPES[q]}
                </TableHead>
              ))}
            </TableRow>
            <TableRow>
              <TableHead />
              {activeQuestions.map((q) => (
                <SubHeaders key={q} />
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {PALPATION_SITE_KEYS.map((site) => (
              <PalpationSiteRow
                key={site}
                site={site}
                activeQuestions={activeQuestions}
                getValues={getValues}
              />
            ))}
          </TableBody>
        </Table>
      </div>
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

function PalpationSiteRow({
  site,
  activeQuestions,
  getValues,
}: {
  site: PalpationSite;
  activeQuestions: readonly PalpationPainQuestion[];
  getValues: (path: string) => unknown;
}) {
  const siteConfig = SITE_CONFIG[site];

  return (
    <TableRow>
      <TableCell className="font-medium">{PALPATION_SITES[site]}</TableCell>
      {activeQuestions.map((q) => {
        // Check if this question applies to this site
        const isApplicable =
          q === "pain" ||
          q === "familiarPain" ||
          (q === "familiarHeadache" && siteConfig.hasHeadache) ||
          (q === "spreadingPain" && siteConfig.hasSpreading) ||
          q === "referredPain";

        return (
          <PainCells
            key={q}
            site={site}
            painQuestion={q}
            isApplicable={isApplicable}
            getValues={getValues}
          />
        );
      })}
    </TableRow>
  );
}

function PainCells({
  site,
  painQuestion,
  isApplicable,
  getValues,
}: {
  site: PalpationSite;
  painQuestion: PalpationPainQuestion;
  isApplicable: boolean;
  getValues: (path: string) => unknown;
}) {
  const sides: Side[] = ["right", "left"];

  return (
    <>
      {sides.map((side) => {
        if (!isApplicable) {
          return (
            <TableCell key={side} className="text-center text-muted-foreground">
              —
            </TableCell>
          );
        }

        const path = `e9.${side}.${site}.${painQuestion}`;
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
