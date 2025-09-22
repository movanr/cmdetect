import { useState } from "react";
import { signIn } from "../lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import logoSvg from "../assets/logo.svg";

const testAccounts = [
  { email: "admin@test.com", role: "org_admin", label: "Organization Admin" },
  { email: "physician@test.com", role: "physician", label: "Physician" },
  {
    email: "receptionist@test.com",
    role: "receptionist",
    label: "Receptionist",
  },
  {
    email: "unverified@test.com",
    role: "unverified",
    label: "Unverified User",
  },
];

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn.email({
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message || "Login failed");
        toast.error(result.error.message || "Login failed");
      } else {
        toast.success("Login successful");
        console.log("Login successful:", result);
      }
    } catch (err) {
      const errorMessage = "Login failed. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fillTestAccount = (email: string) => {
    setEmail(email);
    setPassword("TestPassword123!");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-6">
            <img src={logoSvg} className="h-16 w-16" alt="CMDetect logo" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">CMDetect</h1>
          <p className="text-muted-foreground">Sign in to your account</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={isLoading}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <Separator />

            <div className="space-y-3">
              <div className="text-center">
                <Label className="text-sm font-medium">Test Accounts</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Click any account to fill the form
                </p>
              </div>

              <div className="grid gap-2">
                {testAccounts.map((account) => (
                  <Button
                    key={account.email}
                    variant="outline"
                    size="sm"
                    onClick={() => fillTestAccount(account.email)}
                    disabled={isLoading}
                    className="justify-start h-auto p-3"
                  >
                    <div className="flex flex-col items-start w-full">
                      <div className="flex items-center justify-between w-full">
                        <span className="font-medium text-xs">
                          {account.email}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {account.label}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground mt-1">
                        Password: TestPassword123!
                      </span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
