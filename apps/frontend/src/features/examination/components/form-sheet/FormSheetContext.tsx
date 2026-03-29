import { createContext, useContext, type ReactNode } from "react";

interface FormSheetContextValue {
  readOnly: boolean;
}

const FormSheetContext = createContext<FormSheetContextValue>({ readOnly: false });

export function FormSheetProvider({
  readOnly,
  children,
}: {
  readOnly: boolean;
  children: ReactNode;
}) {
  return <FormSheetContext.Provider value={{ readOnly }}>{children}</FormSheetContext.Provider>;
}

export function useFormSheet() {
  return useContext(FormSheetContext);
}
