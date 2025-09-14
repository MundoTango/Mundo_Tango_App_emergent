// ESA LIFE CEO 61x21 - Phase 13: OAuth 2.0 Configuration
// Comprehensive OAuth implementation with Google and GitHub providers

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { storage } from '../storage';
import { db } from '../db';
import { users, userProfiles, oauthProviders } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'mundo-tango-secret-key';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5000';

// OAuth provider configurations
export const OAUTH_PROVIDERS = {
  google: {
    clientID: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackURL: `${CLIENT_URL}/api/auth/google/callback`,
    scope: ['profile', 'email', 'openid'],
  },
  github: {
    clientID: process.env.GITHUB_CLIENT_ID || '',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    callbackURL: `${CLIENT_URL}/api/auth/github/callback`,
    scope: ['user:email', 'read:user'],
  },
};

// OAuth user data interface
interface OAuthUserData {
  provider: string;
  providerId: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
  username?: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
}

// Helper to generate secure tokens
export function generateSecureToken(length = 32): string {
  return randomBytes(length).toString('hex');
}

// Helper to create JWT for OAuth users
export function createOAuthJWT(userId: number, provider: string): string {
  return jwt.sign(
    {
      userId,
      provider,
      type: 'oauth',
      iat: Math.floor(Date.now() / 1000),
    },
    JWT_SECRET,
    {
      expiresIn: '7d',
      issuer: 'esa-life-ceo',
      audience: 'mundo-tango',
    }
  );
}

// Upsert OAuth user
export async function upsertOAuthUser(userData: OAuthUserData) {
  try {
    // Check if OAuth provider record exists
    const existingProvider = await db
      .select()
      .from(oauthProviders)
      .where(
        and(
          eq(oauthProviders.provider, userData.provider),
          eq(oauthProviders.providerId, userData.providerId)
        )
      )
      .limit(1);

    let userId: number;

    if (existingProvider.length > 0) {
      // User exists, update their information
      userId = existingProvider[0].userId;
      
      // Update user information
      await db
        .update(users)
        .set({
          name: userData.name,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImage: userData.profileImage,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));

      // Update OAuth provider tokens
      await db
        .update(oauthProviders)
        .set({
          accessToken: userData.accessToken,
          refreshToken: userData.refreshToken,
          expiresAt: userData.expiresAt,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(oauthProviders.provider, userData.provider),
            eq(oauthProviders.providerId, userData.providerId)
          )
        );
    } else {
      // Check if email already exists
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, userData.email))
        .limit(1);

      if (existingUser.length > 0) {
        // Link OAuth to existing user
        userId = existingUser[0].id;
        
        // Update user with OAuth info
        await db
          .update(users)
          .set({
            profileImage: userData.profileImage || existingUser[0].profileImage,
            isVerified: true, // OAuth users are verified
            updatedAt: new Date(),
          })
          .where(eq(users.id, userId));
      } else {
        // Create new user
        const newUser = await db
          .insert(users)
          .values({
            email: userData.email,
            username: userData.username || userData.email.split('@')[0],
            name: userData.name,
            firstName: userData.firstName,
            lastName: userData.lastName,
            profileImage: userData.profileImage,
            password: '', // No password for OAuth users
            isVerified: true,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();

        userId = newUser[0].id;

        // Create user profile
        await db.insert(userProfiles).values({
          userId,
          role: 'dancer',
          displayName: userData.name,
          avatarUrl: userData.profileImage,
          isActive: true,
        });
      }

      // Create OAuth provider record
      await db.insert(oauthProviders).values({
        userId,
        provider: userData.provider,
        providerId: userData.providerId,
        accessToken: userData.accessToken,
        refreshToken: userData.refreshToken,
        expiresAt: userData.expiresAt,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return userId;
  } catch (error) {
    console.error('Error upserting OAuth user:', error);
    throw error;
  }
}

// Configure Google OAuth strategy
export function configureGoogleOAuth() {
  if (!OAUTH_PROVIDERS.google.clientID || !OAUTH_PROVIDERS.google.clientSecret) {
    console.warn('Google OAuth not configured - missing credentials');
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: OAUTH_PROVIDERS.google.clientID,
        clientSecret: OAUTH_PROVIDERS.google.clientSecret,
        callbackURL: OAUTH_PROVIDERS.google.callbackURL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const userData: OAuthUserData = {
            provider: 'google',
            providerId: profile.id,
            email: profile.emails?.[0]?.value || '',
            name: profile.displayName,
            firstName: profile.name?.givenName,
            lastName: profile.name?.familyName,
            profileImage: profile.photos?.[0]?.value,
            username: profile.emails?.[0]?.value.split('@')[0],
            accessToken,
            refreshToken,
            expiresAt: new Date(Date.now() + 3600000), // 1 hour
          };

          const userId = await upsertOAuthUser(userData);
          const token = createOAuthJWT(userId, 'google');

          done(null, { userId, token, provider: 'google' });
        } catch (error) {
          done(error as Error);
        }
      }
    )
  );
}

// Configure GitHub OAuth strategy
export function configureGitHubOAuth() {
  if (!OAUTH_PROVIDERS.github.clientID || !OAUTH_PROVIDERS.github.clientSecret) {
    console.warn('GitHub OAuth not configured - missing credentials');
    return;
  }

  passport.use(
    new GitHubStrategy(
      {
        clientID: OAUTH_PROVIDERS.github.clientID,
        clientSecret: OAUTH_PROVIDERS.github.clientSecret,
        callbackURL: OAUTH_PROVIDERS.github.callbackURL,
      },
      async (accessToken: string, refreshToken: string, profile: any, done: any) => {
        try {
          const userData: OAuthUserData = {
            provider: 'github',
            providerId: profile.id,
            email: profile.emails?.[0]?.value || `${profile.username}@github.local`,
            name: profile.displayName || profile.username,
            username: profile.username,
            profileImage: profile.photos?.[0]?.value,
            accessToken,
            refreshToken,
          };

          const userId = await upsertOAuthUser(userData);
          const token = createOAuthJWT(userId, 'github');

          done(null, { userId, token, provider: 'github' });
        } catch (error) {
          done(error);
        }
      }
    )
  );
}

// Initialize all OAuth providers
export function initializeOAuth() {
  configureGoogleOAuth();
  configureGitHubOAuth();
  
  // Serialize user for session
  passport.serializeUser((user: any, done) => {
    done(null, { id: user.userId, provider: user.provider });
  });

  // Deserialize user from session
  passport.deserializeUser(async (data: any, done) => {
    try {
      const user = await storage.getUser(data.id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  console.log('✅ OAuth providers initialized');
}

// Validate OAuth token
export async function validateOAuthToken(token: string): Promise<any> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'esa-life-ceo',
      audience: 'mundo-tango',
    });
    
    return decoded;
  } catch (error) {
    throw new Error('Invalid OAuth token');
  }
}

// Refresh OAuth tokens
export async function refreshOAuthTokens(userId: number, provider: string) {
  try {
    const providerRecord = await db
      .select()
      .from(oauthProviders)
      .where(
        and(
          eq(oauthProviders.userId, userId),
          eq(oauthProviders.provider, provider)
        )
      )
      .limit(1);

    if (!providerRecord[0]?.refreshToken) {
      throw new Error('No refresh token available');
    }

    // Provider-specific refresh logic would go here
    // This is a placeholder for the actual implementation
    
    return {
      accessToken: generateSecureToken(),
      expiresAt: new Date(Date.now() + 3600000),
    };
  } catch (error) {
    console.error('Error refreshing OAuth tokens:', error);
    throw error;
  }
}

// Revoke OAuth access
export async function revokeOAuthAccess(userId: number, provider: string) {
  try {
    await db
      .delete(oauthProviders)
      .where(
        and(
          eq(oauthProviders.userId, userId),
          eq(oauthProviders.provider, provider)
        )
      );

    return true;
  } catch (error) {
    console.error('Error revoking OAuth access:', error);
    return false;
  }
}

export default {
  initializeOAuth,
  upsertOAuthUser,
  createOAuthJWT,
  validateOAuthToken,
  refreshOAuthTokens,
  revokeOAuthAccess,
  OAUTH_PROVIDERS,
};