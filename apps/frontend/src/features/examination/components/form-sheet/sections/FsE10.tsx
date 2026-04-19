import { useCallback } from "react";
import { useFormContext } from "react-hook-form";
import { SECTION_LABELS } from "@cmdetect/dc-tmd";
import type { FormValues } from "../../../form/use-examination-form";
import { createSectionPathLookup } from "../../../form/use-examination-form";
import { clearE10PalpationSide } from "../clear-helpers";
import { FormSheetSection } from "../FormSheetSection";
import { FsSupplPalpGrid } from "../grids/FsSupplPalpGrid";
import { useSectionValues } from "../use-section-values";

const { paths: E10_PATHS, indexMap: E10_INDEX } = createSectionPathLookup("e10");

const REFUSED_PATHS = { left: "e10.left.refused", right: "e10.right.refused" } as const;

export function FsE10() {
  const getValue = useSectionValues(E10_PATHS, E10_INDEX);
  const { setValue } = useFormContext<FormValues>();

  const handleRefuseChange = useCallback(
    (side: "left" | "right", refused: boolean) => {
      if (refused) clearE10PalpationSide(setValue, side);
    },
    [setValue]
  );

  return (
    <FormSheetSection number="10" title={SECTION_LABELS.e10.full}>
      <FsSupplPalpGrid
        getValue={getValue}
        refusedPaths={REFUSED_PATHS}
        onRefuseChange={handleRefuseChange}
      />
    </FormSheetSection>
  );
}
