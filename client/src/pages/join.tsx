/**
 * Join Page
 * User registration and signup
 */

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Sparkles } from "lucide-react";
import { useState } from "react";

export default function Join() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Redirect to auth
    window.location.href = `/api/auth/replit?returnTo=${encodeURIComponent('/landing')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-turquoise-50 via-cyan-50 to-blue-50 flex items-center justify-center">
      <Card className="max-w-md w-full p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-gradient-to-r from-turquoise-400 to-cyan-500 rounded-2xl mb-4">
            <Sparkles className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-turquoise-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Join Mundo Tango
          </h1>
          <p className="text-gray-600">
            Start your tango journey today
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              data-testid="input-email"
            />
          </div>

          <Button 
            type="submit"
            className="w-full bg-gradient-to-r from-turquoise-500 to-cyan-600 hover:from-turquoise-600 hover:to-cyan-700"
            data-testid="button-join-submit"
          >
            Continue with Replit
          </Button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{" "}
          <a href="/api/auth/replit" className="text-turquoise-600 hover:underline">
            Sign in
          </a>
        </p>
      </Card>
    </div>
  );
}
