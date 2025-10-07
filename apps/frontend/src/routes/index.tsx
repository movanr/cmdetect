import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSession } from "../lib/auth";
import { useRole } from "../contexts/RoleContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";
import logoSvg from "../assets/logo.svg";
import { getTranslations } from "../config/i18n";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  const navigate = useNavigate();
  const { data: session, isPending } = useSession();
  const { availableRoles, activeRole } = useRole();
  const t = getTranslations();

  // Auto-redirect authenticated users based on role
  useEffect(() => {
    if (session?.user && availableRoles.length > 0 && activeRole) {
      // Redirect based on active role
      if (activeRole === "physician") {
        navigate({ to: "/cases" });
      } else if (activeRole === "receptionist") {
        navigate({ to: "/invites" });
      } else if (activeRole === "org_admin") {
        navigate({ to: "/cases" });
      } else {
        // Fallback to invites for other roles
        navigate({ to: "/invites" });
      }
    }
  }, [session, availableRoles, activeRole, navigate]);

  if (isPending) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <img
              src={logoSvg}
              className="h-12 w-12 animate-pulse"
              alt={`${t.nav.appName} logo`}
            />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 mx-auto" />
            <Skeleton className="h-3 w-24 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  return session ? (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <img
            src={logoSvg}
            className="h-12 w-12 animate-pulse"
            alt={`${t.nav.appName} logo`}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Redirecting...
        </p>
      </div>
    </div>
  ) : (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-6">
            <img src={logoSvg} className="h-16 w-16" alt={`${t.nav.appName} logo`} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{t.nav.appName}</h1>
          <p className="text-muted-foreground">{t.auth.pleaseSignIn}</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <Button asChild className="w-full">
              <Link to="/login">{t.auth.signIn}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
