import { createFileRoute, Link } from "@tanstack/react-router";
import { useSession, signOut } from "../lib/auth";
import "../App.css";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  const { data: session, isPending } = useSession();

  const handleSignOut = async () => {
    try {
      const result = await signOut();
      console.log("Sign out result:", result);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  if (isPending) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">CMDetect Dashboard</h1>

      {session ? (
        <div>
          <div className="bg-green-50 p-4 rounded-lg mb-6">
            <h2 className="text-xl font-semibold mb-2">Welcome back!</h2>
            <p>
              <strong>User:</strong> {session.user.email}
            </p>
            <p>
              <strong>Name:</strong> {session.user.name}
            </p>
            <p>
              <strong>User ID:</strong> {session.user.id}
            </p>

            <button
              onClick={handleSignOut}
              className="mt-3 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Sign Out
            </button>
          </div>

          <div className="space-y-4">
            <Link
              to="/submissions"
              className="block p-4 bg-blue-50 rounded-lg hover:bg-blue-100 text-blue-800"
            >
              <h3 className="font-semibold">View Organization Data</h3>
              <p className="text-sm">Test authenticated GraphQL queries</p>
            </Link>

            <div className="block p-4 bg-green-50 rounded-lg border border-green-200 text-green-800">
              <h3 className="font-semibold">Patient Questionnaire Test</h3>
              <p className="text-sm mb-2">
                Test patient consent and questionnaire submission via Hasura
                Actions
              </p>
              <p className="text-xs text-green-600">
                Manually navigate to:{" "}
                <code>/patient?invite_token=YOUR_INVITE_TOKEN</code>
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="bg-yellow-50 p-4 rounded-lg mb-6">
            <h2 className="text-xl font-semibold mb-2">Please sign in</h2>
            <p>You need to authenticate to access organization data.</p>
          </div>

          <div className="space-y-4">
            <Link
              to="/login"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Sign In
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
