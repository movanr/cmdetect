import { createContext, useContext } from 'react';
import type { useKeySetup } from '../features/key-setup/hooks/useKeySetup';

export type KeySetupContextValue = ReturnType<typeof useKeySetup>;

export const KeySetupContext = createContext<KeySetupContextValue | undefined>(undefined);

export function useKeySetupContext(): KeySetupContextValue {
  const ctx = useContext(KeySetupContext);
  if (!ctx) throw new Error('useKeySetupContext must be used within KeySetupProvider');
  return ctx;
}
