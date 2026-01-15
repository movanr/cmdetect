import { createFileRoute } from "@tanstack/react-router";
import { ExaminationFormPage } from "../features/examination";

export const Route = createFileRoute("/examination")({
  component: ExaminationPage,
});

function ExaminationPage() {
  return (
    <div className="container mx-auto max-w-5xl py-8">
      <ExaminationFormPage
        onSubmit={(values) => {
          console.log("Examination submitted:", values);
        }}
      />
    </div>
  );
}
