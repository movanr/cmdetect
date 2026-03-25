import {
  E8_LOCKING_TYPE_DESCRIPTIONS,
  E8_LOCKING_TYPE_LABELS,
  E8_REDUCTION_LABELS,
  SIDES,
  type E8LockingType,
  type Side,
} from "@cmdetect/dc-tmd";
import { useFormContext } from "react-hook-form";
import type { FormValues } from "../../form/use-examination-form";
import { SummarySection } from "./SummarySection";

const LOCKING_TYPE_KEYS: E8LockingType[] = ["closedLocking", "openLocking"];

const yn = (v: unknown) => (v === "yes" ? "Ja" : v === "no" ? "Nein" : "—");

export function E8Summary() {
  const { getValues } = useFormContext<FormValues>();

  return (
    <SummarySection sectionId="e8">
      <div className="grid grid-cols-2 gap-6">
        {(["right", "left"] as const).map((side: Side) => (
          <div key={side}>
            <h4 className="text-sm font-medium mb-2">{SIDES[side]}</h4>
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-sm">
              {LOCKING_TYPE_KEYS.map((lockingType) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const locking = getValues(`e8.${side}.${lockingType}.locking` as any) as string | null;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const reduction = getValues(`e8.${side}.${lockingType}.reduction` as any) as string | null;

                return (
                  <div key={lockingType} className="contents">
                    <dt className="text-muted-foreground">
                      {E8_LOCKING_TYPE_LABELS[lockingType]} — {E8_LOCKING_TYPE_DESCRIPTIONS[lockingType]}
                    </dt>
                    <dd>
                      {yn(locking)}
                      {locking === "yes" && reduction && (
                        <span className="ml-2 text-muted-foreground">
                          — {E8_REDUCTION_LABELS[reduction as keyof typeof E8_REDUCTION_LABELS] ?? reduction}
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
