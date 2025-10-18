/**
 * Join Page - Invite page for joining Mundo Tango
 */

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";

export default function Join() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8">
        <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
          Join Mundo Tango
        </h1>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Connect with the global tango community. Find events, make friends, and dance around the world.
        </p>

        <div className="space-y-4">
          <Link href="/register">
            <Button 
              className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700"
              data-testid="button-register"
            >
              Create Free Account
            </Button>
          </Link>
          
          <Link href="/login">
            <Button 
              variant="outline" 
              className="w-full"
              data-testid="button-login"
            >
              Already have an account? Sign In
            </Button>
          </Link>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-6 text-center">
          By joining, you agree to our Terms of Service and Privacy Policy
        </p>
      </Card>
    </div>
  );
}
