import { Link } from "@tanstack/react-router";
import { useSession, signOut } from "../lib/auth";
import { useRole, type UserRole } from "../contexts/RoleContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  LogOut,
  Shield,
  Stethoscope,
  UserCheck,
  AlertTriangle,
} from "lucide-react";
import logoSvg from "../assets/logo.svg";

interface NavigationHeaderProps {
  session: any;
  onSignOut: () => void;
}

export function NavigationHeader({
  session,
  onSignOut,
}: NavigationHeaderProps) {
  return (
    <header className="border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-3">
          <img src={logoSvg} className="h-8 w-8" alt="CMDetect logo" />
          <h1 className="text-xl font-semibold">CMDetect</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-muted-foreground">
            {session.user?.name || session.user?.email || "User"}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onSignOut}
            className="h-8"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
}

interface RoleCardProps {
  to: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  variant: "admin" | "physician" | "receptionist" | "unverified";
}

const variantStyles = {
  admin: "hover:border-red-200 group-hover:bg-red-50/50",
  physician: "hover:border-green-200 group-hover:bg-green-50/50",
  receptionist: "hover:border-blue-200 group-hover:bg-blue-50/50",
  unverified: "hover:border-amber-200 group-hover:bg-amber-50/50",
};

function RoleCard({ to, icon, title, description, variant }: RoleCardProps) {
  return (
    <Link to={to} className="group block">
      <Card
        className={`transition-all duration-200 hover:shadow-md ${variantStyles[variant]}`}
      >
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">{icon}</div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground group-hover:text-foreground/90">
                {title}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {description}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

interface RoleNavigationProps {
  availableRoles: UserRole[];
  hasRole: (role: UserRole) => boolean;
}

export function RoleNavigation({
  availableRoles,
  hasRole,
}: RoleNavigationProps) {
  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-2 mb-8">
          <h2 className="text-2xl font-semibold tracking-tight">
            Select Your Workspace
          </h2>
          <div className="flex items-center space-x-2 text-muted-foreground">
            <span>Choose which area you'd like to work in.</span>
            {availableRoles.length > 0 && (
              <>
                <span>Your roles:</span>
                <div className="flex gap-1">
                  {availableRoles.map((role) => (
                    <Badge key={role} variant="secondary" className="text-xs">
                      {role.replace("_", " ")}
                    </Badge>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {availableRoles.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
            {hasRole("org_admin") && (
              <RoleCard
                to="/admin"
                icon={<Shield className="h-8 w-8 text-red-600" />}
                title="Organization Admin"
                description="Manage users, settings, and system configuration"
                variant="admin"
              />
            )}

            {hasRole("physician") && (
              <RoleCard
                to="/physician"
                icon={<Stethoscope className="h-8 w-8 text-green-600" />}
                title="Physician Portal"
                description="View patient records and review questionnaires"
                variant="physician"
              />
            )}

            {hasRole("receptionist") && (
              <RoleCard
                to="/receptionist"
                icon={<UserCheck className="h-8 w-8 text-blue-600" />}
                title="Reception Desk"
                description="Create patient records and manage appointments"
                variant="receptionist"
              />
            )}

            {hasRole("unverified") && (
              <RoleCard
                to="/unverified"
                icon={<AlertTriangle className="h-8 w-8 text-amber-600" />}
                title="Account Verification"
                description="Complete your account verification process"
                variant="unverified"
              />
            )}
          </div>
        ) : (
          <Card className="border-amber-200 bg-amber-50/50">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-amber-900">
                    No Roles Assigned
                  </h3>
                  <p className="text-sm text-amber-700 mt-1">
                    Contact your administrator to get role access.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const { availableRoles, activeRole } = useRole();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out");
    }
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader session={session} onSignOut={handleSignOut} />
      {children}

      {/* Debug Panel in Development */}
      {process.env.NODE_ENV === "development" && (
        <>
          <Separator className="mt-8" />
          <div className="container py-4">
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <h3 className="text-sm font-medium mb-2">Debug Information</h3>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Active Role: {activeRole || "None"}</p>
                  <p>Available Roles: [{availableRoles.join(", ")}]</p>
                  <p>User ID: {session.user.id}</p>
                  <p>Email: {session.user.email}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
