import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRole } from "../../contexts/RoleContext";
import { AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/settings/organization")({
  component: OrganizationSettings,
});

function OrganizationSettings() {
  const { hasRole } = useRole();

  if (!hasRole("org_admin")) {
    return (
      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-900">Access Denied</h3>
              <p className="text-sm text-amber-700 mt-1">
                You need administrator privileges to access organization settings.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organization Settings</CardTitle>
        <CardDescription>
          Manage organization-wide settings and configuration
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Organization settings content will go here
        </p>
      </CardContent>
    </Card>
  );
}
