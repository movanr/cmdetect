import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSession } from "../lib/auth";
import { useRole } from "../contexts/RoleContext";
import { DashboardLayout, RoleNavigation } from "../components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";
import logoSvg from "../assets/logo.svg";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  const navigate = useNavigate();
  const { data: session, isPending } = useSession();
  const { availableRoles, hasRole } = useRole();

  // Auto-redirect users with only one role
  useEffect(() => {
    if (session?.user && availableRoles.length === 1) {
      const singleRole = availableRoles[0];

      // Map roles to their routes
      const roleRoutes = {
        org_admin: "/admin",
        physician: "/physician",
        receptionist: "/receptionist",
        unverified: "/unverified"
      };

      const targetRoute = roleRoutes[singleRole];
      if (targetRoute) {
        navigate({ to: targetRoute });
      }
    }
  }, [session, availableRoles, navigate]);

  if (isPending) {
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
            <Skeleton className="h-4 w-32 mx-auto" />
            <Skeleton className="h-3 w-24 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  return session ? (
    <DashboardLayout>
      {/* Only show role navigation if user has multiple roles */}
      {availableRoles.length > 1 ? (
        <RoleNavigation availableRoles={availableRoles} hasRole={hasRole} />
      ) : (
        <div className="container py-8">
          <div className="text-center space-y-4">
            <div className="space-y-2">
              <div className="h-4 w-48 mx-auto bg-muted animate-pulse rounded" />
              <div className="h-3 w-32 mx-auto bg-muted animate-pulse rounded" />
            </div>
            <p className="text-sm text-muted-foreground">
              Redirecting to your workspace...
            </p>
          </div>
        </div>
      )}
    </DashboardLayout>
  ) : (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-6">
            <img src={logoSvg} className="h-16 w-16" alt="CMDetect logo" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">CMDetect</h1>
          <p className="text-muted-foreground">Please sign in to continue</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <Button asChild className="w-full">
              <Link to="/login">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
