import { useCallback } from "react";
import { useFormContext } from "react-hook-form";
import { SECTION_LABELS } from "@cmdetect/dc-tmd";
import type { FormValues } from "../../../form/use-examination-form";
import { createSectionPathLookup } from "../../../form/use-examination-form";
import { clearE9PalpationSide } from "../clear-helpers";
import { FormSheetSection } from "../FormSheetSection";
import { FsPalpationGrid } from "../grids/FsPalpationGrid";
import { useSectionValues } from "../use-section-values";

const { paths: E9_PATHS, indexMap: E9_INDEX } = createSectionPathLookup("e9");

const REFUSED_PATHS = { left: "e9.left.refused", right: "e9.right.refused" } as const;

export function FsE9() {
  const getValue = useSectionValues(E9_PATHS, E9_INDEX);
  const { setValue } = useFormContext<FormValues>();

  const handleRefuseChange = useCallback(
    (side: "left" | "right", refused: boolean) => {
      if (refused) clearE9PalpationSide(setValue, side);
    },
    [setValue]
  );

  return (
    <FormSheetSection number="9" title={SECTION_LABELS.e9.full}>
      <FsPalpationGrid
        getValue={getValue}
        refusedPaths={REFUSED_PATHS}
        onRefuseChange={handleRefuseChange}
      />
    </FormSheetSection>
  );
}
