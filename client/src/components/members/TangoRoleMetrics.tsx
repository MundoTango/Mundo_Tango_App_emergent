/**
 * TangoRoleMetrics Component
 * ESA Layer 22: Group Management - Tango Role Statistics
 * Aurora Tide Design System - Full Compliance
 * 
 * Features:
 * - GlassCard components with depth-1
 * - GSAP scroll reveals with stagger animation
 * - MT Ocean Theme gradients
 * - i18next internationalization
 * - Dark mode support
 * - Shows counts for all 20 tango roles
 */

import { GlassCard } from "@/components/glass/GlassComponents";
import { useTranslation } from "react-i18next";
import { TANGO_ROLES, ROLE_CATEGORIES, TangoRole } from "@/utils/tangoRoles";
import { useMemo } from "react";

interface TangoRoleMetricsProps {
  members: Array<{
    tangoRoles?: string[];
    leaderLevel?: number;
    followerLevel?: number;
  }>;
  selectedRoles?: string[];
  onRoleToggle?: (roleId: string) => void;
}

export const TangoRoleMetrics = ({ members, selectedRoles = [], onRoleToggle }: TangoRoleMetricsProps) => {
  const { t } = useTranslation();

  // Calculate role counts
  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    
    // Initialize all roles with 0
    TANGO_ROLES.forEach(role => {
      counts[role.id] = 0;
    });

    // Count roles from members
    members.forEach(member => {
      if (member.tangoRoles && Array.isArray(member.tangoRoles)) {
        member.tangoRoles.forEach(roleId => {
          // Handle dancer role with levels
          if (roleId === 'dancer') {
            const hasLeader = member.leaderLevel && member.leaderLevel > 0;
            const hasFollower = member.followerLevel && member.followerLevel > 0;
            
            if (hasLeader && hasFollower) {
              counts['dancer_switch'] = (counts['dancer_switch'] || 0) + 1;
            } else if (hasLeader) {
              counts['dancer_leader'] = (counts['dancer_leader'] || 0) + 1;
            } else if (hasFollower) {
              counts['dancer_follower'] = (counts['dancer_follower'] || 0) + 1;
            } else {
              counts['dancer'] = (counts['dancer'] || 0) + 1;
            }
          } else {
            counts[roleId] = (counts[roleId] || 0) + 1;
          }
        });
      }
    });

    return counts;
  }, [members]);

  // Group roles by category with counts
  const categorizedRoles = useMemo(() => {
    const categories: Record<string, { roles: Array<TangoRole & { count: number }>, total: number }> = {};

    TANGO_ROLES.forEach(role => {
      const count = roleCounts[role.id] || 0;
      
      if (!categories[role.category]) {
        categories[role.category] = { roles: [], total: 0 };
      }
      
      categories[role.category].roles.push({ ...role, count });
      categories[role.category].total += count;
    });

    return categories;
  }, [roleCounts]);

  const totalMembers = members.length;
  const totalRoleAssignments = Object.values(roleCounts).reduce((sum, count) => sum + count, 0);

  return (
    <div className="space-y-6" data-testid="container-tango-role-metrics">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('members.roleMetrics.title', 'Community Roles')}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-600 dark:text-gray-400">
            {selectedRoles.length > 0 
              ? t('members.roleMetrics.filtering', 'Click roles to filter • {{count}} selected', { count: selectedRoles.length })
              : t('members.roleMetrics.subtitle', 'Click roles to filter members')
            }
          </p>
        </div>
      </div>

      {/* Role Categories */}
      {Object.entries(categorizedRoles).map(([categoryKey, categoryData]) => {
        const category = ROLE_CATEGORIES[categoryKey as keyof typeof ROLE_CATEGORIES];
        
        if (categoryData.total === 0) return null;

        return (
          <div key={categoryKey} className="space-y-3">
            {/* Category Header */}
            <div className="flex items-center gap-2">
              <span className="text-xl">{category.emoji}</span>
              <h4 className="font-medium text-gray-800 dark:text-gray-200">
                {t(`members.roleMetrics.category.${categoryKey}`, category.name)}
              </h4>
              <span className="text-sm text-gray-500 dark:text-gray-600 dark:text-gray-400">
                ({categoryData.total})
              </span>
            </div>

            {/* Role Cards - Clickable Filters */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {categoryData.roles
                .filter(role => role.count > 0 && role.id !== 'dancer') // Hide generic "dancer" since we have leader/follower/both
                .map(role => {
                  const isSelected = selectedRoles.includes(role.id);
                  return (
                    <button
                      key={role.id}
                      onClick={() => onRoleToggle?.(role.id)}
                      className="text-left w-full"
                      data-testid={`button-filter-role-${role.id}`}
                    >
                      <GlassCard
                        depth={isSelected ? 2 : 1}
                        className={`role-metric-card p-3 transition-all duration-300 group ${
                          isSelected 
                            ? 'border-ocean-500 dark:border-cyan-400 bg-ocean-500/10 dark:bg-cyan-400/10' 
                            : 'hover:border-ocean-500/50 dark:hover:border-cyan-400/30'
                        }`}
                        data-testid={`card-role-metric-${role.id}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-2xl group-hover:scale-110 transition-transform duration-200">
                            {role.emoji}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-medium truncate ${
                              isSelected 
                                ? 'text-cyan-700 dark:text-cyan-300' 
                                : 'text-gray-700 dark:text-gray-600 dark:text-gray-300'
                            }`}>
                              {t(`members.tangoRole.${role.id}`, role.name)}
                            </p>
                            <p className={`text-lg font-bold ${
                              isSelected
                                ? 'text-cyan-600 dark:text-cyan-400'
                                : 'bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent'
                            }`}>
                              {role.count}
                            </p>
                          </div>
                        </div>
                      </GlassCard>
                    </button>
                  );
                })}
            </div>
          </div>
        );
      })}

      {/* Empty State */}
      {totalRoleAssignments === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-600 dark:text-gray-400">
            {t('members.roleMetrics.empty', 'No role assignments yet')}
          </p>
        </div>
      )}
    </div>
  );
};
