/**
 * About Page - Information about Mundo Tango platform
 */

import { Card } from "@/components/ui/card";
import { Users, Globe, Heart } from "lucide-react";

export default function About() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
        About Mundo Tango
      </h1>
      
      <Card className="p-8 mb-8">
        <p className="text-lg mb-4">
          Mundo Tango is a global platform connecting the tango community worldwide.
          We bring together dancers, organizers, and enthusiasts to share their passion for Argentine tango.
        </p>
        <p className="text-gray-600">
          Our mission is to make tango more accessible, help dancers find events and communities anywhere in the world,
          and preserve the rich cultural heritage of this beautiful dance.
        </p>
      </Card>

      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <Card className="p-6 text-center">
          <Users className="h-12 w-12 mx-auto mb-4 text-teal-600" />
          <h3 className="font-bold mb-2">Community First</h3>
          <p className="text-sm text-gray-600">Built by dancers, for dancers</p>
        </Card>
        
        <Card className="p-6 text-center">
          <Globe className="h-12 w-12 mx-auto mb-4 text-teal-600" />
          <h3 className="font-bold mb-2">Global Reach</h3>
          <p className="text-sm text-gray-600">Connecting dancers across continents</p>
        </Card>
        
        <Card className="p-6 text-center">
          <Heart className="h-12 w-12 mx-auto mb-4 text-teal-600" />
          <h3 className="font-bold mb-2">Passion Driven</h3>
          <p className="text-sm text-gray-600">Sharing the love of tango</p>
        </Card>
      </div>
    </div>
  );
}
