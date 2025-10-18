/**
 * Join Page - Registration entry point for new users
 */

import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Join() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Redirect to register page
    setLocation("/auth/register");
  }, [setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        <p className="text-gray-600 dark:text-gray-400" data-testid="text-redirecting">
          Redirecting to registration...
        </p>
      </div>
    </div>
  );
}
