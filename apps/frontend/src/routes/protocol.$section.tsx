import { createFileRoute } from "@tanstack/react-router";
import { MarkdownViewer } from "@/components/ui/MarkdownViewer";

// Import all German sections
import section0 from "@docs/dc-tmd/examiner-protocol/section5_0_german.md?raw";
import section1 from "@docs/dc-tmd/examiner-protocol/section5_1_german.md?raw";
import section2 from "@docs/dc-tmd/examiner-protocol/section5_2_german.md?raw";
import section3 from "@docs/dc-tmd/examiner-protocol/section5_3_german.md?raw";
import section4 from "@docs/dc-tmd/examiner-protocol/section5_4_german.md?raw";
import section5 from "@docs/dc-tmd/examiner-protocol/section5_5_german.md?raw";
import section6 from "@docs/dc-tmd/examiner-protocol/section5_6_german.md?raw";
import section7 from "@docs/dc-tmd/examiner-protocol/section5_7_german.md?raw";
import section8 from "@docs/dc-tmd/examiner-protocol/section5_8_german.md?raw";
import section9 from "@docs/dc-tmd/examiner-protocol/section5_9_german.md?raw";

const sections: Record<string, string> = {
  overview: section0,
  e1: section1,
  e2: section2,
  e3: section3,
  e4: section4,
  e5: section5,
  e6: section6,
  e7: section7,
  e8: section8,
  e9: section9,
};

export const Route = createFileRoute("/protocol/$section")({
  component: ProtocolSection,
});

function ProtocolSection() {
  const { section } = Route.useParams();
  const content = sections[section];

  if (!content) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-semibold mb-2">Sektion nicht gefunden</h1>
        <p className="text-muted-foreground">
          Die angeforderte Sektion existiert nicht.
        </p>
      </div>
    );
  }

  return <MarkdownViewer content={content} />;
}
