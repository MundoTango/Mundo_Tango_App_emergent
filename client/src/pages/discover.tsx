/**
 * J1 Journey: Discover Events Page
 * Public page for discovering tango events worldwide
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Calendar, MapPin, Search } from "lucide-react";

export default function Discover() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-teal-100 mb-2">
            Discover Tango Events
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Find milongas, festivals, and workshops near you
          </p>
        </div>

        <div className="grid gap-6">
          <Card className="backdrop-blur-md bg-white/90 dark:bg-black/40" data-testid="card-discover-placeholder">
            <CardHeader>
              <Calendar className="h-8 w-8 text-teal-600 dark:text-teal-400 mb-2" />
              <CardTitle>Events Coming Soon</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Join Mundo Tango to discover thousands of tango events worldwide
              </p>
              <Link href="/register">
                <Button className="bg-teal-600 hover:bg-teal-700 text-white" data-testid="button-join-discover">
                  Join Now
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
