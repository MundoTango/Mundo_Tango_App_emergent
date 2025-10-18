/**
 * Discover Page - Event discovery for visitors and users
 */

import { Music, Calendar, MapPin } from "lucide-react";

export default function Discover() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent" data-testid="text-title">
            Discover Tango Events
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400" data-testid="text-subtitle">
            Find tango events happening around the world
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg" data-testid="card-feature-1">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Upcoming Events</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Discover 450+ tango events worldwide
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg" data-testid="card-feature-2">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center mb-4">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Local Events</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Events in 145 cities across 68 countries
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg" data-testid="card-feature-3">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center mb-4">
              <Music className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Milongas</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Find milongas, practicas, and workshops
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
