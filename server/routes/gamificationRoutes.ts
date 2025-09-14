// ESA LIFE CEO 61×21 - Phase 20: Gamification API Routes
import { Router } from "express";
import { db } from "../db";
import { 
  userPoints, 
  achievements, 
  userAchievements, 
  challenges, 
  userChallenges,
  leaderboards,
  pointTransactions,
  users
} from "../../shared/schema";
import { eq, and, desc, gte, lte, or, inArray, sql } from "drizzle-orm";
import { requireAuth, optionalAuth } from "../middleware/secureAuth";
import { z } from "zod";

const router = Router();

// Point values for actions
const POINT_VALUES = {
  POST_CREATED: 10,
  POST_LIKED: 1,
  POST_SHARED: 5,
  COMMENT_POSTED: 3,
  EVENT_CREATED: 50,
  EVENT_ATTENDED: 20,
  EVENT_ORGANIZED: 100,
  STREAM_STARTED: 30,
  STREAM_WATCHED: 5,
  STREAM_LIKED: 2,
  FRIEND_ADDED: 5,
  GROUP_JOINED: 10,
  GROUP_CREATED: 25,
  DAILY_LOGIN: 5,
  PROFILE_COMPLETED: 50,
  FIRST_POST: 25,
  HELPFUL_VOTE: 2,
  BEST_ANSWER: 20,
  MENTOR_SESSION: 30,
};

// Award points
router.post("/points/award", requireAuth, async (req, res) => {
  try {
    const { action, referenceType, referenceId, description } = req.body;
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const points = POINT_VALUES[action as keyof typeof POINT_VALUES] || 0;
    if (points === 0) {
      return res.status(400).json({ error: "Invalid action" });
    }

    // Award points
    await db.transaction(async (tx) => {
      // Get or create user points
      let [userPointsRecord] = await tx
        .select()
        .from(userPoints)
        .where(eq(userPoints.userId, userId))
        .limit(1);

      if (!userPointsRecord) {
        [userPointsRecord] = await tx
          .insert(userPoints)
          .values({
            userId,
            totalPoints: points,
            weeklyPoints: points,
            monthlyPoints: points,
            currentLevel: 1,
            levelProgress: points,
            lastActiveDate: new Date(),
          })
          .returning();
      } else {
        const newTotal = userPointsRecord.totalPoints + points;
        [userPointsRecord] = await tx
          .update(userPoints)
          .set({
            totalPoints: newTotal,
            weeklyPoints: userPointsRecord.weeklyPoints + points,
            monthlyPoints: userPointsRecord.monthlyPoints + points,
            lastActiveDate: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(userPoints.userId, userId))
          .returning();
      }

      // Log transaction
      await tx.insert(pointTransactions).values({
        userId,
        points,
        action,
        referenceType,
        referenceId,
        description: description || `Earned ${points} points for ${action}`,
      });
    });

    res.json({ success: true, points });
  } catch (error: any) {
    console.error("Failed to award points:", error);
    res.status(500).json({ error: error.message || "Failed to award points" });
  }
});

// Get user points and stats
router.get("/users/:userId/stats", optionalAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const [stats] = await db
      .select()
      .from(userPoints)
      .where(eq(userPoints.userId, parseInt(userId)))
      .limit(1);

    if (!stats) {
      return res.json({ 
        success: true, 
        stats: {
          totalPoints: 0,
          currentLevel: 1,
          levelProgress: 0,
          weeklyPoints: 0,
          monthlyPoints: 0,
          streakDays: 0,
        }
      });
    }

    res.json({ success: true, stats });
  } catch (error: any) {
    console.error("Failed to get user stats:", error);
    res.status(500).json({ error: error.message || "Failed to get user stats" });
  }
});

// Get user achievements
router.get("/users/:userId/achievements", optionalAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const achievementsList = await db
      .select({
        achievement: achievements,
        userAchievement: userAchievements,
      })
      .from(userAchievements)
      .leftJoin(achievements, eq(userAchievements.achievementId, achievements.id))
      .where(eq(userAchievements.userId, parseInt(userId)))
      .orderBy(desc(userAchievements.unlockedAt));

    const formatted = achievementsList.map(row => ({
      ...row.achievement,
      unlockedAt: row.userAchievement?.unlockedAt,
      progress: row.userAchievement?.progress,
      showcased: row.userAchievement?.showcased,
    }));

    res.json({ success: true, achievements: formatted });
  } catch (error: any) {
    console.error("Failed to get user achievements:", error);
    res.status(500).json({ error: error.message || "Failed to get user achievements" });
  }
});

// Get all available achievements
router.get("/achievements", optionalAuth, async (req, res) => {
  try {
    const { category, tier } = req.query;
    
    let query = db
      .select()
      .from(achievements)
      .where(eq(achievements.isActive, true));

    if (category) {
      query = query.where(
        and(
          eq(achievements.isActive, true),
          eq(achievements.category, category as string)
        )
      );
    }

    if (tier) {
      query = query.where(
        and(
          eq(achievements.isActive, true),
          eq(achievements.tier, tier as string)
        )
      );
    }

    const allAchievements = await query.orderBy(achievements.category, achievements.tier);
    
    res.json({ success: true, achievements: allAchievements });
  } catch (error: any) {
    console.error("Failed to get achievements:", error);
    res.status(500).json({ error: error.message || "Failed to get achievements" });
  }
});

// Unlock achievement
router.post("/achievements/:achievementId/unlock", requireAuth, async (req, res) => {
  try {
    const { achievementId } = req.params;
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Check if already unlocked
    const existing = await db
      .select()
      .from(userAchievements)
      .where(
        and(
          eq(userAchievements.userId, userId),
          eq(userAchievements.achievementId, achievementId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return res.json({ success: true, achievement: existing[0] });
    }

    // Get achievement details
    const [achievement] = await db
      .select()
      .from(achievements)
      .where(eq(achievements.id, achievementId))
      .limit(1);

    if (!achievement) {
      return res.status(404).json({ error: "Achievement not found" });
    }

    // Unlock achievement
    const [unlockedAchievement] = await db
      .insert(userAchievements)
      .values({
        userId,
        achievementId,
        progress: 100,
        showcased: false,
        notified: false,
      })
      .returning();

    // Award achievement points
    if (achievement.points) {
      await db.insert(pointTransactions).values({
        userId,
        points: achievement.points,
        action: "ACHIEVEMENT_UNLOCKED",
        referenceType: "achievement",
        referenceId: achievementId,
        description: `Unlocked achievement: ${achievement.name}`,
      });

      // Update user points
      await db
        .update(userPoints)
        .set({
          totalPoints: sql`${userPoints.totalPoints} + ${achievement.points}`,
        })
        .where(eq(userPoints.userId, userId));
    }

    res.json({ success: true, achievement: unlockedAchievement });
  } catch (error: any) {
    console.error("Failed to unlock achievement:", error);
    res.status(500).json({ error: error.message || "Failed to unlock achievement" });
  }
});

// Get challenges
router.get("/challenges", optionalAuth, async (req, res) => {
  try {
    const { type, status } = req.query;
    const now = new Date();
    
    let query = db
      .select()
      .from(challenges)
      .where(
        and(
          eq(challenges.status, status || "active"),
          gte(challenges.endDate, now)
        )
      );

    if (type) {
      query = query.where(
        and(
          eq(challenges.status, status || "active"),
          eq(challenges.type, type as string),
          gte(challenges.endDate, now)
        )
      );
    }

    const activeChallenges = await query.orderBy(challenges.startDate);
    
    res.json({ success: true, challenges: activeChallenges });
  } catch (error: any) {
    console.error("Failed to get challenges:", error);
    res.status(500).json({ error: error.message || "Failed to get challenges" });
  }
});

// Join a challenge
router.post("/challenges/:challengeId/join", requireAuth, async (req, res) => {
  try {
    const { challengeId } = req.params;
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Check if challenge exists
    const [challenge] = await db
      .select()
      .from(challenges)
      .where(eq(challenges.id, challengeId))
      .limit(1);

    if (!challenge) {
      return res.status(404).json({ error: "Challenge not found" });
    }

    // Check if already joined
    const existing = await db
      .select()
      .from(userChallenges)
      .where(
        and(
          eq(userChallenges.userId, userId),
          eq(userChallenges.challengeId, challengeId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return res.json({ success: true, userChallenge: existing[0] });
    }

    // Join challenge
    const [userChallenge] = await db
      .insert(userChallenges)
      .values({
        userId,
        challengeId,
        progress: {},
        progressPercentage: 0,
        completed: false,
      })
      .returning();

    // Update participant count
    await db
      .update(challenges)
      .set({
        currentParticipants: (challenge.currentParticipants || 0) + 1,
      })
      .where(eq(challenges.id, challengeId));

    res.json({ success: true, userChallenge });
  } catch (error: any) {
    console.error("Failed to join challenge:", error);
    res.status(500).json({ error: error.message || "Failed to join challenge" });
  }
});

// Update challenge progress
router.patch("/challenges/:challengeId/progress", requireAuth, async (req, res) => {
  try {
    const { challengeId } = req.params;
    const { progress: progressData } = req.body;
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const [userChallenge] = await db
      .select()
      .from(userChallenges)
      .where(
        and(
          eq(userChallenges.userId, userId),
          eq(userChallenges.challengeId, challengeId)
        )
      )
      .limit(1);

    if (!userChallenge) {
      return res.status(404).json({ error: "Not enrolled in challenge" });
    }

    const [updated] = await db
      .update(userChallenges)
      .set({
        progress: progressData,
        progressPercentage: Math.min(100, progressData.percentage || 0),
        completed: progressData.percentage >= 100,
        completedAt: progressData.percentage >= 100 ? new Date() : null,
      })
      .where(
        and(
          eq(userChallenges.userId, userId),
          eq(userChallenges.challengeId, challengeId)
        )
      )
      .returning();

    res.json({ success: true, userChallenge: updated });
  } catch (error: any) {
    console.error("Failed to update challenge progress:", error);
    res.status(500).json({ error: error.message || "Failed to update challenge progress" });
  }
});

// Get leaderboards
router.get("/leaderboards/:type/:period", optionalAuth, async (req, res) => {
  try {
    const { type, period } = req.params;
    const { category, scopeId } = req.query;
    
    const [leaderboard] = await db
      .select()
      .from(leaderboards)
      .where(
        and(
          eq(leaderboards.type, type),
          eq(leaderboards.period, period),
          category ? eq(leaderboards.category, category as string) : sql`category = 'points'`,
          scopeId ? eq(leaderboards.scopeId, scopeId as string) : sql`scope_id IS NULL`
        )
      )
      .limit(1);

    if (!leaderboard) {
      // Generate leaderboard on the fly
      let query = db
        .select({
          userId: userPoints.userId,
          points: period === "weekly" ? userPoints.weeklyPoints : 
                 period === "monthly" ? userPoints.monthlyPoints : 
                 userPoints.totalPoints,
          user: {
            id: users.id,
            name: users.name,
            username: users.username,
            profileImage: users.profileImage,
          },
        })
        .from(userPoints)
        .leftJoin(users, eq(userPoints.userId, users.id));

      if (type === "city" && scopeId) {
        query = query.where(eq(users.city, scopeId as string));
      }

      const topUsers = await query
        .orderBy(desc(userPoints.totalPoints))
        .limit(100);

      const rankings = topUsers.map((user, index) => ({
        rank: index + 1,
        userId: user.userId,
        score: user.points,
        user: user.user,
      }));

      return res.json({ success: true, leaderboard: { type, period, rankings } });
    }

    res.json({ success: true, leaderboard });
  } catch (error: any) {
    console.error("Failed to get leaderboard:", error);
    res.status(500).json({ error: error.message || "Failed to get leaderboard" });
  }
});

// Get point transactions history
router.get("/users/:userId/points/history", requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUserId = (req as any).user?.id;
    
    // Users can only see their own history
    if (parseInt(userId) !== requestingUserId) {
      return res.status(403).json({ error: "Access denied" });
    }

    const transactions = await db
      .select()
      .from(pointTransactions)
      .where(eq(pointTransactions.userId, parseInt(userId)))
      .orderBy(desc(pointTransactions.createdAt))
      .limit(50);

    res.json({ success: true, transactions });
  } catch (error: any) {
    console.error("Failed to get point history:", error);
    res.status(500).json({ error: error.message || "Failed to get point history" });
  }
});

// Update daily streak
router.post("/users/:userId/streak", requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUserId = (req as any).user?.id;
    
    if (parseInt(userId) !== requestingUserId) {
      return res.status(403).json({ error: "Access denied" });
    }

    const [userPointsRecord] = await db
      .select()
      .from(userPoints)
      .where(eq(userPoints.userId, parseInt(userId)))
      .limit(1);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let newStreak = 1;
    let streakBonus = 0;

    if (userPointsRecord && userPointsRecord.lastActiveDate) {
      const lastActive = new Date(userPointsRecord.lastActiveDate);
      lastActive.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 0) {
        // Already logged in today
        return res.json({ success: true, streak: userPointsRecord.streakDays });
      } else if (daysDiff === 1) {
        // Consecutive day
        newStreak = (userPointsRecord.streakDays || 0) + 1;
        
        // Streak bonuses
        if (newStreak % 7 === 0) {
          streakBonus = 50; // Weekly streak bonus
        }
        if (newStreak % 30 === 0) {
          streakBonus = 200; // Monthly streak bonus
        }
      }
    }

    // Update streak
    await db
      .update(userPoints)
      .set({
        streakDays: newStreak,
        lastActiveDate: new Date(),
        totalPoints: sql`${userPoints.totalPoints} + ${POINT_VALUES.DAILY_LOGIN + streakBonus}`,
      })
      .where(eq(userPoints.userId, parseInt(userId)));

    // Log points
    await db.insert(pointTransactions).values({
      userId: parseInt(userId),
      points: POINT_VALUES.DAILY_LOGIN + streakBonus,
      action: "DAILY_LOGIN",
      description: `Daily login (${newStreak} day streak)${streakBonus > 0 ? ` + ${streakBonus} bonus` : ''}`,
    });

    res.json({ success: true, streak: newStreak, pointsEarned: POINT_VALUES.DAILY_LOGIN + streakBonus });
  } catch (error: any) {
    console.error("Failed to update streak:", error);
    res.status(500).json({ error: error.message || "Failed to update streak" });
  }
});

export default router;