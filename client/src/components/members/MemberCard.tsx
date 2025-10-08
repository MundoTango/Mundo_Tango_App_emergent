/**
 * MemberCard Component - Tango Role Display
 * ESA Layer 22: Group Management
 * Aurora Tide Design System - Full Compliance
 * 
 * Features:
 * - GlassCard components with depth-1
 * - RoleEmojiDisplay for tango roles
 * - MT Ocean Theme gradients
 * - i18next internationalization
 * - Dark mode support
 * - No admin features - public view only
 */

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/glass/GlassComponents";
import { RoleEmojiDisplay } from "@/components/ui/RoleEmojiDisplay";
import { useTranslation } from "react-i18next";
import { Eye } from "lucide-react";
import { Link } from "wouter";

interface MemberCardProps {
  member: {
    id: number;
    userId: number;
    username: string;
    fullName?: string;
    profilePicture?: string | null;
    tangoRoles?: string[];
    leaderLevel?: number;
    followerLevel?: number;
    joinedAt: Date;
  };
}

export function MemberCard({ member }: MemberCardProps) {
  const { t } = useTranslation();

  return (
    <GlassCard 
      depth={1} 
      className="p-4 hover:border-cyan-500/50 dark:hover:border-cyan-400/30 transition-all duration-500 group"
      data-testid={`card-member-${member.id}`}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <Link href={`/profile/${member.username}`}>
          <Avatar className="h-12 w-12 cursor-pointer hover:ring-2 hover:ring-cyan-500 transition-all">
            <AvatarImage src={member.profilePicture || undefined} alt={member.fullName || member.username} />
            <AvatarFallback className="bg-gradient-to-br from-turquoise-500 to-[var(--color-ocean-500)] text-white font-semibold">
              {(member.fullName || member.username)[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>
        
        {/* Member Info */}
        <div className="flex-1 min-w-0">
          <Link href={`/profile/${member.username}`}>
            <h3 className="font-semibold bg-gradient-to-r from-turquoise-500 to-[var(--color-ocean-500)] bg-clip-text text-transparent hover:from-cyan-600 hover:to-[var(--color-ocean-600)] transition-all cursor-pointer truncate">
              {member.fullName || member.username}
            </h3>
          </Link>
          
          {/* Tango Role Emojis */}
          <div className="mt-1">
            <RoleEmojiDisplay
              tangoRoles={member.tangoRoles}
              leaderLevel={member.leaderLevel}
              followerLevel={member.followerLevel}
              size="md"
              maxRoles={5}
            />
          </div>
          
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {t('members.joinedAt', 'Joined {{date}}', { 
              date: new Date(member.joinedAt).toLocaleDateString() 
            })}
          </p>
        </div>
        
        {/* View Profile Button */}
        <Link href={`/profile/${member.username}`}>
          <Button 
            variant="ghost" 
            size="sm"
            className="hover:bg-[var(--color-primary)]/20 dark:hover:bg-cyan-400/20 gap-2"
            data-testid={`button-view-profile-${member.id}`}
          >
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">{t('members.viewProfile', 'View Profile')}</span>
          </Button>
        </Link>
      </div>
    </GlassCard>
  );
}
