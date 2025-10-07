import { Link, useRouterState } from "@tanstack/react-router";
import { useRole } from "../../contexts/RoleContext";
import { getTranslations } from "../../config/i18n";
import { cn } from "@/lib/utils";
import { Mail, FolderOpen, Users, Settings, Shield } from "lucide-react";
import logoSvg from "../../assets/logo.svg";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
}

export function Sidebar() {
  const t = getTranslations();
  const { activeRole, hasRole } = useRole();
  const router = useRouterState();
  const currentPath = router.location.pathname;

  const navItems: NavItem[] = [
    {
      label: t.nav.cases,
      href: "/cases",
      icon: FolderOpen,
      roles: ["org_admin", "physician"],
    },
    {
      label: t.nav.invites,
      href: "/invites",
      icon: Mail,
    },
    {
      label: t.nav.team,
      href: "/team",
      icon: Users,
      roles: ["org_admin"],
    },
  ];

  const bottomNavItems: NavItem[] = [
    {
      label: t.nav.settings,
      href: "/settings",
      icon: Settings,
    },
    {
      label: t.nav.admin,
      href: "/admin",
      icon: Shield,
      roles: ["org_admin"],
    },
  ];

  const isActive = (href: string) => {
    return currentPath.startsWith(href);
  };

  const filterByRole = (item: NavItem) => {
    if (!item.roles) return true;
    return item.roles.some((role) => hasRole(role as any));
  };

  return (
    <>
      {/* Mobile sidebar - TODO: Implement drawer/sheet */}
      <div className="lg:hidden">{/* Mobile menu button will go here */}</div>

      {/* Desktop sidebar - Fixed */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col border-r bg-background">
        <div className="flex flex-col flex-1 min-h-0">
          {/* Logo */}
          <div className="flex items-center h-16 px-6 border-b">
            <div className="flex items-center space-x-3">
              <img
                src={logoSvg}
                className="h-8 w-8"
                alt={`${t.nav.appName} logo`}
              />
              <span className="text-xl font-semibold">{t.nav.appName}</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navItems.filter(filterByRole).map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Bottom navigation */}
          <div className="px-4 py-4 space-y-1 border-t">
            {bottomNavItems.filter(filterByRole).map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </aside>
    </>
  );
}
