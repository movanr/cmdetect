import { createContext, useContext } from "react";

export interface FormSheetContextValue {
  readOnly: boolean;
}

export const FormSheetContext = createContext<FormSheetContextValue>({ readOnly: false });

export function useFormSheet() {
  return useContext(FormSheetContext);
}
