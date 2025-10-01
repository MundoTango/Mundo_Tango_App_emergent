import { db } from '../db';
import { groups, groupMembers, posts } from '../../shared/schema';
import { eq, and, gte, sql, desc } from 'drizzle-orm';

interface GroupHealth {
  score: number;
  engagementScore: number;
  growthRate: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  postsPerDay: number;
  newMembersPerWeek: number;
}

interface GroupInsights {
  peakActivityTimes: Array<{ hour: number; count: number }>;
  topContributors: Array<{ userId: number; username: string; postCount: number }>;
  trendingTopics: string[];
  recentActivity: string;
}

export async function getGroupHealth(groupId: number): Promise<GroupHealth> {
  console.log(`📊 Analytics: Calculating health for group ${groupId}`);
  
  const now = new Date();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  // Get posts from group members (since posts don't have direct groupId)
  const groupMemberIds = await db
    .select({ userId: groupMembers.userId })
    .from(groupMembers)
    .where(eq(groupMembers.groupId, groupId));
  
  const memberIds = groupMemberIds.map(m => m.userId);
  
  const [recentPosts] = await db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(posts)
    .where(
      and(
        sql`${posts.userId} IN (${sql.join(memberIds.map(id => sql`${id}`), sql`, `)})`,
        gte(posts.createdAt, sevenDaysAgo)
      )
    );
  
  const postsPerDay = (recentPosts?.count || 0) / 7;
  
  const [newMembers] = await db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(groupMembers)
    .where(
      and(
        eq(groupMembers.groupId, groupId),
        gte(groupMembers.joinedAt, sevenDaysAgo)
      )
    );
  
  const newMembersPerWeek = newMembers?.count || 0;
  
  const [totalMembers] = await db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(groupMembers)
    .where(eq(groupMembers.groupId, groupId));
  
  const memberCount = totalMembers?.count || 0;
  
  let engagementScore = 0;
  if (postsPerDay > 5) engagementScore = 100;
  else if (postsPerDay > 2) engagementScore = 75;
  else if (postsPerDay > 1) engagementScore = 50;
  else if (postsPerDay > 0.5) engagementScore = 25;
  
  let growthRate = 0;
  if (memberCount > 0) {
    growthRate = (newMembersPerWeek / memberCount) * 100;
  }
  
  const sentiment: 'positive' | 'neutral' | 'negative' = 
    postsPerDay > 2 && newMembersPerWeek > 0 ? 'positive' :
    postsPerDay > 0.5 ? 'neutral' : 'negative';
  
  const score = Math.min(100, Math.round((engagementScore * 0.6) + (Math.min(growthRate, 50) * 0.4)));
  
  console.log(`✅ Health score: ${score}/100`);
  
  return {
    score,
    engagementScore,
    growthRate,
    sentiment,
    postsPerDay,
    newMembersPerWeek
  };
}

export async function getGroupInsights(groupId: number): Promise<GroupInsights> {
  console.log(`📊 Analytics: Generating insights for group ${groupId}`);
  
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  // Get posts from group members
  const groupMemberIds = await db
    .select({ userId: groupMembers.userId })
    .from(groupMembers)
    .where(eq(groupMembers.groupId, groupId));
  
  const memberIds = groupMemberIds.map(m => m.userId);
  
  const recentPosts = memberIds.length > 0 ? await db
    .select({
      userId: posts.userId,
      username: sql<string>`u.username`,
      createdAt: posts.createdAt,
      content: posts.content
    })
    .from(posts)
    .leftJoin(sql`users u`, sql`${posts.userId} = u.id`)
    .where(
      and(
        sql`${posts.userId} IN (${sql.join(memberIds.map(id => sql`${id}`), sql`, `)})`,
        gte(posts.createdAt, sevenDaysAgo)
      )
    )
    .orderBy(desc(posts.createdAt))
    .limit(100) : [];
  
  const hourCounts = new Map<number, number>();
  recentPosts.forEach(post => {
    if (post.createdAt) {
      const hour = new Date(post.createdAt).getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    }
  });
  
  const peakActivityTimes = Array.from(hourCounts.entries())
    .map(([hour, count]) => ({ hour, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  const contributorCounts = new Map<number, { username: string; count: number }>();
  recentPosts.forEach(post => {
    if (post.userId && post.username) {
      const existing = contributorCounts.get(post.userId);
      if (existing) {
        existing.count++;
      } else {
        contributorCounts.set(post.userId, { username: post.username, count: 1 });
      }
    }
  });
  
  const topContributors = Array.from(contributorCounts.entries())
    .map(([userId, data]) => ({
      userId,
      username: data.username,
      postCount: data.count
    }))
    .sort((a, b) => b.postCount - a.postCount)
    .slice(0, 5);
  
  const words = recentPosts
    .map(p => p.content || '')
    .join(' ')
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 4 && !['about', 'there', 'would', 'should', 'could'].includes(w));
  
  const wordCounts = new Map<string, number>();
  words.forEach(word => {
    wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
  });
  
  const trendingTopics = Array.from(wordCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
  
  const recentActivity = recentPosts.length > 10 ? 'Very active' :
                        recentPosts.length > 5 ? 'Active' :
                        recentPosts.length > 0 ? 'Moderate' : 'Quiet';
  
  console.log(`✅ Generated insights: ${topContributors.length} contributors, ${trendingTopics.length} topics`);
  
  return {
    peakActivityTimes,
    topContributors,
    trendingTopics,
    recentActivity
  };
}
