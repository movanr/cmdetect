import { createFileRoute, Outlet } from "@tanstack/react-router";
import {
  RoleLayout,
  StatsGrid,
  StatCard,
  EmptyState,
} from "../components/RoleLayout";
import { KeySetupGuard } from "../key-setup/components/KeySetupGuard";
import { FileText, Users, Calendar, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/physician")({
  component: PhysicianLayout,
});

function PhysicianLayout() {
  const navigationItems = [
    { label: "Patient Records", href: "/physician", active: true },
    { label: "Assigned Cases", href: "/physician/cases", active: false },
    {
      label: "Questionnaires",
      href: "/physician/questionnaires",
      active: false,
    },
    { label: "Reports", href: "/physician/reports", active: false },
  ];

  return (
    <KeySetupGuard>
      <RoleLayout
        requiredRole="physician"
        title="Physician Portal"
        description="View and manage patient records, review questionnaires, and handle assigned cases"
        navigationItems={navigationItems}
      >
        <div className="space-y-6">
          {/* Stats Overview */}
          <StatsGrid>
            <StatCard
              title="Assigned Patients"
              value="32"
              description="Active cases"
              icon={Users}
              trend={{ value: 5, isPositive: true }}
            />
            <StatCard
              title="Pending Reviews"
              value="8"
              description="Questionnaires to review"
              icon={FileText}
            />
            <StatCard
              title="Appointments"
              value="12"
              description="This week"
              icon={Calendar}
              trend={{ value: 3, isPositive: true }}
            />
            <StatCard
              title="Completion Rate"
              value="94%"
              description="This month"
              icon={TrendingUp}
              trend={{ value: 2, isPositive: true }}
            />
          </StatsGrid>

          {/* Recent Cases */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Recent Cases</h3>
            <EmptyState
              icon={FileText}
              title="No recent cases"
              description="Patient cases and medical records will appear here when assigned to you."
            />
          </div>

          {/* Nested routes will render here */}
          <Outlet />
        </div>
      </RoleLayout>
    </KeySetupGuard>
  );
}
