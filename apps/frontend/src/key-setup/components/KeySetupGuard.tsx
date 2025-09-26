import React, { useEffect } from 'react';
import { useNavigate, useLocation } from '@tanstack/react-router';
import { useKeySetup } from '../hooks/useKeySetup';
import { DashboardLayout } from '../../components/Navigation';
import { LoadingStep } from '../components/steps/LoadingStep';

interface KeySetupGuardProps {
  children: React.ReactNode;
}

export function KeySetupGuard({ children }: KeySetupGuardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useKeySetup();

  useEffect(() => {
    const needsSetup = state.type !== 'setup-complete' && state.type !== 'loading';

    if (needsSetup && location.pathname !== '/key-setup') {
      // Use setTimeout to defer navigation until after render
      setTimeout(() => {
        navigate({ to: '/key-setup' });
      }, 0);
    }
  }, [state.type, location.pathname, navigate]);

  if (state.type === 'loading') {
    return (
      <DashboardLayout>
        <div className="container py-8">
          <LoadingStep organizationName="your organization" />
        </div>
      </DashboardLayout>
    );
  }

  if (state.type === 'setup-complete') {
    return <>{children}</>;
  }

  // Let KeySetup component handle other states
  return <>{children}</>;
}