/**
 * DiagnosisSelector — Cascading selection for diagnosis → side → region/site.
 *
 * - Diagnosis: required grouped select
 * - Side: optional toggle (enables region picker)
 * - Region/site: optional toggle, disabled until side is picked.
 *   For base regions (temporalis, masseter) shows the region name.
 *   For supplemental regions (otherMast, nonMast) shows actual E10 palpation sites.
 */

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import {
  ALL_DIAGNOSES,
  E10_SITE_KEYS,
  PALPATION_SITES,
  REGIONS,
  SITE_CONFIG,
  type DiagnosisDefinition,
  type DiagnosisId,
  type PalpationSite,
  type Region,
  type Side,
} from "@cmdetect/dc-tmd";
import { useMemo } from "react";

export interface DiagnosisSelection {
  diagnosisId: DiagnosisId;
  side: Side;
  region: Region;
  site: PalpationSite | null;
}

interface DiagnosisSelectorProps {
  diagnosisId: DiagnosisId | null;
  side: Side | null;
  region: Region | null;
  site: PalpationSite | null;
  onChange: (selection: Partial<DiagnosisSelection>) => void;
}

const GROUPED = {
  pain: ALL_DIAGNOSES.filter((d) => d.category === "pain"),
  joint: ALL_DIAGNOSES.filter((d) => d.category === "joint"),
};

/** Regions that are replaced by specific E10 palpation sites in the picker */
const SUPPLEMENTAL_REGIONS = new Set<Region>(["otherMast", "nonMast"]);

/** Active toggle style — primary color for clear selection feedback */
const TOGGLE_ACTIVE =
  "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:border-primary";

function getDiagnosis(id: DiagnosisId): DiagnosisDefinition | undefined {
  return ALL_DIAGNOSES.find((d) => d.id === id);
}

/** Build the toggle items for a diagnosis's location picker. */
function buildLocationOptions(regions: readonly Region[]) {
  const items: { value: string; label: string }[] = [];
  const addedE10 = new Set<string>();

  for (const r of regions) {
    if (SUPPLEMENTAL_REGIONS.has(r)) {
      for (const siteKey of E10_SITE_KEYS) {
        if (SITE_CONFIG[siteKey].region === r && !addedE10.has(siteKey)) {
          addedE10.add(siteKey);
          items.push({ value: siteKey, label: PALPATION_SITES[siteKey] });
        }
      }
    } else {
      items.push({ value: r, label: REGIONS[r] });
    }
  }

  return items;
}

export function DiagnosisSelector({
  diagnosisId,
  side,
  region,
  site,
  onChange,
}: DiagnosisSelectorProps) {
  const diagnosis = diagnosisId ? getDiagnosis(diagnosisId) : undefined;
  const regions = diagnosis?.examination.regions ?? [];

  const locationOptions = useMemo(
    () => (regions.length > 1 ? buildLocationOptions(regions) : []),
    [regions],
  );
  const needsLocationPicker = locationOptions.length > 1;

  // The toggle value: use site key if an E10 site is selected, otherwise region
  const locationValue = site ?? region ?? "";

  // When diagnosis changes, auto-select region if only one option
  const handleDiagnosisChange = useMemo(
    () => (id: string) => {
      const next = getDiagnosis(id as DiagnosisId);
      if (!next) return;
      const nextRegions = next.examination.regions;
      onChange({
        diagnosisId: id as DiagnosisId,
        region: nextRegions.length === 1 ? nextRegions[0] : undefined,
        site: null,
      });
    },
    [onChange],
  );

  function handleLocationChange(value: string) {
    if (!value) return;
    if ((E10_SITE_KEYS as readonly string[]).includes(value)) {
      const siteKey = value as PalpationSite;
      onChange({ region: SITE_CONFIG[siteKey].region, site: siteKey });
    } else {
      onChange({ region: value as Region, site: null });
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Diagnosis select */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Diagnose</label>
        <Select value={diagnosisId ?? ""} onValueChange={handleDiagnosisChange}>
          <SelectTrigger className="w-auto min-w-[280px]">
            <SelectValue placeholder="Diagnose wählen..." />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Schmerzerkrankungen</SelectLabel>
              {GROUPED.pain.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.nameDE}
                </SelectItem>
              ))}
            </SelectGroup>
            <SelectGroup>
              <SelectLabel>Gelenkerkrankungen</SelectLabel>
              {GROUPED.joint.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.nameDE}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Side toggle */}
      {diagnosisId && (
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Seite</label>
          <ToggleGroup
            type="single"
            value={side ?? ""}
            onValueChange={(v) => {
            if (v) onChange({ side: v as Side });
          }}
            variant="outline"
          >
            <ToggleGroupItem value="right" className={cn("text-sm", TOGGLE_ACTIVE)}>
              Rechts
            </ToggleGroupItem>
            <ToggleGroupItem value="left" className={cn("text-sm", TOGGLE_ACTIVE)}>
              Links
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      )}

      {/* Location toggle — regions + E10 sites, disabled until side is picked */}
      {diagnosisId && needsLocationPicker && (
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Lokalisation
          </label>
          <ToggleGroup
            type="single"
            value={locationValue}
            onValueChange={handleLocationChange}
            variant="outline"
            className="flex-wrap"
            disabled={!side}
          >
            {locationOptions.map((opt) => (
              <ToggleGroupItem key={opt.value} value={opt.value} className={cn("text-sm", TOGGLE_ACTIVE)}>
                {opt.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      )}
    </div>
  );
}
