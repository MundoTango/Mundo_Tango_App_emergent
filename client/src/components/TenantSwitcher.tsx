import React, { useState } from 'react';
import { useTenant } from '../contexts/TenantContext';
import { useAuth } from '@/hooks/useAuth';
import { defineAbilitiesFor } from '@/lib/casl/abilities';
import { ChevronDown, Building2, Check, Settings, Globe, Users } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useLocation } from 'wouter';
import { MTBadge } from '@/components/ui-library';
import { applyGlassmorphism } from '@/styles/mt-ocean-theme';

const TenantSwitcher = () => {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const { 
    currentTenant, 
    userTenants, 
    isLoading, 
    switchTenant,
    viewMode,
    setViewMode,
    selectedTenantIds,
    setSelectedTenantIds
  } = useTenant();
  
  const [open, setOpen] = useState(false);

  const handleTenantSwitch = async (tenantId: string) => {
    await switchTenant(tenantId);
    setOpen(false);
  };

  const handleViewModeChange = (mode: 'single_community' | 'all_communities' | 'custom') => {
    setViewMode(mode);
    if (mode === 'single_community' && currentTenant) {
      setSelectedTenantIds([currentTenant.id]);
    } else if (mode === 'all_communities' && userTenants) {
      setSelectedTenantIds(userTenants.map(t => t.id));
    }
  };

  const handleCustomTenantToggle = (tenantId: string) => {
    if (viewMode !== 'custom') return;
    
    if (selectedTenantIds.includes(tenantId)) {
      setSelectedTenantIds(selectedTenantIds.filter(id => id !== tenantId));
    } else {
      setSelectedTenantIds([...selectedTenantIds, tenantId]);
    }
  };

  // Check if user has permission to switch tenants
  const abilities = defineAbilitiesFor(user || null);
  if (!abilities.can('manage', 'all')) {
    return null; // Don't show tenant switcher if user doesn't have permission
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-2 rounded-xl bg-gradient-to-r from-teal-50/50 to-blue-50/50 dark:from-teal-900/20 dark:to-blue-900/20 animate-pulse">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-200 to-blue-200 dark:from-teal-700 dark:to-blue-700" />
        <div className="flex-1">
          <div className="h-4 bg-gradient-to-r from-teal-200 to-blue-200 dark:from-teal-700 dark:to-blue-700 rounded w-24" />
        </div>
      </div>
    );
  }

  if (!currentTenant || !userTenants || userTenants.length === 0) {
    return null;
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center justify-between w-full gap-2 p-3 rounded-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-teal-200/50 dark:border-teal-700/50 hover:bg-gradient-to-r hover:from-teal-50/50 hover:to-blue-50/50 dark:hover:from-teal-900/30 dark:hover:to-blue-900/30 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <div className="flex items-center gap-2">
            {currentTenant.logo_url ? (
              <img 
                src={currentTenant.logo_url} 
                alt={currentTenant.name} 
                className="w-8 h-8 rounded object-cover"
              />
            ) : (
              <Building2 className="w-8 h-8 p-1 rounded-lg bg-gradient-to-br from-teal-100 to-blue-100 dark:from-teal-800 dark:to-blue-800 text-teal-600 dark:text-teal-400" />
            )}
            <div className="text-left">
              <div className="text-sm font-semibold bg-gradient-to-r from-teal-600 to-blue-800 dark:from-teal-400 dark:to-blue-600 bg-clip-text text-transparent">{currentTenant.name}</div>
              <div className="text-xs text-teal-600/70 dark:text-teal-400/70">
                {viewMode === 'single_community' && 'Single Community'}
                {viewMode === 'all_communities' && `All Communities (${userTenants.length})`}
                {viewMode === 'custom' && `Custom (${selectedTenantIds.length})`}
              </div>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-teal-600 dark:text-teal-400" />
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="start" className="w-72 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-teal-200/50 dark:border-teal-700/50 shadow-2xl">
        {/* Community Selection */}
        <DropdownMenuLabel>Switch Community</DropdownMenuLabel>
        {userTenants.map((tenant) => (
          <DropdownMenuItem
            key={tenant.id}
            onClick={() => handleTenantSwitch(tenant.id)}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              {tenant.logo_url ? (
                <img 
                  src={tenant.logo_url} 
                  alt={tenant.name} 
                  className="w-6 h-6 rounded object-cover"
                />
              ) : (
                <Building2 className="w-6 h-6 p-1 rounded-lg bg-gradient-to-br from-teal-100 to-blue-100 dark:from-teal-800 dark:to-blue-800" />
              )}
              <div>
                <div className="text-sm font-medium">{tenant.name}</div>
                <div className="text-xs text-teal-600/70 dark:text-teal-400/70 flex items-center gap-2">
                  <MTBadge variant="gradient" size="sm">{tenant.membership.role}</MTBadge>
                  <span>•</span>
                  <span>{tenant.membership.expertise_level}</span>
                </div>
              </div>
            </div>
            {currentTenant.id === tenant.id && (
              <Check className="w-4 h-4 text-teal-500" />
            )}
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        {/* View Mode Selection */}
        <DropdownMenuLabel>View Mode</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={viewMode} onValueChange={handleViewModeChange as any}>
          <DropdownMenuRadioItem value="single_community">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <div>
                <div className="text-sm">Single Community</div>
                <div className="text-xs text-gray-500">View content from current community only</div>
              </div>
            </div>
          </DropdownMenuRadioItem>
          
          <DropdownMenuRadioItem value="all_communities">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <div>
                <div className="text-sm">All Communities</div>
                <div className="text-xs text-gray-500">View content from all your communities</div>
              </div>
            </div>
          </DropdownMenuRadioItem>
          
          <DropdownMenuRadioItem value="custom">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <div>
                <div className="text-sm">Custom Selection</div>
                <div className="text-xs text-gray-500">Choose specific communities</div>
              </div>
            </div>
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        
        {/* Custom Community Selection */}
        {viewMode === 'custom' && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Select Communities</DropdownMenuLabel>
            {userTenants.map((tenant) => (
              <DropdownMenuCheckboxItem
                key={tenant.id}
                checked={selectedTenantIds.includes(tenant.id)}
                onCheckedChange={() => handleCustomTenantToggle(tenant.id)}
              >
                <div className="flex items-center gap-2">
                  {tenant.logo_url ? (
                    <img 
                      src={tenant.logo_url} 
                      alt={tenant.name} 
                      className="w-5 h-5 rounded object-cover"
                    />
                  ) : (
                    <Building2 className="w-5 h-5 p-0.5 rounded bg-gray-200 dark:bg-gray-700" />
                  )}
                  <span className="text-sm">{tenant.name}</span>
                </div>
              </DropdownMenuCheckboxItem>
            ))}
          </>
        )}
        
        <DropdownMenuSeparator />
        
        {/* Admin Options */}
        {currentTenant && userTenants.find(t => t.id === currentTenant.id)?.membership.is_admin && (
          <DropdownMenuItem
            onClick={() => setLocation(`/communities/${currentTenant.slug}/settings`)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Community Settings
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TenantSwitcher;