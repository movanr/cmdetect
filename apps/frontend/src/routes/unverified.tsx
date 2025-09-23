import { createFileRoute } from "@tanstack/react-router";
import { useSession, signOut } from "../lib/auth";
import { KeySetupGuard } from "../components/KeySetupGuard";

export const Route = createFileRoute("/unverified")({
  component: UnverifiedPage,
});

function UnverifiedPage() {
  const { data: session } = useSession();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Authentication Required</h2>
          <p className="text-gray-600">Please sign in to continue.</p>
        </div>
      </div>
    );
  }

  return (
    <KeySetupGuard>
      <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">CMDetect</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {session.user?.name || session.user?.email || 'User'}
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

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-yellow-600 text-2xl">⚠</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Account Verification Required
            </h2>
            <p className="text-gray-600 mb-6">
              Your account needs to be verified and roles assigned before you can access the system features.
            </p>
            <p className="text-sm text-gray-500">
              Please contact your organization administrator to complete your account setup.
            </p>
          </div>
        </div>
      </main>
    </div>
    </KeySetupGuard>
  );
}