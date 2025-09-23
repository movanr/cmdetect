import { useNavigate } from "@tanstack/react-router";
import { useSession } from "../../lib/auth";
import { useRole } from "../../contexts/RoleContext";
import { useQuery } from "@tanstack/react-query";
import { getOrganizationById } from "../queries";
import { execute } from "../../graphql/execute";
import { useKeyValidation } from "../../key-setup/hooks/useKeyValidation";
import { Skeleton } from "@/components/ui/skeleton";
import logoSvg from "../../assets/logo.svg";

interface KeySetupGuardProps {
  children: React.ReactNode;
}

export function KeySetupGuard({ children }: KeySetupGuardProps) {
  const navigate = useNavigate();
  const { data: session } = useSession();
  const { isLoading: roleLoading } = useRole();

  // Get organization info from session
  const organizationId =
    (session?.user as any)?.organizationId || "org_unknown";

  // Fetch organization data to check for public key
  const { data: organizationData, isLoading: orgLoading } = useQuery({
    queryKey: ["organization", organizationId],
    queryFn: () => execute(getOrganizationById, { id: organizationId }),
    enabled: !!organizationId && organizationId !== "org_unknown",
  });

  const organizationPublicKey =
    organizationData?.organization_by_pk?.public_key_pem;

  // Use key validation hook to check setup status
  const { isLoading: validationLoading } = useKeyValidation({
    organizationPublicKey: organizationPublicKey || undefined,
    onValidationComplete: (isValid) => {
      // Always redirect to key setup if keys are not valid and user is authenticated
      if (!isValid && session?.user) {
        navigate({ to: "/key-setup" });
      }
    },
  });

  // Show loading state while checking setup status
  if (
    roleLoading ||
    orgLoading ||
    validationLoading ||
    organizationId === "org_unknown"
  ) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <img
              src={logoSvg}
              className="h-12 w-12 animate-pulse"
              alt="CMDetect logo"
            />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-48 mx-auto" />
            <Skeleton className="h-3 w-32 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  // If we reach here, keys are valid - render children
  return <>{children}</>;
}
