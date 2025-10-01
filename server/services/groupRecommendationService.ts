import { db } from '../db';
import { groups, groupMembers, users } from '../../shared/schema';
import { eq, and, or, sql, desc, ne } from 'drizzle-orm';

interface RecommendedGroup {
  id: number;
  name: string;
  slug: string;
  city: string | null;
  country: string | null;
  memberCount: number;
  roleType: string | null;
  score: number;
  reason: string;
}

interface SimilarMember {
  id: number;
  name: string;
  username: string;
  profileImage: string | null;
  city: string | null;
  country: string | null;
  roles: string[];
  matchReason: string;
}

export async function getRecommendedGroups(userId: number): Promise<RecommendedGroup[]> {
  console.log(`🤖 AI Recommendations: Generating for user ${userId}`);
  
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  
  if (!user) {
    console.log('User not found');
    return [];
  }
  
  const userMemberships = await db
    .select({ groupId: groupMembers.groupId })
    .from(groupMembers)
    .where(eq(groupMembers.userId, userId));
  
  const memberGroupIds = userMemberships.map(m => m.groupId);
  
  let allGroups = await db
    .select({
      id: groups.id,
      name: groups.name,
      slug: groups.slug,
      city: groups.city,
      country: groups.country,
      roleType: groups.roleType,
      memberCount: groups.memberCount,
    })
    .from(groups)
    .where(
      and(
        eq(groups.type, 'city'),
        memberGroupIds.length > 0 ? sql`${groups.id} NOT IN (${sql.join(memberGroupIds, sql`, `)})` : undefined
      )
    );
  
  const recommendations = allGroups.map(group => {
    let score = 0;
    const reasons: string[] = [];
    
    if (user.city && group.city === user.city) {
      score += 50;
      reasons.push('Same city');
    } else if (user.country && group.country === user.country) {
      score += 30;
      reasons.push('Same country');
    }
    
    if (user.tangoRoles && group.roleType) {
      const userRoles = Array.isArray(user.tangoRoles) ? user.tangoRoles : [user.tangoRoles];
      if (userRoles.includes(group.roleType)) {
        score += 30;
        reasons.push(`${group.roleType} community`);
      }
    }
    
    const memberCount = group.memberCount || 0;
    if (memberCount >= 50 && memberCount <= 500) {
      score += 20;
      reasons.push('Active community');
    } else if (memberCount > 500) {
      score += 10;
      reasons.push('Large community');
    }
    
    return {
      id: group.id,
      name: group.name,
      slug: group.slug,
      city: group.city,
      country: group.country,
      memberCount: memberCount,
      roleType: group.roleType,
      score,
      reason: reasons.join(' • ')
    };
  });
  
  recommendations.sort((a, b) => b.score - a.score);
  
  const topRecommendations = recommendations.slice(0, 5);
  console.log(`✅ Recommended ${topRecommendations.length} groups for user ${userId}`);
  
  return topRecommendations;
}

export async function suggestSimilarMembers(groupId: number, userId: number): Promise<SimilarMember[]> {
  console.log(`🤖 AI Similar Members: Finding for group ${groupId}, user ${userId}`);
  
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  
  if (!user) {
    return [];
  }
  
  const members = await db
    .select({
      id: users.id,
      name: users.name,
      username: users.username,
      profileImage: users.profileImage,
      city: users.city,
      country: users.country,
      tangoRoles: users.tangoRoles,
    })
    .from(groupMembers)
    .innerJoin(users, eq(groupMembers.userId, users.id))
    .where(
      and(
        eq(groupMembers.groupId, groupId),
        ne(users.id, userId)
      )
    );
  
  const similarMembers = members.map(member => {
    let score = 0;
    const reasons: string[] = [];
    
    if (user.city && member.city === user.city) {
      score += 40;
      reasons.push('Same city');
    } else if (user.country && member.country === user.country) {
      score += 20;
      reasons.push('Same country');
    }
    
    if (user.tangoRoles && member.tangoRoles) {
      const userRoles = Array.isArray(user.tangoRoles) ? user.tangoRoles : [user.tangoRoles];
      const memberRoles = Array.isArray(member.tangoRoles) ? member.tangoRoles : [member.tangoRoles];
      
      const commonRoles = userRoles.filter(r => memberRoles.includes(r));
      if (commonRoles.length > 0) {
        score += 30 * commonRoles.length;
        reasons.push(`Similar roles: ${commonRoles.join(', ')}`);
      }
    }
    
    return {
      id: member.id,
      name: member.name,
      username: member.username,
      profileImage: member.profileImage,
      city: member.city,
      country: member.country,
      roles: Array.isArray(member.tangoRoles) ? member.tangoRoles : (member.tangoRoles ? [member.tangoRoles] : []),
      matchReason: reasons.join(' • ') || 'Group member',
      score
    };
  });
  
  similarMembers.sort((a, b) => b.score - a.score);
  
  const topSimilar = similarMembers.slice(0, 5);
  console.log(`✅ Found ${topSimilar.length} similar members`);
  
  return topSimilar.map(({ score, ...member }) => member);
}
