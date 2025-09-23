import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import { useRole } from "../contexts/RoleContext";
import { useSession } from "../lib/auth";
import { KeySetupGuard } from "../key-setup/components/KeySetupGuard";

export const Route = createFileRoute("/receptionist")({
  component: ReceptionistLayout,
});

function ReceptionistLayout() {
  const { data: session } = useSession();
  const { activeRole, switchRole, hasRole, isLoading } = useRole();

  useEffect(() => {
    if (
      session?.user &&
      hasRole("receptionist") &&
      activeRole !== "receptionist"
    ) {
      switchRole("receptionist");
    }
  }, [session, hasRole, activeRole, switchRole]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">
            Switching to receptionist mode...
          </p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Authentication Required
          </h2>
          <p className="text-gray-600">
            Please sign in to access receptionist features.
          </p>
        </div>
      </div>
    );
  }

  if (!hasRole("receptionist")) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
          <p className="text-gray-600">
            You don't have permission to access receptionist features.
          </p>
        </div>
      </div>
    );
  }

  return (
    <KeySetupGuard>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-semibold text-gray-900">
                  Reception Desk
                </h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {activeRole === "receptionist"
                    ? "Receptionist Mode"
                    : "Role Loading..."}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                {session.user?.name || session.user?.email || "User"}
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Receptionist Dashboard
              </h2>
              <p className="text-gray-600">
                This is the receptionist interface.
              </p>

              <div className="mt-6">
                <Outlet />
              </div>
            </div>
          </div>
        </main>
      </div>
    </KeySetupGuard>
  );
}
