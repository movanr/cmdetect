import { useReducer, useMemo } from 'react';
import type { KeySetupState, KeySetupAction, KeySetupContext, GeneratedKeys } from '../types/keySetup';

function keySetupReducer(state: KeySetupState, action: KeySetupAction): KeySetupState {
  switch (action.type) {
    case 'SET_LOADING':
      return { type: 'loading' };

    case 'SET_CONTEXT': {
      const { hasPublicKey, hasPrivateKey, isCompatible, isAdmin } = action.context;

      // State determination logic centralized here
      if (hasPublicKey && hasPrivateKey) {
        if (isCompatible === true) return { type: 'setup-complete' };
        if (isCompatible === false) return { type: 'key-mismatch', error: 'Keys are incompatible' };
        return { type: 'error', error: 'Key validation produced an indeterminate result. Try reloading.' };
      }

      if (!hasPublicKey && !hasPrivateKey) {
        return isAdmin
          ? { type: 'admin-generating', step: 'generate' }
          : { type: 'user-waiting-for-admin' };
      }

      if (hasPublicKey && !hasPrivateKey) {
        return { type: 'recovery-required', hasPublicKey: true };
      }

      // Orphaned private key case
      if (!hasPublicKey && hasPrivateKey) {
        return isAdmin
          ? { type: 'error', error: 'Orphaned private key detected. Please delete and restart.' }
          : { type: 'user-waiting-for-admin' };
      }

      return { type: 'error', error: 'Unexpected key setup state. Try reloading.' };
    }

    case 'KEYS_GENERATED':
      return {
        type: 'admin-generating',
        step: 'download',
        keys: action.keys
      };

    case 'RECOVERY_FILE_DOWNLOADED':
      if (state.type === 'admin-generating') {
        return {
          ...state,
          step: 'mnemonic',
          hasDownloaded: true
        };
      }
      return state;

    case 'SETUP_COMPLETE':
      return { type: 'setup-complete' };

    case 'RECOVERY_SUCCESS':
      return { type: 'setup-complete' };

    case 'ERROR':
      return { type: 'error', error: action.error };

    case 'ORG_LOAD_ERROR':
      // Never clobber an in-progress admin generation flow — once keys are
      // generated locally, the user must finish the download/mnemonic steps
      // regardless of transient network failures.
      if (state.type === 'admin-generating' && state.step !== 'generate') {
        return state;
      }
      return { type: 'org-load-error', message: action.message };

    case 'RESET':
      return { type: 'loading' };

    default:
      return state;
  }
}

export function useKeySetupState() {
  const [state, dispatch] = useReducer(keySetupReducer, { type: 'loading' });

  const actions = useMemo(() => ({
    setLoading: () => dispatch({ type: 'SET_LOADING' }),
    setContext: (context: KeySetupContext) =>
      dispatch({ type: 'SET_CONTEXT', context }),
    setKeysGenerated: (keys: GeneratedKeys) =>
      dispatch({ type: 'KEYS_GENERATED', keys }),
    setRecoveryFileDownloaded: () =>
      dispatch({ type: 'RECOVERY_FILE_DOWNLOADED' }),
    setSetupComplete: () =>
      dispatch({ type: 'SETUP_COMPLETE' }),
    setRecoverySuccess: () =>
      dispatch({ type: 'RECOVERY_SUCCESS' }),
    setError: (error: string) =>
      dispatch({ type: 'ERROR', error }),
    setOrgLoadError: (message: string) =>
      dispatch({ type: 'ORG_LOAD_ERROR', message }),
    reset: () => dispatch({ type: 'RESET' })
  }), []);

  return { state, actions };
}
