import type { ReactNode } from 'react';
import { useKeySetup } from '../features/key-setup/hooks/useKeySetup';
import { KeySetupContext } from './useKeySetupContext';

export function KeySetupProvider({ children }: { children: ReactNode }) {
  const value = useKeySetup();
  return <KeySetupContext.Provider value={value}>{children}</KeySetupContext.Provider>;
}
