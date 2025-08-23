import { createFileRoute, redirect } from "@tanstack/react-router";
import { LoginForm } from "../components/LoginForm";
import { useSession } from "../lib/auth";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  beforeLoad: ({ context, location }) => {
    // If already logged in, redirect to home
    // Note: This check will be enhanced once we have session context
  },
});

function LoginPage() {
  const { data: session } = useSession();

  // If user is already logged in, show session info
  if (session) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-6">
        <h2 className="text-2xl font-bold mb-4">Already Logged In</h2>
        <div className="bg-green-50 p-4 rounded-lg">
          <p><strong>User:</strong> {session.user.email}</p>
          <p><strong>Name:</strong> {session.user.name}</p>
          <p><strong>Roles:</strong> {JSON.stringify(session.user.roles)}</p>
          <p><strong>Organization ID:</strong> {session.user.organizationId}</p>
        </div>
        <div className="mt-4">
          <a href="/" className="text-blue-600 hover:underline">
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return <LoginForm />;
}