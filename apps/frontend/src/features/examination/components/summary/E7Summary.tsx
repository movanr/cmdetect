import { CLICK_PAIN_LABELS, E7_OBSERVER_LABELS, JOINT_SOUND_LABELS, SIDES, type Side } from "@cmdetect/dc-tmd";
import { useFormContext } from "react-hook-form";
import type { FormValues } from "../../form/use-examination-form";
import { SummarySection } from "./SummarySection";

const yn = (v: unknown) => (v === "yes" ? "Ja" : v === "no" ? "Nein" : "—");

export function E7Summary() {
  const { getValues } = useFormContext<FormValues>();

  return (
    <SummarySection sectionId="e7">
      <div className="grid grid-cols-2 gap-6">
        {(["right", "left"] as const).map((side: Side) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const click = getValues(`e7.${side}.click` as any) as Record<string, unknown>;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const crepitus = getValues(`e7.${side}.crepitus` as any) as Record<string, unknown>;

          return (
            <div key={side}>
              <h4 className="text-sm font-medium mb-2">{SIDES[side]}</h4>
              <table className="text-sm w-full">
                <thead>
                  <tr className="text-muted-foreground">
                    <th className="text-left font-normal pr-4 w-24" />
                    <th className="text-center font-normal px-2">{E7_OBSERVER_LABELS.examiner}</th>
                    <th className="text-center font-normal px-2">{E7_OBSERVER_LABELS.patient}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="font-medium pr-4">{JOINT_SOUND_LABELS.click}</td>
                    <td className="text-center px-2">{yn(click.examiner)}</td>
                    <td className="text-center px-2">{yn(click.patient)}</td>
                  </tr>
                  <tr>
                    <td className="font-medium pr-4">{JOINT_SOUND_LABELS.crepitus}</td>
                    <td className="text-center px-2">{yn(crepitus.examiner)}</td>
                    <td className="text-center px-2">{yn(crepitus.patient)}</td>
                  </tr>
                </tbody>
              </table>
              {click.patient === "yes" && (
                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm mt-2 pl-4">
                  <dt className="text-muted-foreground">{CLICK_PAIN_LABELS.painWithClick}</dt>
                  <dd>{yn(click.painWithClick)}</dd>
                  {click.painWithClick === "yes" && (
                    <>
                      <dt className="text-muted-foreground">{CLICK_PAIN_LABELS.familiarPain}</dt>
                      <dd>{yn(click.familiarPain)}</dd>
                    </>
                  )}
                </dl>
              )}
            </div>
          );
        })}
      </div>
    </SummarySection>
  );
}
