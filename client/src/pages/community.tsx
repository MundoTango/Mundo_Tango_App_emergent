import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Link } from 'wouter';
import { Users, Calendar, MessageCircle, Sparkles, Heart, Globe, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function CommunityPage() {
  return (
    <DashboardLayout>
      {/* Enhanced gradient background matching Moments page */}
      <div className="min-h-screen bg-gradient-to-br from-blue-50/60 via-yellow-50/40 to-orange-50/30 relative overflow-hidden">
        {/* Floating background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-turquoise-200/20 to-cyan-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-40 right-32 w-80 h-80 bg-gradient-to-r from-turquoise-200/20 to-blue-200/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-gradient-to-r from-cyan-200/15 to-turquoise-200/15 rounded-full blur-2xl"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-3 sm:px-5 lg:px-8 py-8">
          {/* Enhanced header section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="p-3 bg-gradient-to-r from-turquoise-500 to-cyan-500 rounded-2xl shadow-lg">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div className="p-3 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl shadow-lg animate-pulse">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <div className="p-3 bg-gradient-to-r from-blue-500 dark:from-blue-600 to-cyan-500 rounded-2xl shadow-lg">
                <Globe className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-turquoise-400 to-cyan-500 bg-clip-text text-transparent mb-4">
              Welcome to the Tango Community
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Connect with passionate dancers worldwide and discover the heart of tango culture
            </p>
          </div>
          
          {/* Enhanced navigation cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <Link href="/community-world-map">
              <div className="group glassmorphic-card bg-gradient-to-r from-turquoise-50/50 to-cyan-50/50 border-2 border-turquoise-200/70 rounded-3xl p-8 hover:scale-105 hover:shadow-2xl hover:shadow-turquoise-200/50 transition-all duration-300 cursor-pointer relative overflow-hidden backdrop-blur-xl">
                <div className="absolute top-0 right-0 px-3 py-1 bg-gradient-to-r from-red-500 dark:from-red-600 to-pink-500 text-white dark:text-gray-900 text-xs font-semibold rounded-bl-2xl">
                  NEW
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-6">
                    <div className="p-4 bg-gradient-to-r from-blue-500 dark:from-blue-600 dark:from-blue-600 to-cyan-500 rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow">
                      <Globe className="h-10 w-10 text-white dark:text-gray-900 animate-pulse" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center">
                      <MapPin className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-50 dark:text-gray-50 mb-3 group-hover:text-blue-600 transition-colors">{t('common.world_map')}</h3>
                  <p className="text-gray-600 dark:text-gray-300 dark:text-gray-300 dark:text-gray-300 dark:text-gray-300 dark:text-gray-300 dark:text-gray-300 dark:text-gray-300 dark:text-gray-300 leading-relaxed">{t('common.interactive_global_map_of_tango_communities_with_l')}</p>
                </div>
              </div>
            </Link>

            {/* ESA LIFE CEO 56x21 - Removed duplicate community link since World Map already shows communities */}

            <Link href="/memories">
              <div className="group glassmorphic-card bg-white/70 dark:bg-gray-900/70 dark:bg-gray-900/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-3xl border border-white/50 dark:border-gray-700/50 dark:border-gray-700/50 dark:border-gray-700/50 p-8 hover:scale-105 hover:shadow-2xl hover:shadow-turquoise-100/30 transition-all duration-300 cursor-pointer">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-6">
                    <div className="p-4 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow">
                      <MessageCircle className="h-10 w-10 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                      <Sparkles className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-50 dark:text-gray-50 mb-3 group-hover:text-turquoise-600 transition-colors">{t('common.share_moments')}</h3>
                  <p className="text-gray-600 leading-relaxed">{t('common.connect_with_dancers_worldwide_and_share_your_tang')}</p>
                </div>
              </div>
            </Link>

            <Link href="/events">
              <div className="group glassmorphic-card bg-white/70 backdrop-blur-xl rounded-3xl border border-white/50 p-8 hover:scale-105 hover:shadow-2xl hover:shadow-turquoise-100/30 transition-all duration-300 cursor-pointer">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-6">
                    <div className="p-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow">
                      <Calendar className="h-10 w-10 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center">
                      <MapPin className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">{t('common.discover_events')}</h3>
                  <p className="text-gray-600 leading-relaxed">{t('common.find_milongas_workshops_and_festivals_near_you_wit')}</p>
                </div>
              </div>
            </Link>

            <Link href="/profile">
              <div className="group glassmorphic-card bg-white/70 backdrop-blur-xl rounded-3xl border border-white/50 p-8 hover:scale-105 hover:shadow-2xl hover:shadow-turquoise-100/30 transition-all duration-300 cursor-pointer">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-6">
                    <div className="p-4 bg-gradient-to-r from-turquoise-500 to-cyan-500 rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow">
                      <Users className="h-10 w-10 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full flex items-center justify-center">
                      <Heart className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-turquoise-600 transition-colors">{t('common.your_profile')}</h3>
                  <p className="text-gray-600 leading-relaxed">{t('common.showcase_your_tango_experience_and_connect_with_th')}</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Enhanced features section */}
          <div className="glassmorphic-card bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-3xl border border-white/50 dark:border-gray-700/50 p-8 shadow-lg">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-turquoise-400 to-cyan-500 bg-clip-text text-transparent mb-4">
                Community Features
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                Discover what makes our tango community special
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="group flex items-start gap-4 p-6 bg-gradient-to-r from-turquoise-50/50 to-cyan-50/50 rounded-2xl border border-turquoise-100/50 hover:shadow-lg transition-all duration-300">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 dark:from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-gray-50 mb-2 group-hover:text-blue-600 transition-colors">{t('common.global_network')}</h4>
                  <p className="text-gray-600 leading-relaxed">{t('common.connect_with_passionate_tango_dancers_from_every_c')}</p>
                </div>
              </div>

              <div className="group flex items-start gap-4 p-6 bg-gradient-to-r from-green-50/50 to-emerald-50/50 rounded-2xl border border-green-100/50 hover:shadow-lg transition-all duration-300">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 dark:from-green-600 to-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-gray-50 mb-2 group-hover:text-green-600 transition-colors">{t('common.realtime_updates')}</h4>
                  <p className="text-gray-600 leading-relaxed">{t('common.stay_connected_with_live_notifications_updates_and')}</p>
                </div>
              </div>

              <div className="group flex items-start gap-4 p-6 bg-gradient-to-r from-turquoise-50/50 to-blue-50/50 rounded-2xl border border-turquoise-100/50 hover:shadow-lg transition-all duration-300">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-turquoise-500 to-cyan-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-gray-50 mb-2 group-hover:text-turquoise-600 transition-colors">{t('common.event_discovery')}</h4>
                  <p className="text-gray-600 leading-relaxed">{t('common.find_and_join_local_milongas_workshops_and_interna')}</p>
                </div>
              </div>

              <div className="group flex items-start gap-4 p-6 bg-gradient-to-r from-orange-50/50 to-red-50/50 rounded-2xl border border-orange-100/50 hover:shadow-lg transition-all duration-300">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 dark:from-orange-600 to-red-500 dark:to-red-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Heart className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-gray-50 mb-2 group-hover:text-orange-600 transition-colors">{t('common.skill_development')}</h4>
                  <p className="text-gray-600 leading-relaxed">{t('common.learn_from_master_teachers_skilled_performers_and_')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}