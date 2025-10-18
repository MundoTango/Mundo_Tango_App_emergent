/**
 * Test Simple Page
 * Minimal test page for development/debugging
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function TestSimple() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-2xl mx-auto">
        <Card data-testid="card-test">
          <CardHeader>
            <CardTitle>Test Simple Page</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-gray-600 dark:text-gray-300">
              This is a minimal test page for development and debugging.
            </p>
            <Link href="/">
              <Button data-testid="button-home">
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
