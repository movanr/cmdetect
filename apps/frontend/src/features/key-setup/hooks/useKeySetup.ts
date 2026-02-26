import { useEffect, useCallback } from "react";
import { useSession } from "../../../lib/auth";
import { useRole } from "../../../contexts/RoleContext";
import { useQuery } from "@tanstack/react-query";
import { getOrganizationById } from "../queries";
import { execute } from "../../../graphql/execute";
import { useKeyValidation } from "./useKeyValidation";
import { useKeySetupState } from "./useKeySetupState";
import type { KeySetupContext } from "../types/keySetup";
import { roles } from "@cmdetect/config";

export function useKeySetup() {
  const { data: session } = useSession();
  const { activeRole } = useRole();
  const { state, actions } = useKeySetupState();

  const organizationId =
    (session?.user as { organizationId?: string } | undefined)?.organizationId ?? "org_unknown";

  // Fetch organization data
  const { data: organizationData, isLoading: orgLoading } = useQuery({
    queryKey: ["organization", organizationId],
    queryFn: () => execute(getOrganizationById, { id: organizationId }),
    enabled: !!organizationId && organizationId !== "org_unknown",
  });

  const organizationPublicKey =
    organizationData?.organization_by_pk?.public_key_pem;
  const organizationName =
    organizationData?.organization_by_pk?.name ||
    `Organization ${organizationId}`;

  // Memoize the validation complete callback to prevent infinite re-renders
  const handleValidationComplete = useCallback(
    (
      _isValid: boolean,
      validationData?: {
        hasLocalKey: boolean;
        hasPublicKey: boolean;
        isCompatible: boolean | null;
      }
    ) => {
      if (!orgLoading && validationData) {
        const context: KeySetupContext = {
          organizationId,
          organizationName,
          isAdmin: activeRole === roles.ORG_ADMIN,
          hasPublicKey: !!organizationPublicKey,
          hasPrivateKey: validationData.hasLocalKey,
          isCompatible: validationData.isCompatible,
        };
        actions.setContext(context);
      }
    },
    [
      orgLoading,
      organizationId,
      organizationName,
      activeRole,
      organizationPublicKey,
      actions,
    ]
  );

  // Use simplified validation hook
  const { isLoading: validationLoading, revalidate } = useKeyValidation({
    organizationPublicKey,
    onValidationComplete: handleValidationComplete,
  });

  // Loading state management
  useEffect(() => {
    if (orgLoading || validationLoading) {
      actions.setLoading();
    }
  }, [orgLoading, validationLoading, actions]);

  // Advance state when org data is unavailable (post-logout, disabled query, query error)
  useEffect(() => {
    if (!orgLoading && !validationLoading && organizationPublicKey === undefined) {
      actions.setContext({
        organizationId,
        organizationName,
        hasPublicKey: false,
        hasPrivateKey: false,
        isCompatible: null,
        isAdmin: activeRole === roles.ORG_ADMIN,
      });
    }
  }, [orgLoading, validationLoading, organizationPublicKey, organizationId, organizationName, activeRole, actions]);

  return {
    state,
    actions,
    context: {
      organizationId,
      organizationName,
      organizationPublicKey,
      isAdmin: activeRole === roles.ORG_ADMIN,
    },
    revalidate,
  };
}
