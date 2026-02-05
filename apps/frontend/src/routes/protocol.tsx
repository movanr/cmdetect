import { createFileRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
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
  ChevronDown,
  ChevronRight,
  BookOpen,
  ListChecks,
  ClipboardList,
  MessageSquare,
  Image,
  Terminal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ProtocolContext, TableOfContents } from "@/features/protocol";

export const Route = createFileRoute("/protocol")({
  component: ProtocolLayout,
});

interface NavItem {
  section: string;
  label: string;
  icon: React.ElementType;
  description: string;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  {
    section: "section1",
    label: "1. Einführung",
    icon: BookOpen,
    description: "Überblick und Hintergrund",
  },
  {
    section: "section2",
    label: "2. Allgemeine Anweisungen",
    icon: FileText,
    description: "Untersuchungsprinzipien",
  },
  {
    section: "section3",
    label: "3. Verfahrensbeschreibung",
    icon: ListChecks,
    description: "Erläuterungen der Verfahren",
  },
  {
    section: "section4",
    label: "4. Kurzspezifikationen",
    icon: FileText,
    description: "Für klinische Routineanwendung",
  },
  {
    section: "section5",
    label: "5. Vollständige Spezifikationen",
    icon: ClipboardList,
    description: "Operationalisierte Verfahren",
    children: [
      {
        section: "overview",
        label: "Übersicht",
        icon: FileText,
        description: "Allgemeine Richtlinien & Konventionen",
      },
      {
        section: "e1",
        label: "U1",
        icon: Stethoscope,
        description: "Schmerz- und Kopfschmerzlokalisation",
      },
      {
        section: "e2",
        label: "U2",
        icon: Ruler,
        description: "Inzisale Beziehungen",
      },
      {
        section: "e3",
        label: "U3",
        icon: Move,
        description: "Mundöffnungsbewegungsmuster",
      },
      {
        section: "e4",
        label: "U4",
        icon: Move,
        description: "Mundöffnungsbewegungen",
      },
      {
        section: "e5",
        label: "U5",
        icon: ArrowLeftRight,
        description: "Lateral- & Protrusionsbewegungen",
      },
      {
        section: "e6",
        label: "U6",
        icon: Volume2,
        description: "Kiefergelenkgeräusche (Öffnung/Schluss)",
      },
      {
        section: "e7",
        label: "U7",
        icon: Volume2,
        description: "Kiefergelenkgeräusche (Lateral/Protrusion)",
      },
      {
        section: "e8",
        label: "U8",
        icon: Lock,
        description: "Kiefergelenkblockierungen",
      },
      {
        section: "e9",
        label: "U9",
        icon: Hand,
        description: "Muskel- & Kiefergelenkpalpation",
      },
    ],
  },
  {
    section: "section6",
    label: "6. Schmerzbefragung",
    icon: MessageSquare,
    description: "Strukturierte Befragung",
  },
  {
    section: "section7",
    label: "7. Abbildungen",
    icon: Image,
    description: "Illustrationen",
  },
  {
    section: "section8",
    label: "8. Untersuchungsanweisungen",
    icon: Terminal,
    description: "Erforderliche Anweisungen",
  },
];

// Section 5 child sections for tracking active state
const section5Children = navItems.find(n => n.section === "section5")?.children?.map(c => c.section) ?? [];

function ProtocolLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["section5"]));
  const [currentContent, setCurrentContent] = useState("");

  const getCurrentSection = () => {
    const match = currentPath.match(/\/protocol\/([^/]+)/);
    if (match) return match[1];
    if (currentPath === "/protocol" || currentPath === "/protocol/") return "overview";
    return null;
  };

  const currentSection = getCurrentSection();

  const toggleExpanded = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const renderNavItem = (item: NavItem) => {
    const Icon = item.icon;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedSections.has(item.section);
    const isActive = currentSection === item.section;
    const isChildActive = hasChildren && section5Children.includes(currentSection ?? "");

    // If this is a parent section and a child is active, highlight the parent
    const isParentHighlighted = item.section === "section5" && isChildActive;

    return (
      <div key={item.section}>
        <div
          className={cn(
            "flex items-start gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
            "hover:bg-accent hover:text-accent-foreground cursor-pointer",
            (isActive || isParentHighlighted) && "bg-accent/50 text-accent-foreground"
          )}
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.section);
              // Navigate to overview when expanding section 5
              if (!isExpanded && item.section === "section5") {
                navigate({ to: "/protocol/$section", params: { section: "overview" } });
              }
            } else {
              navigate({ to: "/protocol/$section", params: { section: item.section } });
            }
          }}
        >
          {hasChildren ? (
            <span className="mt-0.5">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </span>
          ) : (
            <Icon className="h-4 w-4 mt-0.5 shrink-0" />
          )}
          <div className="min-w-0 flex-1">
            <div className="font-medium">{item.label}</div>
            <div className="text-xs text-muted-foreground truncate">{item.description}</div>
          </div>
        </div>
        {hasChildren && isExpanded && item.children && (
          <div className="mt-1 space-y-1">
            {item.children.map(child => {
              const ChildIcon = child.icon;
              const isChildActive = currentSection === child.section;
              return (
                <Link
                  key={child.section}
                  to="/protocol/$section"
                  params={{ section: child.section }}
                  className={cn(
                    "flex items-start gap-3 rounded-lg px-3 py-2 text-sm transition-colors ml-6",
                    "hover:bg-accent hover:text-accent-foreground",
                    isChildActive && "bg-accent text-accent-foreground"
                  )}
                >
                  <ChildIcon className="h-4 w-4 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <div className="font-medium">{child.label}</div>
                    <div className="text-xs text-muted-foreground truncate">{child.description}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <ProtocolContext.Provider value={{ currentContent, setCurrentContent }}>
      <div className="flex h-screen overflow-hidden">
        {/* Left sidebar - navigation */}
        <aside className="w-80 border-r bg-muted/30 flex flex-col overflow-hidden shrink-0">
          <div className="p-4 border-b">
            <Button
              variant="ghost"
              size="sm"
              className="mb-2"
              onClick={() => {
                const returnUrl = sessionStorage.getItem("protocol-return-url") || "/";
                navigate({ to: returnUrl });
              }}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Zurück
            </Button>
            <h2 className="font-semibold text-lg">DC/TMD Protokoll</h2>
            <p className="text-sm text-muted-foreground">Klinische Untersuchung (Deutsch)</p>
          </div>
          <ScrollArea className="flex-1 h-0 min-h-0">
            <nav className="p-2 space-y-1">{navItems.map(item => renderNavItem(item))}</nav>
          </ScrollArea>
        </aside>

        {/* Main content area */}
        <main className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="max-w-4xl mx-auto p-8">
              <Outlet />
            </div>
          </ScrollArea>
        </main>

        {/* Right sidebar - table of contents */}
        <TableOfContents content={currentContent} />
      </div>
    </ProtocolContext.Provider>
  );
}
