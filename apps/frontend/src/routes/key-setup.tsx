import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSession, signOut } from "../lib/auth";
import { useRole } from "../contexts/RoleContext";
import { useQuery } from "@tanstack/react-query";
import { getOrganizationById } from "../key-setup/queries";
import { execute } from "../graphql/execute";
import { useKeyValidation } from "../key-setup/hooks/useKeyValidation";
import { OrganizationKeySetup } from "../key-setup/components/OrganizationKeySetup";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Shield, Trash2, LogOut } from "lucide-react";
import logoSvg from "../assets/logo.svg";
import { useEffect } from "react";
import { deleteStoredPrivateKey } from "../crypto";

export const Route = createFileRoute("/key-setup")({
  component: KeySetupPage,
});

function KeySetupPage() {
  const navigate = useNavigate();
  const { data: session } = useSession();
  const { activeRole, isLoading: roleLoading } = useRole();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!session?.user && !roleLoading) {
      navigate({ to: "/login" });
    }
  }, [session, roleLoading, navigate]);

  // Get organization info from session
  const organizationId =
    (session?.user as any)?.organizationId || "org_unknown";

  // Fetch organization data
  const {
    data: organizationData,
    isLoading: orgLoading,
    error: orgError,
  } = useQuery({
    queryKey: ["organization", organizationId],
    queryFn: () => execute(getOrganizationById, { id: organizationId }),
    enabled: !!organizationId && organizationId !== "org_unknown",
    retry: 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const organizationPublicKey =
    organizationData?.organization_by_pk?.public_key_pem;

  // Check key validation status
  const {
    isLoading: validationLoading,
    hasLocalKey,
    hasPublicKey,
    isCompatible,
  } = useKeyValidation({
    organizationPublicKey: organizationPublicKey || undefined,
    onValidationComplete: (isValid) => {
      if (isValid) {
        // Keys are valid, redirect to main application
        navigate({ to: "/" });
      }
      // If not valid, stay on this page to complete setup
    },
  });

  const handleClearKeys = async () => {
    try {
      await deleteStoredPrivateKey();
      window.location.reload();
    } catch (error) {
      console.error("Failed to clear keys:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate({ to: "/login" });
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const handleSetupComplete = () => {
    // Navigate to main application after successful setup
    navigate({ to: "/" });
  };

  // Show loading state while checking authentication and keys
  // Don't wait for org loading if there's an error - proceed with setup
  const shouldShowLoading =
    !session?.user ||
    roleLoading ||
    (orgLoading && !orgError) ||
    validationLoading;

  if (shouldShowLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-6">
            <img
              src={logoSvg}
              className="h-16 w-16 animate-pulse"
              alt="CMDetect logo"
            />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-48 mx-auto" />
            <Skeleton className="h-3 w-32 mx-auto" />
          </div>
          <p className="text-sm text-muted-foreground">
            Checking encryption setup...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-4xl space-y-8 p-4">
        {/* Header with sign out button */}
        <div className="flex justify-between items-start">
          <div className="text-center flex-1 space-y-2">
            <div className="flex justify-center mb-6">
              <img src={logoSvg} className="h-16 w-16" alt="CMDetect logo" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">CMDetect</h1>
            <p className="text-muted-foreground">Encryption Setup Required</p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>Complete setup to secure patient data</span>
            </div>
          </div>
          <Button
            onClick={handleSignOut}
            variant="outline"
            size="sm"
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-8">
            <OrganizationKeySetup onSetupComplete={handleSetupComplete} />
          </CardContent>
        </Card>

        {/* Debug controls */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-2">
            Debug: hasLocalKey={String(hasLocalKey)}, hasPublicKey=
            {String(hasPublicKey)}, isCompatible={String(isCompatible)}
          </p>
          <Button
            onClick={handleClearKeys}
            variant="outline"
            size="sm"
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Stored Keys (Debug)
          </Button>
        </div>

        {/* Role indicator */}
        {activeRole && (
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Logged in as:{" "}
              <span className="font-medium">
                {activeRole.replace("_", " ")}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
