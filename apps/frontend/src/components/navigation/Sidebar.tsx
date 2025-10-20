import { Link, useRouterState } from "@tanstack/react-router";
import { useRole } from "../../contexts/RoleContext";
import { getTranslations } from "../../config/i18n";
import { cn } from "@/lib/utils";
import { FolderOpen, Mail } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
}

export function Sidebar() {
  const t = getTranslations();
  const { activeRole } = useRole();
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
  ];

  const isActive = (href: string) => {
    return currentPath.startsWith(href);
  };

  const filterByRole = (item: NavItem) => {
    if (!item.roles) return true;
    // Check if the active role matches any of the required roles
    return activeRole ? item.roles.includes(activeRole) : false;
  };

  return (
    <aside className="border-b bg-background">
      {/* Navigation */}
      <nav className="flex items-center px-4 lg:px-8 space-x-1">
        {navItems.filter(filterByRole).map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center px-4 py-3 text-sm font-medium transition-colors border-b-2",
                active
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5 mr-2 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
