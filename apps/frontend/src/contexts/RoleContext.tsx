import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useSession, switchUserRole } from '../lib/auth';
import { roles, roleHierarchy } from '@cmdetect/config';

// Define available roles in the system
export type UserRole = typeof roles.ORG_ADMIN | typeof roles.PHYSICIAN | typeof roles.ASSISTANT | typeof roles.RECEPTIONIST | typeof roles.UNVERIFIED;

export interface RoleContextType {
  // Current state
  availableRoles: UserRole[];
  activeRole: UserRole | null;
  isLoading: boolean;
  
  // Actions
  switchRole: (role: UserRole) => Promise<boolean>;
  
  // Helper functions
  hasRole: (role: UserRole) => boolean;
  canAccessRoute: (allowedRoles: UserRole[]) => boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

interface RoleProviderProps {
  children: ReactNode;
}

export function RoleProvider({ children }: RoleProviderProps) {
  const { data: session, isPending: isSessionPending } = useSession();
  const [activeRole, setActiveRole] = useState<UserRole | null>(null);
  const [availableRoles, setAvailableRoles] = useState<UserRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Extract roles from session when it changes
  useEffect(() => {
    // Wait for Better Auth to finish its initial session fetch before processing
    if (isSessionPending) return;

    if (session?.user) {
      const sessionUser = session.user as { roles?: UserRole[]; activeRole?: UserRole };
      const userRoles = sessionUser.roles ?? [];
      const currentActiveRole = sessionUser.activeRole as UserRole;

      setAvailableRoles(userRoles);

      // Set active role from session or default to first available role
      if (currentActiveRole && userRoles.includes(currentActiveRole)) {
        setActiveRole(currentActiveRole);
      } else if (userRoles.length > 0) {
        // Default to first role in hierarchy (same logic as backend JWT)
        const defaultRole = roleHierarchy.find((r) => userRoles.includes(r as UserRole)) as UserRole | undefined;
        setActiveRole(defaultRole ?? userRoles[0]);
      } else {
        setActiveRole(null);
      }

      setIsLoading(false);
    } else {
      // No session - reset everything
      setAvailableRoles([]);
      setActiveRole(null);
      setIsLoading(false);
    }
  }, [session, isSessionPending]);

  const switchRole = async (newRole: UserRole): Promise<boolean> => {
    if (!availableRoles.includes(newRole)) {
      console.error(`Cannot switch to role ${newRole}: not available`);
      return false;
    }

    try {
      setIsLoading(true);
      
      // Use the helper function from auth.ts
      const result = await switchUserRole(newRole);
      
      if (result.success) {
        // Update local state immediately
        setActiveRole(newRole);
        
        // The user will need to get a new JWT token for the role change to take effect
        // This happens automatically when they make their next authenticated request
        console.log(`Role switched to ${newRole}. New JWT will be issued on next request.`);
        
        return true;
      } else {
        console.error('Role switching failed:', result.error);
        return false;
      }
    } catch (error) {
      console.error('Error switching role:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const hasRole = (role: UserRole): boolean => {
    return availableRoles.includes(role);
  };

  const canAccessRoute = (allowedRoles: UserRole[]): boolean => {
    return activeRole ? allowedRoles.includes(activeRole) : false;
  };

  const value: RoleContextType = {
    availableRoles,
    activeRole,
    isLoading,
    switchRole,
    hasRole,
    canAccessRoute,
  };

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useRole(): RoleContextType {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}

// Helper hook for role-based conditional rendering
// eslint-disable-next-line react-refresh/only-export-components
export function useRoleAccess(allowedRoles: UserRole[]) {
  const { activeRole, canAccessRoute } = useRole();
  
  return {
    hasAccess: canAccessRoute(allowedRoles),
    activeRole,
    isAllowed: (role: UserRole) => allowedRoles.includes(role),
  };
}