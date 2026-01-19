import { useNavigate, Link } from "@tanstack/react-router";
import { useSession, signOut } from "../../lib/auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { LogOut, Shield, ChevronDown, Users, Settings } from "lucide-react";
import { getTranslations, interpolate } from "../../config/i18n";
import { useRole, type UserRole } from "../../contexts/RoleContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import logoSvg from "../../assets/logo.svg";
import { roles } from "@cmdetect/config";

export function Header() {
  const navigate = useNavigate();
  const { data: session } = useSession();
  const t = getTranslations();
  const { activeRole, availableRoles, switchRole } = useRole();
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [pendingRole, setPendingRole] = useState<UserRole | null>(null);
  const [password, setPassword] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const roleLabels: Record<UserRole, string> = {
    [roles.ORG_ADMIN]: t.roles[roles.ORG_ADMIN].title,
    [roles.PHYSICIAN]: t.roles[roles.PHYSICIAN].title,
    [roles.RECEPTIONIST]: t.roles[roles.RECEPTIONIST].title,
    [roles.UNVERIFIED]: t.roles[roles.UNVERIFIED].title,
  };

  // Roles that require password confirmation
  const privilegedRoles: UserRole[] = [roles.ORG_ADMIN];

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate({ to: "/login" });
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error(t.messages.signOutFailed);
    }
  };

  const handleRoleSwitch = async (role: UserRole) => {
    // Check if switching to a privileged role
    if (privilegedRoles.includes(role)) {
      setPendingRole(role);
      setShowPasswordDialog(true);
      return;
    }

    // No password needed for non-privileged roles
    await performRoleSwitch(role);
  };

  const performRoleSwitch = async (role: UserRole) => {
    const success = await switchRole(role);
    if (success) {
      // Reload the page to apply the new role
      window.location.reload();
    } else {
      toast.error(t.messages.roleSwitchFailed);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingRole || !session?.user?.email) return;

    setIsVerifying(true);
    try {
      // Verify password by attempting to sign in
      const response = await fetch(
        `${import.meta.env.VITE_AUTH_SERVER_URL || "http://localhost:3001"}/api/auth/sign-in/email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: session.user.email,
            password: password,
          }),
          credentials: "include",
        }
      );

      if (!response.ok) {
        toast.error(t.passwordConfirmation.incorrectPassword);
        setPassword("");
        return;
      }

      // Password correct, proceed with role switch
      setShowPasswordDialog(false);
      setPassword("");
      await performRoleSwitch(pendingRole);
      setPendingRole(null);
    } catch (error) {
      console.error("Password verification error:", error);
      toast.error(t.passwordConfirmation.verificationError);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCancelPasswordDialog = () => {
    setShowPasswordDialog(false);
    setPassword("");
    setPendingRole(null);
  };

  const userName = session?.user?.name || session?.user?.email || t.common.user;

  return (
    <>
      {/* Password Confirmation Modal */}
      {showPasswordDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50"
            onClick={handleCancelPasswordDialog}
          />

          {/* Modal */}
          <div className="relative z-50 w-full max-w-md bg-background rounded-lg shadow-lg p-6 m-4">
            <h2 className="text-lg font-semibold mb-2">{t.passwordConfirmation.title}</h2>
            <p className="text-sm text-muted-foreground mb-4">
              {interpolate(t.passwordConfirmation.description, {
                role: pendingRole ? roleLabels[pendingRole] : "",
              })}
            </p>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">{t.passwordConfirmation.passwordLabel}</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.passwordConfirmation.passwordPlaceholder}
                  disabled={isVerifying}
                  autoFocus
                  required
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelPasswordDialog}
                  disabled={isVerifying}
                >
                  {t.passwordConfirmation.cancel}
                </Button>
                <Button type="submit" disabled={isVerifying || !password}>
                  {isVerifying ? t.passwordConfirmation.verifying : t.passwordConfirmation.confirm}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="flex h-16 items-center justify-between px-4 lg:px-8">
          {/* Left side - Logo and Brand */}
          <Link to="/cases" className="flex items-center space-x-3">
            <img
              src={logoSvg}
              className="h-8 w-8"
              alt={`${t.nav.appName} logo`}
            />
            <span className="text-xl font-semibold">{t.nav.appName}</span>
          </Link>

          {/* Right side - User menu */}
          <div className="flex items-center space-x-4">
            {/* Language switcher - TODO */}

            {/* Notifications - TODO */}

            {/* User dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2 min-h-[44px] min-w-[44px] px-2 md:px-3"
                >
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:inline text-sm font-medium">
                    {userName}
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session?.user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                {/* Team - only show for org_admin */}
                {activeRole === roles.ORG_ADMIN && (
                  <DropdownMenuItem
                    onClick={() => navigate({ to: "/team" })}
                    className="min-h-[44px] py-3"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    <span>{t.nav.team}</span>
                  </DropdownMenuItem>
                )}

                {/* Settings */}
                <DropdownMenuItem
                  onClick={() => navigate({ to: "/settings" })}
                  className="min-h-[44px] py-3"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  <span>{t.nav.settings}</span>
                </DropdownMenuItem>

                {/* Role Switcher - only show if user has multiple roles */}
                {availableRoles.length > 1 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="text-xs text-muted-foreground">
                      {t.nav.switchRole}
                    </DropdownMenuLabel>
                    {availableRoles.map((role) => (
                      <DropdownMenuItem
                        key={role}
                        onClick={() => handleRoleSwitch(role)}
                        disabled={role === activeRole}
                        className="min-h-[44px] py-3"
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        {roleLabels[role]}
                        {role === activeRole && (
                          <span className="ml-auto text-xs text-muted-foreground">
                            {t.common.active}
                          </span>
                        )}
                      </DropdownMenuItem>
                    ))}
                  </>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="min-h-[44px] py-3"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t.nav.signOut}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
    </>
  );
}
