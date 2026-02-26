import { createContext, useContext, type ReactNode } from 'react';
import { useKeySetup } from '../features/key-setup/hooks/useKeySetup';

type KeySetupContextValue = ReturnType<typeof useKeySetup>;

const KeySetupContext = createContext<KeySetupContextValue | undefined>(undefined);

export function KeySetupProvider({ children }: { children: ReactNode }) {
  const value = useKeySetup();
  return <KeySetupContext.Provider value={value}>{children}</KeySetupContext.Provider>;
}

export function useKeySetupContext(): KeySetupContextValue {
  const ctx = useContext(KeySetupContext);
  if (!ctx) throw new Error('useKeySetupContext must be used within KeySetupProvider');
  return ctx;
}
