import React, { useEffect } from "react";
import { useNavigate, useLocation } from "@tanstack/react-router";
import { useKeySetup } from "../hooks/useKeySetup";
import { LoadingStep } from "./steps/LoadingStep";

interface KeySetupGuardProps {
  children: React.ReactNode;
}

export function KeySetupGuard({ children }: KeySetupGuardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useKeySetup();

  useEffect(() => {
    const needsSetup =
      state.type !== "setup-complete" && state.type !== "loading";

    if (needsSetup && location.pathname !== "/key-setup") {
      // Use setTimeout to defer navigation until after render
      setTimeout(() => {
        navigate({ to: "/key-setup" });
      }, 0);
    }
  }, [state.type, location.pathname, navigate]);

  if (state.type === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <LoadingStep organizationName="your organization" />
        </div>
      </div>
    );
  }

  if (state.type === "setup-complete") {
    return <>{children}</>;
  }

  // Let KeySetup component handle other states
  return <>{children}</>;
}
