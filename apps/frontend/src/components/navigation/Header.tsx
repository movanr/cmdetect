import { useNavigate } from "@tanstack/react-router";
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
import { LogOut, User, Settings, ChevronDown } from "lucide-react";
import { getTranslations } from "../../config/i18n";

export function Header() {
  const navigate = useNavigate();
  const { data: session } = useSession();
  const t = getTranslations();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate({ to: "/login" });
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error(t.messages.signOutFailed);
    }
  };

  const userName = session?.user?.name || session?.user?.email || t.common.user;

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="flex h-16 items-center justify-between px-4 lg:px-8">
        {/* Left side - Mobile menu button (TODO) */}
        <div className="lg:hidden">{/* Mobile menu button */}</div>

        {/* Right side - User menu */}
        <div className="ml-auto flex items-center space-x-4">
          {/* Language switcher - TODO */}

          {/* Notifications - TODO */}

          {/* User dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <span className="hidden md:inline text-sm font-medium">
                  {userName}
                </span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{userName}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {session?.user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => navigate({ to: "/settings/profile" })}
              >
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate({ to: "/settings" })}>
                <Settings className="mr-2 h-4 w-4" />
                <span>{t.nav.settings}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>{t.nav.signOut}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
