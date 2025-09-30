import { createFileRoute, Outlet } from "@tanstack/react-router";
import {
  RoleLayout,
  StatsGrid,
  StatCard,
} from "../components/RoleLayout";
import { KeySetupGuard } from "../key-setup/components/KeySetupGuard";
import { InvitesView } from "../components/dashboard/InvitesView";
import { useInvites } from "../lib/patient-records";
import type { GetAllPatientRecordsQuery } from "@/graphql/graphql";

type PatientRecord = GetAllPatientRecordsQuery['patient_record'][number];
import { UserCheck, Calendar, FileText, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/receptionist")({
  component: ReceptionistLayout,
});

function ReceptionistLayout() {
  const { data: invites } = useInvites();

  const navigationItems = [
    { label: "Patient Records", href: "/receptionist", active: true },
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
              title="Active Invites"
              value={invites?.length || 0}
              description="Pending responses"
              icon={Calendar}
            />
            <StatCard
              title="Expired Invites"
              value={invites?.filter((invite: PatientRecord) => {
                return invite.invite_expires_at && new Date(invite.invite_expires_at) <= new Date()
              })?.length || 0}
              description="Need attention"
              icon={UserCheck}
            />
            <StatCard
              title="This Week"
              value={invites?.filter((invite: PatientRecord) => {
                const oneWeekAgo = new Date()
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
                return new Date(invite.created_at) >= oneWeekAgo
              })?.length || 0}
              description="New invites"
              icon={FileText}
            />
            <StatCard
              title="Response Rate"
              value="0%"
              description="Overall completion"
              icon={TrendingUp}
            />
          </StatsGrid>

          {/* Dashboard Content */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Patient Invites</h3>
            <InvitesView />
          </div>

          {/* Nested routes will render here */}
          <Outlet />
        </div>
      </RoleLayout>
    </KeySetupGuard>
  );
}
