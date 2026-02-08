import { MarkdownViewer } from "@/components/ui/MarkdownViewer";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import scoringManual from "@docs/dc-tmd/self-report-scoring-manual/self-report-scoring-manual.md?raw";

export const Route = createFileRoute("/docs/scoring-manual")({
  component: ScoringManualPage,
});

// ─── Sidebar navigation items ─────────────────────────────────────────

interface NavItem {
  id: string;
  label: string;
  indent?: boolean;
}

const navItems: NavItem[] = [
  { id: "introduction", label: "Introduction" },
  { id: "description-and-scoring-rules", label: "Scoring Rules" },
  { id: "tmd-pain-screener", label: "TMD Pain Screener", indent: true },
  { id: "dctmd-symptom-questionnaire", label: "Symptom Questionnaire (SQ)", indent: true },
  { id: "pain-drawing", label: "Pain Drawing", indent: true },
  { id: "gcps-graded-chronic-pain-scale", label: "GCPS", indent: true },
  { id: "jfls-jaw-functional-limitation-scale", label: "JFLS", indent: true },
  { id: "phq-9-depression", label: "PHQ-9 Depression", indent: true },
  { id: "gad-7-anxiety", label: "GAD-7 Anxiety", indent: true },
  { id: "phq-4-distress-depression-anxiety", label: "PHQ-4 Distress", indent: true },
  { id: "phq-15-physical-symptoms", label: "PHQ-15 Physical Symptoms", indent: true },
  { id: "obc-oral-behaviors-checklist", label: "OBC", indent: true },
  { id: "appendix-1-summary-of-scoring-rules", label: "Anhang 1: Scoring-Übersicht" },
  { id: "appendix-2-scoring-worksheet", label: "Anhang 2: Scoring-Arbeitsblatt" },
  { id: "appendix-3-scoring-report-form", label: "Anhang 3: Scoring-Bericht" },
  { id: "appendix-4-changes-to-this-document", label: "Anhang 4: Änderungen" },
];

// ─── Component ────────────────────────────────────────────────────────

function ScoringManualPage() {
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState<string>("introduction");
  const mainRef = useRef<HTMLDivElement>(null);

  // Handle hash navigation on mount
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;

    const id = hash.slice(1);
    setActiveId(id);

    let attempts = 0;
    const tryScroll = () => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      } else if (attempts < 10) {
        attempts++;
        setTimeout(tryScroll, 100);
      }
    };
    setTimeout(tryScroll, 50);
  }, []);

  // Track which section is in view via IntersectionObserver
  // ScrollArea creates its own scroll container, so we must use it as the observer root
  useEffect(() => {
    const viewport = mainRef.current?.querySelector<HTMLElement>(
      '[data-slot="scroll-area-viewport"]',
    );
    if (!viewport) return;

    const ids = navItems.map((item) => item.id);
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      { root: viewport, rootMargin: "-10% 0px -80% 0px" },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      window.history.pushState(null, "", `#${id}`);
      setActiveId(id);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left sidebar — section navigation */}
      <aside className="w-72 border-r bg-muted/30 flex flex-col overflow-hidden shrink-0">
        <div className="p-4 border-b">
          <Button
            variant="ghost"
            size="sm"
            className="mb-2"
            onClick={() => {
              const returnUrl = sessionStorage.getItem("docs-return-url") || "/";
              navigate({ to: returnUrl });
            }}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Zurück
          </Button>
          <h2 className="font-semibold text-lg">Scoring Manual</h2>
          <p className="text-sm text-muted-foreground">
            Selbstberichtsfragebögen
          </p>
        </div>
        <ScrollArea className="flex-1 h-0 min-h-0">
          <nav className="p-2 space-y-0.5">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollTo(item.id)}
                className={cn(
                  "w-full text-left rounded-md px-3 py-1.5 text-sm transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  item.indent && "ml-3 text-xs",
                  activeId === item.id
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground",
                )}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </ScrollArea>
      </aside>

      {/* Main content area */}
      <main ref={mainRef} className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="max-w-4xl mx-auto p-8">
            <MarkdownViewer content={scoringManual} />
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
