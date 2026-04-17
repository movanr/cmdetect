export type KeySetupState =
  | { type: 'loading' }
  | { type: 'user-waiting-for-admin' }
  | { type: 'recovery-required'; hasPublicKey: boolean }
  | { type: 'key-mismatch'; error: string }
  | { type: 'setup-complete' }
  | { type: 'error'; error: string }
  | { type: 'org-load-error'; message: string }
  | {
      type: 'admin-generating';
      step: 'generate' | 'download' | 'mnemonic';
      keys?: GeneratedKeys;
      hasDownloaded?: boolean;
    };

export interface GeneratedKeys {
  publicKey: string;
  privateKey: string;
  mnemonic: string;
}

export interface KeySetupContext {
  organizationId: string;
  organizationName: string;
  isAdmin: boolean;
  hasPublicKey: boolean;
  hasPrivateKey: boolean;
  isCompatible: boolean | null;
}

export type KeySetupAction =
  | { type: 'SET_LOADING' }
  | { type: 'SET_CONTEXT'; context: KeySetupContext }
  | { type: 'KEYS_GENERATED'; keys: GeneratedKeys }
  | { type: 'RECOVERY_FILE_DOWNLOADED' }
  | { type: 'SETUP_COMPLETE' }
  | { type: 'RECOVERY_SUCCESS' }
  | { type: 'ERROR'; error: string }
  | { type: 'ORG_LOAD_ERROR'; message: string }
  | { type: 'RESET' };
