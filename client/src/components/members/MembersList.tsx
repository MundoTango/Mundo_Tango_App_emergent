/**
 * MembersList Component - Tango Role Filtering
 * ESA Layer 22: Group Management
 * Aurora Tide Design System - Full Compliance
 * 
 * Features:
 * - GlassCard components with depth-1
 * - GSAP scroll reveals with stagger animation
 * - Framer Motion orchestration (StaggerContainer)
 * - TangoRoleMetrics showing all 20 role counts
 * - Tango role filtering
 * - MT Ocean Theme gradients
 * - i18next internationalization
 * - Dark mode support
 * - Data-testid attributes for testing
 */

import { StaggerContainer, StaggerItem } from "@/components/animations/FramerMotionWrappers";
import { MemberCard } from "./MemberCard";
import { TangoRoleMetrics } from "./TangoRoleMetrics";
import { useTranslation } from "react-i18next";
import { Users, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useMemo } from "react";
import { TANGO_ROLES, processDancerRoles } from "@/utils/tangoRoles";

interface Member {
  id: number;
  userId: number;
  username: string;
  fullName?: string;
  profilePicture?: string | null;
  tangoRoles?: string[];
  leaderLevel?: number;
  followerLevel?: number;
  joinedAt: Date;
}

interface MembersListProps {
  members: Member[];
  isLoading?: boolean;
}

export const MembersList = ({
  members,
  isLoading = false,
}: MembersListProps) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [tangoRoleFilter, setTangoRoleFilter] = useState<string>("all");

  // Filter members by search and tango role
  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      const matchesSearch = searchQuery === "" || 
        member.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.fullName?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Tango role filtering
      let matchesRole = true;
      if (tangoRoleFilter !== "all" && member.tangoRoles) {
        const processedRoles = processDancerRoles(member.tangoRoles, member.leaderLevel, member.followerLevel);
        matchesRole = processedRoles.includes(tangoRoleFilter);
      }
      
      return matchesSearch && matchesRole;
    });
  }, [members, searchQuery, tangoRoleFilter]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12" data-testid="loading-members">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="container-members-list">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 dark:from-cyan-400/20 dark:to-blue-400/20">
            <Users className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100" data-testid="text-members-count">
              {t('members.title', 'Home Community Residents')} ({filteredMembers.length})
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('members.subtitle', 'Connect with fellow tangueros')}
            </p>
          </div>
        </div>
      </div>

      {/* Tango Role Metrics */}
      <TangoRoleMetrics members={members} />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <Input
            type="text"
            placeholder={t('members.search.placeholder', 'Search members...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-cyan-500 dark:focus:border-cyan-400"
            data-testid="input-search-members"
          />
        </div>

        {/* Tango Role Filter */}
        <div className="flex items-center gap-2 sm:w-64">
          <Filter className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <Select value={tangoRoleFilter} onValueChange={setTangoRoleFilter}>
            <SelectTrigger 
              className="bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
              data-testid="select-tango-role-filter"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-80">
              <SelectItem value="all">{t('members.filter.allRoles', 'All Roles')}</SelectItem>
              {TANGO_ROLES.map(role => (
                <SelectItem key={role.id} value={role.id}>
                  <span className="flex items-center gap-2">
                    <span>{role.emoji}</span>
                    <span>{t(`members.tangoRole.${role.id}`, role.name)}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Members Grid */}
      <div>
        {filteredMembers.length === 0 ? (
          <div className="text-center py-12" data-testid="empty-members-state">
            <Users className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery || tangoRoleFilter !== "all"
                ? t('members.empty.filtered', 'No members match your filters')
                : t('members.empty.default', 'No members yet')}
            </p>
          </div>
        ) : (
          <StaggerContainer staggerDelay={0.08} delayChildren={0.1}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMembers.map((member) => (
                <StaggerItem key={member.id}>
                  <div className="member-card-item">
                    <MemberCard member={member} />
                  </div>
                </StaggerItem>
              ))}
            </div>
          </StaggerContainer>
        )}
      </div>
    </div>
  );
};
