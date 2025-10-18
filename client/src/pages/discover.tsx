/**
 * Discover Page
 * Public page for discovering tango events and communities
 */

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, MapPin, Users } from "lucide-react";
import { Link } from "wouter";

export default function Discover() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-turquoise-50 via-cyan-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-turquoise-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Discover Tango
          </h1>
          <p className="text-xl text-gray-700">
            Find events, communities, and dancers worldwide
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 text-center">
            <Calendar className="h-12 w-12 text-turquoise-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Events</h3>
            <p className="text-gray-600 mb-4">Discover milongas, festivals, and workshops</p>
            <Link href="/events">
              <Button data-testid="button-browse-events">Browse Events</Button>
            </Link>
          </Card>

          <Card className="p-6 text-center">
            <Users className="h-12 w-12 text-cyan-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Communities</h3>
            <p className="text-gray-600 mb-4">Connect with local tango groups</p>
            <Link href="/community">
              <Button data-testid="button-browse-communities">Browse Communities</Button>
            </Link>
          </Card>

          <Card className="p-6 text-center">
            <MapPin className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">World Map</h3>
            <p className="text-gray-600 mb-4">Explore tango around the globe</p>
            <Link href="/community-world-map">
              <Button data-testid="button-view-map">View Map</Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
