import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FileText,
  Stethoscope,
  Ruler,
  Move,
  ArrowLeftRight,
  Volume2,
  Lock,
  Hand,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/protocol")({
  component: ProtocolLayout,
});

interface NavItem {
  section: string;
  label: string;
  icon: React.ElementType;
  description: string;
}

const navItems: NavItem[] = [
  {
    section: "overview",
    label: "Einleitung",
    icon: FileText,
    description: "Allgemeine Richtlinien & Konventionen",
  },
  {
    section: "e1",
    label: "E1",
    icon: Stethoscope,
    description: "Schmerz- und Kopfschmerzlokalisation",
  },
  {
    section: "e2",
    label: "E2",
    icon: Ruler,
    description: "Inzisale Beziehungen",
  },
  {
    section: "e3",
    label: "E3",
    icon: Move,
    description: "Mundöffnungsbewegungsmuster",
  },
  {
    section: "e4",
    label: "E4",
    icon: Move,
    description: "Mundöffnungsbewegungen",
  },
  {
    section: "e5",
    label: "E5",
    icon: ArrowLeftRight,
    description: "Lateral- & Protrusionsbewegungen",
  },
  {
    section: "e6",
    label: "E6",
    icon: Volume2,
    description: "Kiefergelenkgeräusche (Öffnung/Schluss)",
  },
  {
    section: "e7",
    label: "E7",
    icon: Volume2,
    description: "Kiefergelenkgeräusche (Lateral/Protrusion)",
  },
  {
    section: "e8",
    label: "E8",
    icon: Lock,
    description: "Kiefergelenkblockierungen",
  },
  {
    section: "e9",
    label: "E9",
    icon: Hand,
    description: "Muskel- & Kiefergelenkpalpation",
  },
];

function ProtocolLayout() {
  const location = useLocation();
  const currentPath = location.pathname;

  const getCurrentSection = () => {
    const match = currentPath.match(/\/protocol\/([^/]+)/);
    if (match) return match[1];
    if (currentPath === "/protocol" || currentPath === "/protocol/") return "overview";
    return null;
  };

  const currentSection = getCurrentSection();

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-80 border-r bg-muted/30 flex flex-col overflow-hidden">
        <div className="p-4 border-b">
          <Button variant="ghost" size="sm" asChild className="mb-2">
            <Link to="/">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Zurück
            </Link>
          </Button>
          <h2 className="font-semibold text-lg">DC/TMD Protokoll</h2>
          <p className="text-sm text-muted-foreground">
            Klinische Untersuchung (Deutsch)
          </p>
        </div>
        <ScrollArea className="flex-1 h-0 min-h-0">
          <nav className="p-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentSection === item.section;
              return (
                <Link
                  key={item.section}
                  to="/protocol/$section"
                  params={{ section: item.section }}
                  className={cn(
                    "flex items-start gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    isActive && "bg-accent text-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {item.description}
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>
      </aside>
      <main className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="max-w-4xl mx-auto p-8">
            <Outlet />
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
