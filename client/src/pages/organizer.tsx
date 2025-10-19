import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Calendar, Users, BarChart3, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function OrganizerDashboard() {
  const { t } = useTranslation();
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="backdrop-blur-md bg-white/80 dark:bg-gray-900/80 rounded-xl shadow-xl border border-turquoise-100 dark:border-gray-700 p-6">
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-turquoise-500 dark:text-turquoise-400 mx-auto mb-6" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-turquoise-600 to-cyan-600 bg-clip-text text-transparent dark:from-turquoise-400 dark:to-cyan-400 mb-4" data-testid="text-page-title">Organizer Tools Coming Soon</h1>
            <p className="text-gray-700 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              We're building powerful tools to help you organize unforgettable tango events. 
              Stay tuned for event management, attendee tracking, and promotional features.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="backdrop-blur-sm bg-white/60 dark:bg-gray-800/60 rounded-lg shadow-lg border border-turquoise-100 dark:border-gray-600">
                <div className="p-6 text-center">
                  <Users className="h-8 w-8 text-turquoise-500 dark:text-turquoise-400 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Event Management</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Create and manage milongas, workshops, and festivals</p>
                </div>
              </div>
              
              <div className="backdrop-blur-sm bg-white/60 dark:bg-gray-800/60 rounded-lg shadow-lg border border-turquoise-100 dark:border-gray-600">
                <div className="p-6 text-center">
                  <BarChart3 className="h-8 w-8 text-turquoise-500 dark:text-turquoise-400 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Analytics</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Track attendance and engagement metrics</p>
                </div>
              </div>
              
              <div className="backdrop-blur-sm bg-white/60 dark:bg-gray-800/60 rounded-lg shadow-lg border border-turquoise-100 dark:border-gray-600">
                <div className="p-6 text-center">
                  <Settings className="h-8 w-8 text-turquoise-500 dark:text-turquoise-400 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Promotion Tools</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Reach your audience with targeted marketing</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}