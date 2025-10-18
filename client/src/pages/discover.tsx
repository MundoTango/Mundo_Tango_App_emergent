/**
 * Discover Page - Browse and explore tango events, dancers, and communities
 */

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function Discover() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Discover</h1>
      
      <Card className="p-6 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search events, dancers, communities..."
            className="pl-10"
            data-testid="input-search-discover"
          />
        </div>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="font-bold mb-2">Events Near You</h3>
          <p className="text-sm text-gray-600">Discover upcoming milongas and workshops</p>
        </Card>
        
        <Card className="p-6">
          <h3 className="font-bold mb-2">Featured Dancers</h3>
          <p className="text-sm text-gray-600">Connect with the community</p>
        </Card>
        
        <Card className="p-6">
          <h3 className="font-bold mb-2">Tango Communities</h3>
          <p className="text-sm text-gray-600">Join groups in your city</p>
        </Card>
      </div>
    </div>
  );
}
