import { createFileRoute, Outlet } from "@tanstack/react-router";
import {
  RoleLayout,
  StatsGrid,
  StatCard,
  EmptyState,
} from "../components/RoleLayout";
import { KeySetupGuard } from "../key-setup/components/KeySetupGuard";
import { UserCheck, Calendar, FileText, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/receptionist")({
  component: ReceptionistLayout,
});

function ReceptionistLayout() {
  const navigationItems = [
    { label: "Patient Records", href: "/receptionist", active: true },
    { label: "Appointments", href: "/receptionist/appointments", active: false },
    { label: "Check-ins", href: "/receptionist/checkins", active: false },
    { label: "Reports", href: "/receptionist/reports", active: false },
  ];

  return (
    <KeySetupGuard>
      <RoleLayout
        requiredRole="receptionist"
        title="Reception Desk"
        description="Manage patient records, appointments, and check-ins"
        navigationItems={navigationItems}
      >
        <div className="space-y-6">
          {/* Stats Overview */}
          <StatsGrid>
            <StatCard
              title="Scheduled Today"
              value="18"
              description="Appointments"
              icon={Calendar}
              trend={{ value: 3, isPositive: true }}
            />
            <StatCard
              title="Checked In"
              value="12"
              description="Patients waiting"
              icon={UserCheck}
            />
            <StatCard
              title="New Patients"
              value="5"
              description="This week"
              icon={FileText}
              trend={{ value: 2, isPositive: true }}
            />
            <StatCard
              title="Efficiency"
              value="96%"
              description="On-time rate"
              icon={TrendingUp}
              trend={{ value: 1, isPositive: true }}
            />
          </StatsGrid>

          {/* Recent Activity */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Recent Activity</h3>
            <EmptyState
              icon={Calendar}
              title="No recent appointments"
              description="Patient appointments and check-ins will appear here when scheduled."
            />
          </div>

          {/* Nested routes will render here */}
          <Outlet />
        </div>
      </RoleLayout>
    </KeySetupGuard>
  );
}
