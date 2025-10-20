import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useSession } from "../../lib/auth";
import { Header } from "../navigation/Header";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { data: session } = useSession();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!session) {
      navigate({ to: "/login" });
    }
  }, [session, navigate]);

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Sticky */}
      <Header />

      {/* Page content */}
      <main className="p-4 lg:p-8">
        {children}
      </main>
    </div>
  );
}
