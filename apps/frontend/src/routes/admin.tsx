import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import {
  RoleLayout,
  StatsGrid,
  StatCard,
  EmptyState,
} from "../components/RoleLayout";
import { KeySetupGuard } from "../key-setup/components/KeySetupGuard";
import { Users, Settings, Activity, Shield, Key } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const navigate = useNavigate();
  const navigationItems = [
    { label: "Dashboard", href: "/admin", active: true },
    { label: "User Management", href: "/admin/users", active: false },
    { label: "Organization Settings", href: "/admin/settings", active: false },
    { label: "System Configuration", href: "/admin/config", active: false },
  ];

  return (
    <KeySetupGuard>
      <RoleLayout
        requiredRole="org_admin"
        title="Organization Admin"
        description="Manage users, settings, and system configuration"
        navigationItems={navigationItems}
      >
      <div className="space-y-6">
        {/* Manual Key Setup Button */}
        <div className="flex justify-end">
          <Button
            onClick={() => navigate({ to: "/key-setup" })}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Key className="h-4 w-4" />
            Setup Encryption Keys
          </Button>
        </div>

        {/* Stats Overview */}
        <StatsGrid>
            <StatCard
              title="Total Users"
              value="24"
              description="Active accounts"
              icon={Users}
              trend={{ value: 12, isPositive: true }}
            />
            <StatCard
              title="Active Sessions"
              value="18"
              description="Currently online"
              icon={Activity}
            />
            <StatCard
              title="System Health"
              value="98.9%"
              description="Uptime this month"
              icon={Shield}
              trend={{ value: 0.2, isPositive: true }}
            />
            <StatCard
              title="Configurations"
              value="12"
              description="Total settings"
              icon={Settings}
            />
          </StatsGrid>

          {/* Recent Activity */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Recent Activity</h3>
            <EmptyState
              icon={Activity}
              title="No recent activity"
              description="System activity and user actions will appear here when they occur."
            />
          </div>

          {/* Nested routes will render here */}
          <Outlet />
        </div>
      </RoleLayout>
    </KeySetupGuard>
  );
}
