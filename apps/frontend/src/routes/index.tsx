import { createFileRoute, Link } from "@tanstack/react-router";
import "../App.css";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  return (
    <div className="p-2">
      <h3>Welcome Home!</h3>
      <Link
        to="/submissions"
        className="block mt-4 text-blue-600 hover:underline"
      >
        View Submissions
      </Link>
    </div>
  );
}
