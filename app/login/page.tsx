"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
    const result = await authClient.signIn.email({
      email,
      password,
    });

    // ✅ Check if there is an error
    if (result.error) {
      setError(result.error.message || "Invalid email or password");
      return;
    }

    // ✅ Access user safely
    if (result.data?.user) {
      router.push("/dashboard");
    } else {
      setError("Unexpected response from server.");
    }
  } catch (err: any) {
    setError("Something went wrong. Try again.");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-gray-900">
      <Card className="w-[380px] bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl text-white">
        <CardHeader>
          <h1 className="text-2xl font-bold text-center">Welcome to SHDA CRM</h1>
          <p className="text-sm text-gray-300 text-center mt-1">
            Sign in to manage your brand’s system
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent border-white/30 text-white placeholder:text-gray-400"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-transparent border-white/30 text-white placeholder:text-gray-400"
              />
            </div>
            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white transition-all"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-gray-400 text-sm">
          © {new Date().getFullYear()} SHDA CRM — All rights reserved
        </CardFooter>
      </Card>
    </div>
  );
}
