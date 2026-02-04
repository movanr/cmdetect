import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { ProtocolMarkdownViewer, useProtocolContext } from "@/features/protocol";

// Import Section 5 subsections (existing German official translations)
import section5_0 from "@docs/dc-tmd/examiner-protocol/german/extracted/section5_0_german.md?raw";
import section5_1 from "@docs/dc-tmd/examiner-protocol/german/extracted/section5_1_german.md?raw";
import section5_2 from "@docs/dc-tmd/examiner-protocol/german/extracted/section5_2_german.md?raw";
import section5_3 from "@docs/dc-tmd/examiner-protocol/german/extracted/section5_3_german.md?raw";
import section5_4 from "@docs/dc-tmd/examiner-protocol/german/extracted/section5_4_german.md?raw";
import section5_5 from "@docs/dc-tmd/examiner-protocol/german/extracted/section5_5_german.md?raw";
import section5_6 from "@docs/dc-tmd/examiner-protocol/german/extracted/section5_6_german.md?raw";
import section5_7 from "@docs/dc-tmd/examiner-protocol/german/extracted/section5_7_german.md?raw";
import section5_8 from "@docs/dc-tmd/examiner-protocol/german/extracted/section5_8_german.md?raw";
import section5_9 from "@docs/dc-tmd/examiner-protocol/german/extracted/section5_9_german.md?raw";

// Import translated sections 1-4, 6-8 (unofficial translations)
import section1 from "@docs/dc-tmd/examiner-protocol/german/translated/section1_german_unofficial.md?raw";
import section2 from "@docs/dc-tmd/examiner-protocol/german/translated/section2_german_unofficial.md?raw";
import section3 from "@docs/dc-tmd/examiner-protocol/german/translated/section3_german_unofficial.md?raw";
import section4 from "@docs/dc-tmd/examiner-protocol/german/translated/section4_german_unofficial.md?raw";
import section6 from "@docs/dc-tmd/examiner-protocol/german/translated/section6_german_unofficial.md?raw";
import section7 from "@docs/dc-tmd/examiner-protocol/german/translated/section7_german_unofficial.md?raw";
import section8 from "@docs/dc-tmd/examiner-protocol/german/translated/section8_german_unofficial.md?raw";

const sections: Record<string, string> = {
  // Top-level sections (translated)
  section1,
  section2,
  section3,
  section4,
  section6,
  section7,
  section8,
  // Section 5 subsections (official German)
  overview: section5_0,
  e1: section5_1,
  e2: section5_2,
  e3: section5_3,
  e4: section5_4,
  e5: section5_5,
  e6: section5_6,
  e7: section5_7,
  e8: section5_8,
  e9: section5_9,
};

export const Route = createFileRoute("/protocol/$section")({
  component: ProtocolSection,
});

function ProtocolSection() {
  const { section } = Route.useParams();
  const content = sections[section];
  const { setCurrentContent } = useProtocolContext();

  // Update the context with current content for ToC
  useEffect(() => {
    setCurrentContent(content || "");
    return () => setCurrentContent("");
  }, [content, setCurrentContent]);

  // Handle hash navigation on mount and when section changes
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;

    const id = hash.slice(1);

    // Try to scroll to element, retrying if not found yet (content may still be rendering)
    let attempts = 0;
    const maxAttempts = 10;
    const tryScroll = () => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      } else if (attempts < maxAttempts) {
        attempts++;
        setTimeout(tryScroll, 100);
      }
    };

    // Start after a small initial delay
    setTimeout(tryScroll, 50);
  }, [section]);

  if (!content) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-semibold mb-2">Sektion nicht gefunden</h1>
        <p className="text-muted-foreground">Die angeforderte Sektion existiert nicht.</p>
      </div>
    );
  }

  return <ProtocolMarkdownViewer content={content} />;
}
