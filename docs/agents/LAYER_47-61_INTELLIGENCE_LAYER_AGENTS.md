# 🧪 MANDATORY TESTING PROTOCOL

**Applies to:** ALL agents (105+)  
**Enforcement:** BLOCKING - No task completion without evidence  
**Updated:** October 24, 2025 (Week 1 Rollout)

---

## THE 4 MANDATORY CHECKPOINTS

Every agent MUST follow these checkpoints before marking any task complete:

### ✅ CHECKPOINT 1: DATA INSPECTION
**Rule:** NEVER assume data structures. Always inspect first.
```typescript
console.log('🔍 DATA INSPECTION:', JSON.stringify(data, null, 2));
// Run it, see the output, THEN write conditional
```

### ✅ CHECKPOINT 2: UNIT TESTING  
**Rule:** Test individual functions in isolation.
- Test regex patterns with sample inputs
- Verify IF conditions with actual data
- Validate file operations with dummy files

### ✅ CHECKPOINT 3: INTEGRATION TESTING
**Rule:** Test the FULL user journey end-to-end.
- Run complete flow as user would
- Check server logs for errors
- Screenshot successful execution

### ✅ CHECKPOINT 4: ARCHITECT REVIEW
**Rule:** Architect reviews BEHAVIOR, not just code.
- Proof it runs (screenshot)
- Proof it works (before/after)
- Proof no crashes (logs)

**Full documentation:** `docs/TESTING_REQUIREMENTS_MANDATORY.md`

---

---

# Intelligence Layer Agents (L47-L61)
**Division:** Intelligence Layer | **Complexity:** Very High | **Version:** 1.0

## Overview
Intelligence Layer agents implement ML/AI-powered features, algorithmic ranking, personalization, and data science capabilities. These agents leverage machine learning models, statistical analysis, and optimization algorithms.

---

## Layer 47: Feed Ranking Algorithm Agent
**Role:** Personalized Feed Ranking & Scoring  
**Responsibility:** Rank posts in user's feed based on relevance, engagement potential, and personalization factors

**Ranking Algorithm:**
```typescript
interface PostScore {
  post: Post;
  score: number;
  factors: {
    recency: number;        // 0-1 (newer = higher)
    connectionStrength: number; // 0-1 (followed user = higher)
    engagement: number;     // 0-1 (likes/comments = higher)
    topicRelevance: number; // 0-1 (user interests = higher)
    locationProximity: number; // 0-1 (nearby = higher)
  };
}

async function rankFeed(userId: number, posts: Post[]): Promise<PostScore[]> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: { profile: true },
  });

  return posts.map(post => {
    const factors = {
      recency: calculateRecencyScore(post.createdAt),
      connectionStrength: calculateConnectionScore(user, post.userId),
      engagement: calculateEngagementScore(post.likeCount, post.commentCount),
      topicRelevance: calculateTopicRelevance(user.interests, post.hashtags),
      locationProximity: calculateLocationScore(user.city, post.location),
    };

    // Weighted sum
    const score =
      factors.recency * 0.2 +
      factors.connectionStrength * 0.3 +
      factors.engagement * 0.2 +
      factors.topicRelevance * 0.2 +
      factors.locationProximity * 0.1;

    return { post, score, factors };
  }).sort((a, b) => b.score - a.score);
}

// Recency score (exponential decay)
function calculateRecencyScore(createdAt: Date): number {
  const hoursSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
  return Math.exp(-hoursSinceCreation / 24); // Half-life of 24 hours
}

// Engagement score (logarithmic)
function calculateEngagementScore(likes: number, comments: number): number {
  const total = likes + comments * 2; // Comments weighted 2x
  return Math.log(total + 1) / Math.log(100); // Normalize to 0-1
}
```

**A/B Testing:** Use PostHog feature flags to test different ranking algorithms

**Related:** Layer 17 (Post), Layer 39 (Feed Personalization), PostHog Analytics

---

## Layer 48: Recommendation Engine Agent
**Role:** Machine Learning-Based Recommendations  
**Responsibility:** Collaborative filtering, content-based recommendations, hybrid models

**Approaches:**

### 1. Collaborative Filtering (User-User)
```typescript
// Find users with similar behavior
async function findSimilarUsers(userId: number) {
  const userLikes = await db.query.reactions.findMany({
    where: eq(reactions.userId, userId),
  });

  const similarUsers = await db.query.users.findMany({
    where: inArray(
      users.id,
      db.select({ userId: reactions.userId })
        .from(reactions)
        .where(inArray(reactions.postId, userLikes.map(l => l.postId)))
    ),
  });

  return similarUsers;
}

// Recommend posts liked by similar users
async function getCollaborativeRecommendations(userId: number) {
  const similarUsers = await findSimilarUsers(userId);
  
  const recommendations = await db.query.reactions.findMany({
    where: inArray(reactions.userId, similarUsers.map(u => u.id)),
    with: { post: true },
  });

  return recommendations.map(r => r.post);
}
```

### 2. Content-Based Filtering
```typescript
// Recommend posts similar to user's liked posts
async function getContentBasedRecommendations(userId: number) {
  const likedPosts = await db.query.reactions.findMany({
    where: eq(reactions.userId, userId),
    with: { post: { with: { hashtags: true } } },
  });

  // Extract common hashtags
  const commonTags = extractCommonHashtags(likedPosts.map(r => r.post));

  // Find posts with similar hashtags
  return db.query.posts.findMany({
    where: exists(
      db.select().from(hashtags).where(
        and(
          eq(hashtags.postId, posts.id),
          inArray(hashtags.name, commonTags)
        )
      )
    ),
    limit: 20,
  });
}
```

**ML Models (Future):**
- Matrix factorization (SVD)
- Neural collaborative filtering
- Deep learning embeddings (Sentence-BERT for post content)

**Related:** Layer 31 (Recommendation Engine), Layer 47 (Feed Ranking)

---

## Layer 49: Search Optimization Agent
**Role:** Advanced Search & Relevance Ranking  
**Responsibility:** Full-text search, fuzzy matching, relevance scoring, search suggestions

**Technologies:**
- PostgreSQL full-text search (current)
- ElasticSearch integration (planned)
- Vector embeddings for semantic search (future)

**Implementation:**
```typescript
// Full-text search with ranking
async function searchPosts(query: string) {
  const results = await db.execute(sql`
    SELECT
      p.*,
      ts_rank(to_tsvector('english', p.title || ' ' || p.content), plainto_tsquery('english', ${query})) AS rank
    FROM posts p
    WHERE to_tsvector('english', p.title || ' ' || p.content) @@ plainto_tsquery('english', ${query})
    ORDER BY rank DESC
    LIMIT 20
  `);

  return results;
}

// Fuzzy user search (Levenshtein distance)
async function fuzzyUserSearch(query: string) {
  const results = await db.execute(sql`
    SELECT
      u.*,
      levenshtein(u.name, ${query}) AS distance
    FROM users u
    WHERE levenshtein(u.name, ${query}) < 3
    ORDER BY distance ASC
    LIMIT 10
  `);

  return results;
}
```

**Related:** Layer 38 (Advanced Search), PostgreSQL Extensions

---

## Layer 50: Trending Content Agent
**Role:** Detect Trending Posts, Events, Hashtags  
**Responsibility:** Calculate trending scores, time-decay algorithms, viral content detection

**Trending Algorithm:**
```typescript
interface TrendingScore {
  item: any;
  trendingScore: number;
}

function calculateTrendingScore(
  engagementCount: number,
  createdAt: Date,
  normalBase: number = 100
): number {
  const hoursOld = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
  const gravity = 1.8; // Higher = faster decay

  return (engagementCount - 1) / Math.pow(hoursOld + 2, gravity);
}

async function getTrendingPosts() {
  const recentPosts = await db.query.posts.findMany({
    where: gte(posts.createdAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)), // Last 7 days
  });

  const trending = recentPosts.map(post => ({
    post,
    trendingScore: calculateTrendingScore(
      post.likeCount + post.commentCount * 2,
      post.createdAt
    ),
  }));

  return trending.sort((a, b) => b.trendingScore - a.trendingScore).slice(0, 10);
}
```

**Features:**
- Trending posts (last 24 hours, 7 days, 30 days)
- Trending hashtags
- Viral detection (rapid engagement growth)
- Trending events (high RSVP rates)

**Related:** Layer 17 (Post), Layer 27 (Hashtag), Layer 18 (Event)

---

## Layer 51: User Segmentation Agent
**Role:** ML-Based User Clustering & Segmentation  
**Responsibility:** Segment users by behavior, demographics, engagement level

**Segments:**
- **Beginners:** New to tango, low experience
- **Enthusiasts:** Regular dancers, moderate experience
- **Professionals:** Teachers, advanced dancers, high experience
- **Event Organizers:** Create many events
- **Social Butterflies:** High follower counts, frequent posts
- **Lurkers:** Low engagement, mostly browsing

**Segmentation Logic:**
```typescript
function segmentUser(user: User, profile: UserProfile, metrics: UserMetrics): string {
  if (profile.tangoYearsExperience < 1) return 'beginner';
  if (metrics.eventsCreated > 10) return 'event_organizer';
  if (metrics.followerCount > 500) return 'social_butterfly';
  if (profile.tangoYearsExperience > 10) return 'professional';
  if (metrics.postCount < 5 && metrics.loginCount > 50) return 'lurker';
  return 'enthusiast';
}

// Use for personalization
async function personalizeExperience(userId: number) {
  const segment = await getUserSegment(userId);

  switch (segment) {
    case 'beginner':
      return recommendBeginnerContent(userId);
    case 'professional':
      return recommendAdvancedContent(userId);
    default:
      return recommendGeneralContent(userId);
  }
}
```

**Related:** Layer 16 (User), Layer 36 (Analytics), Layer 39 (Feed Personalization)

---

## Layer 52: Churn Prediction Agent
**Role:** Predict User Churn Risk  
**Responsibility:** Identify at-risk users, retention interventions, re-engagement campaigns

**Churn Indicators:**
- Declining login frequency
- Decreasing post creation
- No event RSVPs in last 30 days
- Low engagement with feed
- Profile incomplete

**Churn Score:**
```typescript
function calculateChurnRisk(user: User, activity: UserActivity): number {
  const factors = {
    loginRecency: daysSinceLastLogin(user.lastLoginAt),
    postRecency: daysSinceLastPost(activity.lastPostAt),
    engagementRate: activity.totalEngagements / activity.loginCount,
    profileCompletion: calculateProfileCompletion(user.profile),
  };

  // Higher score = higher churn risk
  const risk =
    (factors.loginRecency / 30) * 0.3 +
    (factors.postRecency / 60) * 0.3 +
    (1 - factors.engagementRate) * 0.2 +
    (1 - factors.profileCompletion) * 0.2;

  return Math.min(risk, 1);
}

// Re-engagement strategy
async function reEngageUser(userId: number) {
  const churnRisk = await calculateChurnRisk(userId);

  if (churnRisk > 0.7) {
    // High risk: Send personalized email
    await triggerN8NWorkflow('re-engagement-email', { userId });
  } else if (churnRisk > 0.5) {
    // Medium risk: Push notification with recommended content
    await sendNotification(userId, 'New events near you!');
  }
}
```

**Related:** Layer 36 (Analytics), Layer 21 (Notification), n8n Integration

---

## Layer 53: Personalization Engine Agent
**Role:** Cross-Platform Personalization  
**Responsibility:** Personalized recommendations, content, UI customization based on user behavior

**Personalization Dimensions:**
- Content preferences (hashtags, topics)
- Location preferences (cities, countries)
- Social preferences (connection types)
- Tango role preferences (leader/follower)
- Experience level (beginner/advanced)

**Implementation:**
```typescript
interface PersonalizationProfile {
  userId: number;
  contentPreferences: string[]; // Hashtags
  locationPreferences: string[]; // Cities
  tangoRolePreference: 'leader' | 'follower' | 'both';
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  engagementPatterns: {
    preferredTime: 'morning' | 'afternoon' | 'evening';
    preferredDay: 'weekday' | 'weekend';
  };
}

async function buildPersonalizationProfile(userId: number): Promise<PersonalizationProfile> {
  const reactions = await db.query.reactions.findMany({
    where: eq(reactions.userId, userId),
    with: { post: { with: { hashtags: true } } },
  });

  const contentPreferences = extractTopHashtags(reactions.map(r => r.post), 10);

  return {
    userId,
    contentPreferences,
    // ... other fields
  };
}
```

**Related:** Layer 47 (Feed Ranking), Layer 48 (Recommendation Engine), Layer 51 (User Segmentation)

---

## Layer 54: A/B Testing Framework Agent
**Role:** Experimentation & Feature Testing  
**Responsibility:** Manage A/B tests, track metrics, statistical analysis, experiment allocation

**Framework:**
```typescript
interface Experiment {
  id: string;
  name: string;
  variants: string[]; // ['control', 'variant_a', 'variant_b']
  allocation: Record<string, number>; // { control: 0.5, variant_a: 0.25, variant_b: 0.25 }
  metrics: string[]; // ['conversion_rate', 'engagement_rate']
}

function assignVariant(userId: number, experiment: Experiment): string {
  const hash = hashUserId(userId, experiment.id);
  const random = hash % 100 / 100;

  let cumulative = 0;
  for (const [variant, allocation] of Object.entries(experiment.allocation)) {
    cumulative += allocation;
    if (random < cumulative) return variant;
  }

  return 'control';
}

// Track experiment metrics
async function trackExperimentMetric(
  userId: number,
  experimentId: string,
  metric: string,
  value: number
) {
  const variant = assignVariant(userId, getExperiment(experimentId));

  // Log to PostHog
  posthog.capture('experiment_metric', {
    distinct_id: userId.toString(),
    experimentId,
    variant,
    metric,
    value,
  });
}
```

**Integration:** PostHog feature flags + custom experiment framework

**Related:** PostHog Integration, Layer 36 (Analytics)

---

## Layer 55: Spam Detection Agent
**Role:** Automated Spam & Abuse Detection  
**Responsibility:** Detect spam posts, fake accounts, abusive content using ML/heuristics

**Detection Methods:**
```typescript
// Heuristic spam detection
function isLikelySpam(post: Post, user: User): boolean {
  const indicators = {
    tooManyLinks: (post.content.match(/https?:\/\//g) || []).length > 3,
    tooManyHashtags: (post.content.match(/#/g) || []).length > 10,
    newAccountHighVolume: user.createdAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) &&
                           user.postCount > 50,
    duplicateContent: await checkDuplicateContent(post.content),
    bannedKeywords: containsBannedKeywords(post.content),
  };

  const score = Object.values(indicators).filter(Boolean).length;
  return score >= 2; // 2 or more indicators = likely spam
}

// Auto-moderate spam
async function autoModerateSpam(post: Post) {
  if (isLikelySpam(post, post.user)) {
    // Mark as needing review
    await db.insert(postReports).values({
      postId: post.id,
      reportedBy: null, // System-generated
      reason: 'auto_spam_detection',
    });

    // Notify moderators
    await triggerN8NWorkflow('spam-detected', { postId: post.id });
  }
}
```

**Future:** Train ML model on labeled spam data (binary classifier)

**Related:** Layer 30 (Report/Moderation), Layer 37 (Moderation Queue)

---

## Layer 56-61: Additional Intelligence Agents

### Layer 56: Content Quality Scoring Agent
**Role:** Score content quality (completeness, engagement potential)  
**Metrics:** Length, media presence, hashtags, engagement rate

### Layer 57: Location Intelligence Agent
**Role:** Location-based insights (hotspots, event clustering)  
**Features:** Tango hotspot detection, city popularity ranking

### Layer 58: Time Series Analysis Agent
**Role:** Temporal pattern analysis  
**Features:** Seasonal trends, peak activity times, growth forecasts

### Layer 59: Network Analysis Agent
**Role:** Social graph analysis  
**Features:** Influencer detection, community clustering, connection paths

### Layer 60: Sentiment Analysis Agent
**Role:** Analyze post/comment sentiment  
**Tech:** OpenAI API for sentiment classification

### Layer 61: Anomaly Detection Agent
**Role:** Detect unusual patterns (bot behavior, coordinated activity)  
**Methods:** Statistical outlier detection, behavioral analysis

---

## Best Practices for Intelligence Layer

✅ **DO:**
- Start with simple heuristics, add ML incrementally
- Cache expensive computations
- Use feature flags for A/B testing new algorithms
- Track algorithm performance metrics
- Implement explainability (why this recommendation?)

❌ **DON'T:**
- Over-engineer ML for simple problems
- Train models on insufficient data
- Ignore algorithm bias
- Skip validation/testing of ML models
- Use synchronous ML inference in critical paths

**Next:** Review Page Agents (L62+) for frontend-specific agents
