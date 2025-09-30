import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import {
  RoleLayout,
  StatsGrid,
  StatCard,
} from "../components/RoleLayout";
import { KeySetupGuard } from "../key-setup/components/KeySetupGuard";
import { InvitesView } from "../components/dashboard/InvitesView";
import { SubmissionsView } from "../components/dashboard/SubmissionsView";
import { UsersView } from "../components/dashboard/UsersView";
import { useInvites, useSubmissions, useUsers } from "../lib/patient-records";
import { Users, Settings, Activity, Shield, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const navigate = useNavigate();
  const { data: invites } = useInvites();
  const { data: submissions } = useSubmissions();
  const { data: users } = useUsers();

  const navigationItems = [
    { label: "Dashboard", href: "/admin", active: true },
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
              value={users?.length || 0}
              description="Active accounts"
              icon={Users}
            />
            <StatCard
              title="Pending Invites"
              value={invites?.length || 0}
              description="Awaiting response"
              icon={Activity}
            />
            <StatCard
              title="Submissions"
              value={submissions?.length || 0}
              description="Completed forms"
              icon={Shield}
            />
            <StatCard
              title="Key Status"
              value="Active"
              description="Encryption ready"
              icon={Settings}
            />
          </StatsGrid>

          {/* Dashboard Tabs */}
          <Tabs defaultValue="invites" className="space-y-4">
            <TabsList>
              <TabsTrigger value="invites">Invites</TabsTrigger>
              <TabsTrigger value="submissions">Submissions</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
            </TabsList>
            <TabsContent value="invites" className="space-y-4">
              <InvitesView />
            </TabsContent>
            <TabsContent value="submissions" className="space-y-4">
              <SubmissionsView />
            </TabsContent>
            <TabsContent value="users" className="space-y-4">
              <UsersView />
            </TabsContent>
          </Tabs>

          {/* Nested routes will render here */}
          <Outlet />
        </div>
      </RoleLayout>
    </KeySetupGuard>
  );
}
