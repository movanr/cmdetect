import { useEffect } from 'react';
import { useKeySetupContext } from '../../../contexts/useKeySetupContext';
import { LoadingStep } from './steps/LoadingStep';
import { AdminGeneratingStep } from './steps/AdminGeneratingStep';
import { RecoveryStep } from './steps/RecoveryStep';
import { ErrorStep } from './steps/ErrorStep';
import { WaitingStep } from './steps/WaitingStep';

interface KeySetupProps {
  onSetupComplete?: () => void;
}

export function KeySetup({ onSetupComplete }: KeySetupProps) {
  const { state, actions, context, revalidate } = useKeySetupContext();

  // Auto-redirect when setup is already complete
  useEffect(() => {
    if (state.type === 'setup-complete') {
      onSetupComplete?.();
    }
  }, [state.type, onSetupComplete]);

  const renderStep = () => {
    switch (state.type) {
      case 'loading':
        return <LoadingStep />;

      case 'admin-generating':
        return (
          <AdminGeneratingStep
            state={state}
            context={context}
            actions={actions}
            onComplete={onSetupComplete}
          />
        );

      case 'recovery-required':
        return (
          <RecoveryStep
            organizationPublicKey={context.organizationPublicKey || undefined}
            isAdmin={context.isAdmin}
            onSuccess={() => {
              actions.setRecoverySuccess();
              onSetupComplete?.();
            }}
          />
        );

      case 'setup-complete':
        return <LoadingStep />;

      case 'user-waiting-for-admin':
        return (
          <WaitingStep
            organizationName={context.organizationName}
            onRefresh={revalidate}
          />
        );

      case 'error':
      case 'key-mismatch':
        return (
          <ErrorStep
            error={state.error}
            onRetry={actions.reset}
            onRevalidate={revalidate}
            onStartRecovery={() => actions.setContext({
              organizationId: context.organizationId,
              organizationName: context.organizationName,
              isAdmin: context.isAdmin,
              hasPublicKey: !!context.organizationPublicKey,
              hasPrivateKey: false, // Force recovery flow
              isCompatible: null
            })}
          />
        );

      default:
        return <ErrorStep error="Unknown state" onRetry={actions.reset} />;
    }
  };

  return <div className="space-y-6">{renderStep()}</div>;
}
