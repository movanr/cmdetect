import { createFileRoute, Outlet } from "@tanstack/react-router";
import {
  RoleLayout,
  StatsGrid,
  StatCard,
} from "../components/RoleLayout";
import { KeySetupGuard } from "../key-setup/components/KeySetupGuard";
import { InvitesView } from "../components/dashboard/InvitesView";
import { SubmissionsView } from "../components/dashboard/SubmissionsView";
import { useInvites, useSubmissions } from "../lib/patient-records";
import type { GetAllPatientRecordsQuery } from "@/graphql/graphql";

type PatientRecord = GetAllPatientRecordsQuery['patient_record'][number];
import { FileText, Users, Calendar, TrendingUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/physician")({
  component: PhysicianLayout,
});

function PhysicianLayout() {
  const { data: invites } = useInvites();
  const { data: submissions } = useSubmissions();

  const navigationItems = [
    { label: "Patient Records", href: "/physician", active: true },
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
              title="Pending Invites"
              value={invites?.length || 0}
              description="Awaiting response"
              icon={Users}
            />
            <StatCard
              title="Patient Submissions"
              value={submissions?.length || 0}
              description="Ready for review"
              icon={FileText}
            />
            <StatCard
              title="Unreviewed"
              value={submissions?.filter((submission: PatientRecord) => !submission.first_viewed_at)?.length || 0}
              description="New submissions"
              icon={Calendar}
            />
            <StatCard
              title="Completion Rate"
              value={submissions && invites ?
                Math.round((submissions.length / (submissions.length + invites.length)) * 100) : 0
              }
              description="Response rate"
              icon={TrendingUp}
            />
          </StatsGrid>

          {/* Dashboard Tabs */}
          <Tabs defaultValue="submissions" className="space-y-4">
            <TabsList>
              <TabsTrigger value="submissions">Submissions</TabsTrigger>
              <TabsTrigger value="invites">Invites</TabsTrigger>
            </TabsList>
            <TabsContent value="submissions" className="space-y-4">
              <SubmissionsView />
            </TabsContent>
            <TabsContent value="invites" className="space-y-4">
              <InvitesView />
            </TabsContent>
          </Tabs>

          {/* Nested routes will render here */}
          <Outlet />
        </div>
      </RoleLayout>
    </KeySetupGuard>
  );
}
