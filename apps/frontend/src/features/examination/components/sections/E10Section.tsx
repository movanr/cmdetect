import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  E10_PAIN_QUESTIONS,
  E10_SITE_KEYS,
  PALPATION_SITES,
  SECTIONS,
} from "@cmdetect/dc-tmd";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { useState, useCallback, useMemo } from "react";
import type { FieldPath, FieldValues } from "react-hook-form";
import { useFormContext } from "react-hook-form";
import {
  clearInstanceErrors,
  setInstanceValue,
} from "../../form/form-helpers";
import { useExaminationForm, type FormValues } from "../../form/use-examination-form";
import { getPainTypeLabel, getSectionCardTitle } from "../../labels";
import type { PainType, PalpationSite, Side } from "../../model/regions";
import type { QuestionInstance } from "../../projections/to-instances";
import { YesNoField } from "../inputs/YesNoField";
import { SectionFooter } from "../ui";
import { SectionCommentButton } from "../ui/SectionCommentButton";
import type { SectionProps } from "./types";

// =============================================================================
// Props
// =============================================================================

interface E10SectionProps extends SectionProps {
  isLastSection?: boolean;
}

// =============================================================================
// E10 Palpation Table (one side)
// =============================================================================

interface E10SideTableProps {
  side: Side;
  instances: QuestionInstance[];
  refused: boolean;
  hasValidated: boolean;
}

function E10SideTable({ side, instances, refused, hasValidated }: E10SideTableProps) {
  const { watch } = useFormContext<FormValues>();
  const sideLabel = side === "right" ? "Rechte Seite" : "Linke Seite";

  // Watch all instance paths to trigger re-renders
  const watchPaths = instances.map((i) => i.path);
  watch(watchPaths);

  // Build a lookup: site → painType → instance
  const instanceMap = useMemo(() => {
    const map = new Map<string, Map<string, QuestionInstance>>();
    for (const inst of instances) {
      const site = inst.context.site;
      const painType = inst.context.painType;
      if (!site || !painType) continue;
      if (!map.has(site)) map.set(site, new Map());
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      map.get(site)!.set(painType, inst);
    }
    return map;
  }, [instances]);

  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-muted/50">
            <th className="text-left text-sm font-medium p-3">{sideLabel}</th>
            {E10_PAIN_QUESTIONS.map((q) => (
              <th key={q} className="text-center text-xs font-medium p-2 w-24">
                {getPainTypeLabel(q as PainType)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {E10_SITE_KEYS.map((site) => {
            const siteInstances = instanceMap.get(site);
            const painInstance = siteInstances?.get("pain");
            const painValue = painInstance
              ? (watch(painInstance.path as FieldPath<FormValues>) as unknown as string | null)
              : null;
            const isPainPositive = painValue === "yes";

            // Check completeness for validation styling
            const isIncomplete =
              hasValidated &&
              !refused &&
              (painValue === null ||
                painValue === undefined ||
                (isPainPositive &&
                  E10_PAIN_QUESTIONS.filter((q) => q !== "pain").some((q) => {
                    const inst = siteInstances?.get(q);
                    if (!inst) return true;
                    const val = watch(inst.path as FieldPath<FormValues>) as unknown as string | null;
                    return val === null || val === undefined;
                  })));

            return (
              <tr
                key={site}
                className={cn(
                  "border-t",
                  isIncomplete && "bg-destructive/10",
                  refused && "opacity-40"
                )}
              >
                <td
                  className={cn(
                    "p-3 text-sm font-medium",
                    refused && "text-muted-foreground"
                  )}
                >
                  {PALPATION_SITES[site as PalpationSite]}
                </td>
                {E10_PAIN_QUESTIONS.map((q) => {
                  const instance = siteInstances?.get(q);
                  if (!instance) return <td key={q} className="p-2" />;

                  const enabled = !refused && (q === "pain" || isPainPositive);

                  return (
                    <td key={q} className="p-2 text-center">
                      <div className="flex justify-center">
                        <YesNoField
                          name={instance.path as FieldPath<FieldValues>}
                          disabled={!enabled}
                        />
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// =============================================================================
// E10Section Main Component
// =============================================================================

export function E10Section({
  onComplete,
  onBack,
  isFirstSection,
  isLastSection = true,
}: E10SectionProps) {
  const { getInstancesForStep } = useExaminationForm();
  const { setValue, getValues, clearErrors } = useFormContext<FormValues>();

  const rightInstances = getInstancesForStep("e10-right");
  const leftInstances = getInstancesForStep("e10-left");

  const [hasValidated, setHasValidated] = useState(false);

  // Per-side refusal state (local state, form data cleared when refused)
  const [sideRefusals, setSideRefusals] = useState<{ right: boolean; left: boolean }>({
    right: false,
    left: false,
  });
  const rightRefused = sideRefusals.right;
  const leftRefused = sideRefusals.left;

  // Handle refusal toggle
  const handleRefusalChange = useCallback(
    (side: Side, refused: boolean) => {
      setSideRefusals((prev) => ({ ...prev, [side]: refused }));
      if (refused) {
        const sideInstances = side === "right" ? rightInstances : leftInstances;
        for (const inst of sideInstances) {
          if (inst.renderType === "yesNo") {
            setInstanceValue(setValue, inst.path, null);
            clearInstanceErrors(clearErrors, inst.path);
          }
        }
      }
    },
    [rightInstances, leftInstances, setValue, clearErrors]
  );

  // Validate all E10 data
  const validateAllE10 = useCallback((): boolean => {
    if (rightRefused && leftRefused) return true;

    for (const side of ["right", "left"] as Side[]) {
      const isRefused = side === "right" ? rightRefused : leftRefused;
      if (isRefused) continue;

      for (const site of E10_SITE_KEYS) {
        const painPath = `e10.${side}.${site}.pain` as FieldPath<FormValues>;
        const painVal = getValues(painPath) as unknown as string | null;
        if (painVal === null || painVal === undefined) return false;

        if (painVal === "yes") {
          for (const q of E10_PAIN_QUESTIONS) {
            if (q === "pain") continue;
            const qPath = `e10.${side}.${site}.${q}` as FieldPath<FormValues>;
            const qVal = getValues(qPath) as unknown as string | null;
            if (qVal === null || qVal === undefined) return false;
          }
        }
      }
    }
    return true;
  }, [getValues, rightRefused, leftRefused]);

  const handleNext = () => {
    setHasValidated(true);
    if (validateAllE10()) {
      onComplete?.();
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{getSectionCardTitle(SECTIONS.e10)}</CardTitle>
          <div className="flex items-center gap-1">
            <SectionCommentButton sectionId="e10" />
            <Button variant="ghost" size="sm" asChild>
              <Link to="/protocol/$section" params={{ section: "e10" }}>
                <BookOpen className="h-4 w-4 mr-1" />
                Protokoll
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-sm text-muted-foreground">
          <Badge variant="outline" className="mr-2">0,5 kg</Badge>
          Alle Palpationsstellen werden mit 0,5 kg Druck untersucht.
        </div>

        {/* Bilateral tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Right side */}
          <div className="space-y-3">
            <E10SideTable
              side="right"
              instances={rightInstances}
              refused={rightRefused}
              hasValidated={hasValidated}
            />
            <div className="flex items-center gap-2">
              <Checkbox
                id="e10-right-refused"
                checked={rightRefused}
                onCheckedChange={(checked) =>
                  handleRefusalChange("right", checked === true)
                }
              />
              <label
                htmlFor="e10-right-refused"
                className="text-sm text-muted-foreground cursor-pointer select-none"
              >
                Rechte Seite verweigert
              </label>
            </div>
          </div>

          {/* Left side */}
          <div className="space-y-3">
            <E10SideTable
              side="left"
              instances={leftInstances}
              refused={leftRefused}
              hasValidated={hasValidated}
            />
            <div className="flex items-center gap-2">
              <Checkbox
                id="e10-left-refused"
                checked={leftRefused}
                onCheckedChange={(checked) =>
                  handleRefusalChange("left", checked === true)
                }
              />
              <label
                htmlFor="e10-left-refused"
                className="text-sm text-muted-foreground cursor-pointer select-none"
              >
                Linke Seite verweigert
              </label>
            </div>
          </div>
        </div>
      </CardContent>

      <SectionFooter
        onNext={handleNext}
        onSkipConfirm={onComplete}
        onBack={onBack}
        isFirstStep={isFirstSection}
        isLastSection={isLastSection}
        directSkipLabel="Abschnitt überspringen"
      />
    </Card>
  );
}
