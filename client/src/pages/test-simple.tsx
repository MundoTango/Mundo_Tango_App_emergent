/**
 * Test Simple Page - Minimal testing page
 */

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function TestSimple() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Test Page</h1>
      
      <Card className="p-6">
        <p className="mb-4">This is a simple test page for debugging and development.</p>
        <Button data-testid="button-test">Test Button</Button>
      </Card>
    </div>
  );
}
