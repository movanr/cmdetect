import { useFormContext } from "react-hook-form";
import type { FormValues } from "../../form/use-examination-form";
import { SummarySection } from "./SummarySection";

const SIDES = [
  { key: "right", label: "Rechts" },
  { key: "left", label: "Links" },
] as const;

const LOCKING_TYPES = [
  { key: "closedLocking", label: "Geschlossene Arretierung" },
  { key: "openLocking", label: "Geöffnete Arretierung" },
] as const;

const REDUCTION_LABELS: Record<string, string> = {
  patient: "Patient",
  examiner: "Untersucher",
  notReduced: "Nicht reponiert",
};

const yn = (v: unknown) => (v === "yes" ? "Ja" : v === "no" ? "Nein" : "—");

export function E8Summary() {
  const { getValues } = useFormContext<FormValues>();

  return (
    <SummarySection sectionId="e8">
      <div className="grid grid-cols-2 gap-6">
        {SIDES.map(({ key: side, label: sideLabel }) => (
          <div key={side}>
            <h4 className="text-sm font-medium mb-2">{sideLabel}</h4>
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-sm">
              {LOCKING_TYPES.map(({ key: lockingType, label: lockingLabel }) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const locking = getValues(`e8.${side}.${lockingType}.locking` as any) as string | null;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const reduction = getValues(`e8.${side}.${lockingType}.reduction` as any) as string | null;

                return (
                  <div key={lockingType} className="contents">
                    <dt className="text-muted-foreground">{lockingLabel}</dt>
                    <dd>
                      {yn(locking)}
                      {locking === "yes" && reduction && (
                        <span className="ml-2 text-muted-foreground">
                          — {REDUCTION_LABELS[reduction] ?? reduction}
                        </span>
                      )}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </div>
        ))}
      </div>
    </SummarySection>
  );
}
