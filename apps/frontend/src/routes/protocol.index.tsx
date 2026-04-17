import { createFileRoute, Navigate, notFound } from "@tanstack/react-router";
import { features } from "@/config/features";

export const Route = createFileRoute("/protocol/")({
  beforeLoad: () => {
    if (!features.docsViewer) throw notFound();
  },
  component: ProtocolIndex,
});

function ProtocolIndex() {
  // Redirect to overview section
  return <Navigate to="/protocol/$section" params={{ section: "overview" }} />;
}
