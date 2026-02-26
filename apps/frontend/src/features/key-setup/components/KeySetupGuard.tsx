import React, { useEffect } from "react";
import { useNavigate, useLocation } from "@tanstack/react-router";
import { useSession } from "../../../lib/auth";
import { useKeySetupContext } from "../../../contexts/KeySetupContext";
import { LoadingStep } from "./steps/LoadingStep";

interface KeySetupGuardProps {
  children: React.ReactNode;
}

export function KeySetupGuard({ children }: KeySetupGuardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: session } = useSession();
  const { state } = useKeySetupContext();

  useEffect(() => {
    if (!session) return; // No session — AppLayout handles the /login redirect

    const needsSetup =
      state.type !== "setup-complete" && state.type !== "loading";

    if (needsSetup && location.pathname !== "/key-setup") {
      // Use setTimeout to defer navigation until after render
      setTimeout(() => {
        navigate({ to: "/key-setup" });
      }, 0);
    }
  }, [session, state.type, location.pathname, navigate]);

  if (!session) {
    return <>{children}</>;
  }

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
