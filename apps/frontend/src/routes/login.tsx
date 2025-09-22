import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LoginForm } from "../components/LoginForm";
import { useSession } from "../lib/auth";
import { useEffect } from "react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { data: session } = useSession();
  const navigate = useNavigate();

  // If user is already logged in, redirect to home
  useEffect(() => {
    if (session) {
      navigate({ to: "/" });
    }
  }, [session, navigate]);

  // Don't render LoginForm if session exists
  if (session) {
    return null;
  }

  return <LoginForm />;
}