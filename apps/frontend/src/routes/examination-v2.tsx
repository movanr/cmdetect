import { createFileRoute } from "@tanstack/react-router";
import { ExaminationForm } from "../features/examination-v2";

export const Route = createFileRoute("/examination-v2")({
  component: ExaminationV2Page,
});

function ExaminationV2Page() {
  const handleComplete = (values: unknown) => {
    console.log("Examination complete:", values);
  };

  return (
    <div className="container mx-auto max-w-5xl py-8">
      <h1 className="text-2xl font-bold mb-6">Examination V2 (Test)</h1>
      <ExaminationForm onComplete={handleComplete} />
    </div>
  );
}
