import { createFileRoute, Link } from "@tanstack/react-router";
import { useSession, signOut } from "../lib/auth";
import { useRole } from "../contexts/RoleContext";
import "../App.css";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  const { data: session, isPending } = useSession();
  const { availableRoles, activeRole, hasRole } = useRole();

  const handleSignOut = async () => {
    try {
      const result = await signOut();
      console.log("Sign out result:", result);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {session ? (
        <div>
          {/* Header */}
          <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <h1 className="text-2xl font-bold text-gray-900">CMDetect</h1>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    Welcome, {session.user?.name || session.user?.email || 'User'}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Select Your Workspace
                </h2>
                <p className="text-gray-600 mb-6">
                  Choose which area you'd like to work in. You have access to the following roles:
                  {availableRoles.length > 0 && (
                    <span className="font-medium"> {availableRoles.join(", ")}</span>
                  )}
                </p>

                {/* Role-based Navigation Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {hasRole('org_admin') && (
                    <Link
                      to="/admin"
                      className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 hover:border-red-300"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                            <span className="text-red-600 font-semibold text-sm">A</span>
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Organization Admin</h3>
                          <p className="text-sm text-gray-600">
                            Manage users, settings, and system configuration
                          </p>
                        </div>
                      </div>
                    </Link>
                  )}

                  {hasRole('physician') && (
                    <Link
                      to="/physician"
                      className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 hover:border-green-300"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <span className="text-green-600 font-semibold text-sm">Dr</span>
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Physician Portal</h3>
                          <p className="text-sm text-gray-600">
                            View patient records and review questionnaires
                          </p>
                        </div>
                      </div>
                    </Link>
                  )}

                  {hasRole('receptionist') && (
                    <Link
                      to="/receptionist"
                      className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 hover:border-purple-300"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                            <span className="text-purple-600 font-semibold text-sm">R</span>
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Reception Desk</h3>
                          <p className="text-sm text-gray-600">
                            Create patient records and manage assignments
                          </p>
                        </div>
                      </div>
                    </Link>
                  )}

                  {hasRole('unverified') && (
                    <Link
                      to="/unverified"
                      className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 hover:border-yellow-300"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <span className="text-yellow-600 font-semibold text-sm">⚠</span>
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Account Verification</h3>
                          <p className="text-sm text-gray-600">
                            Complete your account verification
                          </p>
                        </div>
                      </div>
                    </Link>
                  )}
                </div>

                {availableRoles.length === 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="font-medium text-yellow-800">No Roles Assigned</h3>
                    <p className="text-yellow-700 text-sm mt-1">
                      Contact your administrator to get role access.
                    </p>
                  </div>
                )}
              </div>

              {/* Debug Info */}
              <div className="mt-12 bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Debug Info</h3>
                <div className="text-xs text-gray-600 space-y-1">
                  <p>Active Role: {activeRole || 'None'}</p>
                  <p>Available Roles: [{availableRoles.join(', ')}]</p>
                  <p>User ID: {session.user.id}</p>
                  <p>Email: {session.user.email}</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      ) : (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900">CMDetect</h2>
              <p className="mt-2 text-gray-600">Please sign in to continue</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <Link
                to="/login"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
