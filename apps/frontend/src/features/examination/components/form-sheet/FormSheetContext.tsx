import type { ReactNode } from "react";
import { FormSheetContext } from "./use-form-sheet";

export function FormSheetProvider({
  readOnly,
  children,
}: {
  readOnly: boolean;
  children: ReactNode;
}) {
  return <FormSheetContext.Provider value={{ readOnly }}>{children}</FormSheetContext.Provider>;
}
