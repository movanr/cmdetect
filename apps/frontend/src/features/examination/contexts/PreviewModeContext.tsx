/**
 * Preview Mode Context
 *
 * Provides a boolean flag indicating whether the examination is in preview/preparation mode.
 * In preview mode, forms are interactive but no data is persisted.
 */

import { createContext, useContext, type ReactNode } from "react";

interface PreviewModeContextValue {
  isPreviewMode: boolean;
}

const PreviewModeContext = createContext<PreviewModeContextValue>({
  isPreviewMode: false,
});

interface PreviewModeProviderProps {
  isPreviewMode: boolean;
  children: ReactNode;
}

export function PreviewModeProvider({ isPreviewMode, children }: PreviewModeProviderProps) {
  return (
    <PreviewModeContext.Provider value={{ isPreviewMode }}>
      {children}
    </PreviewModeContext.Provider>
  );
}

export function usePreviewMode(): PreviewModeContextValue {
  return useContext(PreviewModeContext);
}
