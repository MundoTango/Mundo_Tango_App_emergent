import React from 'react';
import { Search, Plus, Filter, Sparkles, Users, MapPin, Heart } from 'lucide-react';
import { GlassCard } from '@/components/glass/GlassComponents';


interface ModernMemoriesHeaderProps {
  onCreatePost: () => void;
}

export default function ModernMemoriesHeader({ onCreatePost }: ModernMemoriesHeaderProps) {
  return (
    <div className="mt-ocean-gradient border-b border-blue-100/60">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-10">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="mt-ocean-gradient p-4 rounded-3xl shadow-2xl 
                            hover:shadow-cyan-500/25 transform hover:scale-105 hover:rotate-3 transition-all duration-500">
                <Sparkles className="w-8 h-8 text-white drop-shadow-lg" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-yellow-400 to-orange-400 
                            rounded-full animate-ping"></div>
            </div>
            <div>
              <h1 className="text-4xl lg:text-5xl font-black mt-ocean-text drop-shadow-sm">
                WRONG COMPONENT - THIS SHOULD NOT SHOW
              </h1>
              <p className="text-blue-600/80 mt-2 text-lg font-medium">
                THIS IS THE WRONG COMPONENT - NOT PIERRE DUBOIS
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <GlassCard depth={1} className="flex items-center gap-2 px-4 py-2 rounded-2xl 
                          border border-blue-200/50 shadow-lg">
              <Users className="w-4 h-4 text-[var(--color-primary)]" />
              <span className="text-sm font-semibold text-blue-900">3.2K Online</span>
            </GlassCard>
            
            <button
              onClick={onCreatePost}
              className="mt-ocean-gradient hover:opacity-90 
                       text-white px-8 py-4 rounded-2xl font-bold shadow-2xl hover:shadow-cyan-500/30 
                       transform hover:-translate-y-1 hover:scale-105 transition-all duration-300 
                       flex items-center space-x-3 group"
             aria-label="Button">
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              <span>Create Memory</span>
            </button>
          </div>
        </div>

        {/* Enhanced Search Section */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative group">
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-blue-400 w-6 h-6 
                            group-focus-within:text-[var(--color-primary)] transition-colors duration-200" />
            <input
              type="text"
              placeholder="Search events, people, memories..."
              className="w-full pl-14 pr-6 py-5 bg-[var(--color-surface)] dark:bg-gray-900/90 backdrop-blur-md border-2 border-blue-200/50 
                       rounded-2xl focus:outline-none focus:ring-4 focus:ring-cyan-200/50 focus:border-[var(--color-ocean-300)]
                       text-blue-900 placeholder-blue-400/70 font-medium text-lg shadow-xl
                       hover:shadow-2xl transition-all duration-300"
            / aria-label="Input field">
            <div className="absolute right-5 top-1/2 transform -translate-y-1/2">
              <kbd className="px-3 py-1 bg-blue-100 border border-blue-200 rounded-lg text-xs font-semibold text-blue-600">
                ⌘K
              </kbd>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button className="bg-[var(--color-surface)] dark:bg-gray-900/90 backdrop-blur-md border-2 border-blue-200/50 hover:border-[var(--color-ocean-300)] 
                             px-6 py-5 rounded-2xl text-blue-600 hover:text-[var(--color-primary-hover)] font-bold text-lg
                             shadow-xl hover:shadow-2xl hover:bg-[var(--color-ocean-50)] transform hover:-translate-y-0.5
                             transition-all duration-300 flex items-center space-x-3" aria-label="Button">
              <Filter className="w-5 h-5" />
              <span>Filter</span>
            </button>
            
            <button className="bg-[var(--color-surface)] dark:bg-gray-900/90 backdrop-blur-md border-2 border-blue-200/50 hover:border-pink-300 
                             px-6 py-5 rounded-2xl text-blue-600 hover:text-pink-600 font-bold text-lg
                             shadow-xl hover:shadow-2xl hover:bg-pink-50 transform hover:-translate-y-0.5
                             transition-all duration-300 flex items-center space-x-3" aria-label="Button">
              <MapPin className="w-5 h-5" />
              <span>Nearby</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}