import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/glass/GlassComponents";
import { useTranslation } from "react-i18next";
import { MoreVertical, UserCheck, MessageCircle } from "lucide-react";
import { Link } from "wouter";

interface MemberCardProps {
  member: {
    id: number;
    userId: number;
    username: string;
    profilePicture?: string | null;
    role: 'member' | 'moderator' | 'admin' | 'owner';
    joinedAt: Date;
    status?: string;
  };
  currentUserRole?: string;
  onRoleChange?: (userId: number) => void;
  onRemove?: (userId: number) => void;
}

export function MemberCard({ member, currentUserRole, onRoleChange, onRemove }: MemberCardProps) {
  const { t } = useTranslation();
  
  const canManage = currentUserRole === 'admin' || currentUserRole === 'owner';
  const isCurrentUserOwner = currentUserRole === 'owner';
  
  // Role badge colors (MT Ocean Theme gradients)
  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0';
      case 'admin':
        return 'bg-gradient-to-r from-orange-500 to-red-500 text-white border-0';
      case 'moderator':
        return 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0';
      default:
        return 'bg-gradient-to-r from-turquoise-500 to-blue-500 text-white border-0';
    }
  };

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
              <AvatarImage src={member.profilePicture || undefined} alt={member.username} />
              <AvatarFallback className="bg-gradient-to-br from-turquoise-500 to-blue-500 text-white font-semibold">
                {member.username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
          
          {/* Member Info */}
          <div className="flex-1 min-w-0">
            <Link href={`/profile/${member.username}`}>
              <h3 className="font-semibold bg-gradient-to-r from-turquoise-500 to-blue-500 bg-clip-text text-transparent hover:from-cyan-600 hover:to-blue-600 transition-all cursor-pointer truncate">
                {member.username}
              </h3>
            </Link>
            
            <div className="flex items-center gap-2 mt-1">
              <Badge className={getRoleBadgeClass(member.role)}>
                {t(`members.role.${member.role}`, member.role)}
              </Badge>
              
              {member.status === 'pending' && (
                <Badge variant="outline" className="text-yellow-600 dark:text-yellow-400 border-yellow-500/30">
                  {t('members.status.pending', 'Pending')}
                </Badge>
              )}
            </div>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t('members.joinedAt', 'Joined {{date}}', { 
                date: new Date(member.joinedAt).toLocaleDateString() 
              })}
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Message Button */}
            <Button 
              variant="ghost" 
              size="icon"
              className="hover:bg-cyan-500/20 dark:hover:bg-cyan-400/20"
              data-testid={`button-message-${member.id}`}
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
            
            {/* Admin Actions (if current user can manage) */}
            {canManage && member.role !== 'owner' && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => onRoleChange?.(member.userId)}
                className="hover:bg-cyan-500/20 dark:hover:bg-cyan-400/20"
                data-testid={`dropdown-member-actions-${member.id}`}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            )}
            
            {/* Friend/Connection Status (if applicable) */}
            {member.status === 'active' && (
              <UserCheck className="h-4 w-4 text-green-500" data-testid={`icon-member-active-${member.id}`} />
            )}
          </div>
        </div>
      </GlassCard>
  );
}
