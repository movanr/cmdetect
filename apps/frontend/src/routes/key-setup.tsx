import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSession } from "../lib/auth";
import { KeySetup } from "../features/key-setup/components/KeySetup";
import { Card, CardContent } from "@/components/ui/card";
import { Shield } from "lucide-react";
import { useEffect } from "react";
import { Header } from "../components/navigation/Header";

export const Route = createFileRoute("/key-setup")({
  component: KeySetupPage,
});

function KeySetupPage() {
  const navigate = useNavigate();
  const { data: session } = useSession();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!session?.user) {
      navigate({ to: "/login" });
    }
  }, [session, navigate]);

  const handleSetupComplete = () => {
    // Navigate to main application after successful setup
    navigate({ to: "/" });
  };

  if (!session?.user) {
    return null; // Let the useEffect handle the redirect
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="flex items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-4xl space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Encryption Setup Required
            </h1>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>Complete setup to secure patient data</span>
            </div>
          </div>

          <Card>
            <CardContent className="p-8">
              <KeySetup onSetupComplete={handleSetupComplete} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
