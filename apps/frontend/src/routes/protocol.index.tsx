import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/protocol/")({
  component: ProtocolIndex,
});

function ProtocolIndex() {
  // Redirect to overview section
  return <Navigate to="/protocol/$section" params={{ section: "overview" }} />;
}
