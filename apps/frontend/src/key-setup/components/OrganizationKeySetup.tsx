import { useSession } from "../../lib/auth";
import { useRole } from "../../contexts/RoleContext";
import { useQuery } from "@tanstack/react-query";
import { getOrganizationById } from "../queries";
import { execute } from "../../graphql/execute";
import { AdminKeySetup } from "./AdminKeySetup";
import { UserKeySetup } from "./UserKeySetup";
import { WaitForAdminMessage } from "./WaitForAdminMessage";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield } from "lucide-react";

interface OrganizationKeySetupProps {
  onSetupComplete?: () => void;
}

export function OrganizationKeySetup({
  onSetupComplete,
}: OrganizationKeySetupProps) {
  const { data: session } = useSession();
  const { activeRole, isLoading: roleLoading } = useRole();

  // Get organization info from session
  const organizationId =
    (session?.user as any)?.organizationId || "org_unknown";

  // Fetch organization data
  const { data: organizationData, isLoading: orgLoading } = useQuery({
    queryKey: ["organization", organizationId],
    queryFn: () => execute(getOrganizationById, { id: organizationId }),
    enabled: !!organizationId && organizationId !== "org_unknown",
  });

  const organizationName =
    organizationData?.organization_by_pk?.name ||
    `Organization ${organizationId}`;

  const hasPublicKey = !!organizationData?.organization_by_pk?.public_key_pem;

  // Show loading state while dependencies are loading
  if (
    roleLoading ||
    orgLoading ||
    !activeRole ||
    organizationId === "org_unknown"
  ) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-3">
              <Shield className="h-6 w-6 text-muted-foreground animate-pulse" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Role-based component rendering
  if (activeRole === "org_admin") {
    // Admin users get the full key setup workflow
    return <AdminKeySetup onSetupComplete={onSetupComplete} />;
  } else {
    // Non-admin users
    if (!hasPublicKey) {
      // No public key exists - show wait for admin message
      return (
        <WaitForAdminMessage
          organizationName={organizationName}
          onRefresh={() => window.location.reload()}
        />
      );
    } else {
      // Public key exists - show user key setup (private key only)
      return <UserKeySetup onSetupComplete={onSetupComplete} />;
    }
  }
}
