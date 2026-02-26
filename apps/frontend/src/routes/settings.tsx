import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { AppLayout } from "../components/layouts/AppLayout";
import { getTranslations } from "../config/i18n";
import { cn } from "@/lib/utils";
import { User, Lock, Building } from "lucide-react";
import { useRole, type UserRole } from "../contexts/RoleContext";
import { roles } from "@cmdetect/config";

export const Route = createFileRoute("/settings")({
  component: SettingsLayout,
});

function SettingsLayout() {
  const t = getTranslations();
  const { hasRole } = useRole();

  const settingsNav = [
    {
      label: t.settingsSections.profile,
      href: "/settings/profile",
      icon: User,
    },
    {
      label: t.settingsSections.security,
      href: "/settings/security",
      icon: Lock,
    },
    {
      label: t.settingsSections.organization,
      href: "/settings/organization",
      icon: Building,
      roles: [roles.ORG_ADMIN],
    },
  ];

  const filterByRole = (item: typeof settingsNav[0]) => {
    if (!item.roles) return true;
    return item.roles.some((role) => hasRole(role as UserRole));
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {t.nav.settings}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t.pageDescriptions.settings}
          </p>
        </div>

        {/* Settings navigation */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar navigation */}
          <aside className="lg:w-64 space-y-1">
            {settingsNav.filter(filterByRole).map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  activeProps={{
                    className: "bg-primary text-primary-foreground",
                  }}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.label}
                </Link>
              );
            })}
          </aside>

          {/* Content area */}
          <div className="flex-1">
            <Outlet />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
