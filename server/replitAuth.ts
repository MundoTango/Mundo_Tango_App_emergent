import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

if (!process.env.REPLIT_DOMAINS) {
  console.warn("[ESA 61x21] REPLIT_DOMAINS not provided, using demo mode");
  process.env.REPLIT_DOMAINS = "https://localhost:3000,https://localhost:5000";
}

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.JWT_SECRET || process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true, // Always use secure in Replit (HTTPS)
      sameSite: 'lax', // Prevent CSRF while allowing OAuth flow
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(
  claims: any,
) {
  await storage.upsertUser({
    replitId: claims["sub"],
    name: `${claims["first_name"] || ''} ${claims["last_name"] || ''}`.trim() || 'User',
    username: claims["email"]?.split('@')[0] || `user_${Date.now()}`,
    email: claims["email"] || '',
    password: '', // No password needed for Replit Auth
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImage: claims["profile_image_url"],
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();
  console.log('OIDC Config loaded successfully');

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };

  for (const domain of process.env
    .REPLIT_DOMAINS!.split(",")) {
    const strategyName = `replitauth:${domain}`;
    console.log(`Registering strategy: ${strategyName} for domain: ${domain}`);
    const strategy = new Strategy(
      {
        name: strategyName,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`,
      },
      verify,
    );
    passport.use(strategy);
    console.log(`Strategy ${strategyName} registered successfully`);
  }

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    // Clear logout flag for development mode
    if (process.env.NODE_ENV === 'development' && global.devLoggedOut) {
      global.devLoggedOut = false;
      console.log('🔐 Development login - clearing logout flag');
      return res.redirect('/moments');
    }
    
    const domains = process.env.REPLIT_DOMAINS!.split(",");
    const strategyName = `replitauth:${domains[0]}`;
    passport.authenticate(strategyName, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    const domains = process.env.REPLIT_DOMAINS!.split(",");
    const strategyName = `replitauth:${domains[0]}`;
    passport.authenticate(strategyName, {
      successReturnToOrRedirect: "/moments",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  // Enhanced logout for development mode
  app.get("/api/logout", (req, res) => {
    // Set logout flag for development mode
    if (process.env.NODE_ENV === 'development') {
      // Use global variable as fallback when sessions don't work
      global.devLoggedOut = true;
      console.log('🔓 Development logout - setting logout flag');
      
      // Clear session and redirect to a logout landing page
      req.logout(() => {
        res.redirect('/?logout=true');
      });
      return;
    }
    
    // Production Replit OAuth logout
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  // Auth bypass for development and Life CEO testing
  if (process.env.NODE_ENV === 'development' || process.env.AUTH_BYPASS === 'true') {
    // Check if user has explicitly logged out
    if (global.devLoggedOut) {
      console.log('🔓 Development mode: User is logged out');
      return res.status(401).json({ message: "Logged out in development mode" });
    }
    
    console.log('🔧 Auth bypass - using default user for Life CEO testing');
    
    // Set default user for development - CRITICAL FIX: Use Scott's actual Replit ID
    req.user = {
      claims: {
        sub: "44164221" // Scott Boddye's actual Replit ID
      },
      expires_at: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
    } as any;
    
    return next();
  }

  const user = req.user as any;

  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};