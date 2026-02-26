/**
 * Case Workflow Provider
 *
 * Lightweight context provider that only provides the caseId.
 * Does NOT fetch data - child routes handle their own data fetching.
 * This avoids duplicate fetches and blocking renders.
 */

import { createContext, useContext, type ReactNode } from "react";

// Context value type - lightweight, just the case ID
interface CaseWorkflowContextValue {
  caseId: string;
}

const CaseWorkflowContext = createContext<CaseWorkflowContextValue | null>(null);

interface CaseWorkflowProviderProps {
  caseId: string;
  children: ReactNode;
}

export function CaseWorkflowProvider({ caseId, children }: CaseWorkflowProviderProps) {
  // Lightweight provider - just provides caseId
  // Data fetching happens in child routes to avoid duplication
  const contextValue: CaseWorkflowContextValue = {
    caseId,
  };

  return (
    <CaseWorkflowContext.Provider value={contextValue}>
      {children}
    </CaseWorkflowContext.Provider>
  );
}

// Hook to get caseId from context
// eslint-disable-next-line react-refresh/only-export-components
export function useCaseId(): string {
  const context = useContext(CaseWorkflowContext);
  if (!context) {
    throw new Error("useCaseId must be used within a CaseWorkflowProvider");
  }
  return context.caseId;
}

// Optional hook that returns null if not in context
// eslint-disable-next-line react-refresh/only-export-components
export function useCaseIdSafe(): string | null {
  const context = useContext(CaseWorkflowContext);
  return context?.caseId ?? null;
}
