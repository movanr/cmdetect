import { useExaminationForm } from "../form/use-examination-form";

export function E4Section() {
  const { form, paths, validateStep } = useExaminationForm();

  // Use path helpers instead of hardcoded strings
  const leftPaths = paths.bySide("left");
  const measurements = paths.measurements();
  const interviewQuestions = paths.interviewQuestions("maxUnassisted");

  // Safe path access - throws if invalid, returns typed path
  const painFreePath = paths.get("e4.painFree.measurement");

  // Watch using validated paths
  const painFreeValue = form.watch(painFreePath);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">E4 Section (Placeholder)</h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-medium">Measurements ({measurements.length})</h3>
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
            {JSON.stringify(measurements, null, 2)}
          </pre>
        </div>

        <div>
          <h3 className="font-medium">Left Side Paths ({leftPaths.length})</h3>
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
            {JSON.stringify(leftPaths, null, 2)}
          </pre>
        </div>
      </div>

      <div>
        <h3 className="font-medium">
          MaxUnassisted Interview Questions ({interviewQuestions.length})
        </h3>
        <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
          {JSON.stringify(interviewQuestions, null, 2)}
        </pre>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          className="px-3 py-1 bg-blue-500 text-white rounded"
          onClick={() => validateStep("e4a")}
        >
          Validate E4a
        </button>
        <button
          type="button"
          className="px-3 py-1 bg-blue-500 text-white rounded"
          onClick={() => validateStep("e4b-interview")}
        >
          Validate E4b Interview
        </button>
      </div>

      <div>
        <h3 className="font-medium">Current Values</h3>
        <pre className="text-xs bg-gray-100 p-2 rounded">
          painFree.measurement: {JSON.stringify(painFreeValue)}
        </pre>
      </div>
    </div>
  );
}
