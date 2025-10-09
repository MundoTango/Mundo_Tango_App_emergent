/**
 * Community Stats Component - Code Split for Performance
 * Lazy loaded to reduce initial bundle size
 */
import { Users, Calendar, Globe2, Building, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const CommunityStats = () => (
  <div className="bg-white/95 backdrop-blur-lg rounded-xl shadow-lg border border-cyan-200/20 p-6">
    <h3 className="text-lg font-bold bg-gradient-to-r from-[#5EEAD4] to-[#155E75] bg-clip-text text-transparent mb-4">
      Community
    </h3>
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Users className="h-5 w-5 text-purple-600" aria-hidden="true" />
          </div>
          <span className="text-sm font-medium text-gray-700">Global Dancers</span>
        </div>
        <span className="text-xl font-bold text-gray-900" aria-label="3,200 global dancers">3.2K</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Calendar className="h-5 w-5 text-orange-600" aria-hidden="true" />
          </div>
          <span className="text-sm font-medium text-gray-700">Active Events</span>
        </div>
        <span className="text-xl font-bold text-gray-900" aria-label="945 active events">945</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Globe2 className="h-5 w-5 text-blue-600" aria-hidden="true" />
          </div>
          <span className="text-sm font-medium text-gray-700">Communities</span>
        </div>
        <span className="text-xl font-bold text-gray-900" aria-label="6,800 communities">6.8K</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Building className="h-5 w-5 text-green-600" aria-hidden="true" />
          </div>
          <span className="text-sm font-medium text-gray-700">Your City</span>
        </div>
        <span className="text-xl font-bold text-gray-900" aria-label="184 members in your city">184</span>
      </div>
    </div>

    <div className="mt-6 pt-6 border-t border-gray-200">
      <Button 
        className="w-full bg-gradient-to-r from-[#5EEAD4] to-[#155E75] text-white hover:opacity-90"
        aria-label="Go to Mundo Tango"
        data-testid="button-mundo-tango"
      >
        <Music className="h-4 w-4 mr-2" aria-hidden="true" />
        Mundo Tango
      </Button>
    </div>
  </div>
);
