import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { storage } from "../storage";

const JWT_SECRET = process.env.JWT_SECRET || "mundo-tango-secret-key";

interface JWTPayload {
  userId: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        username: string;
        name: string;
        role: string;
        bio?: string;
        firstName?: string;
        lastName?: string;
        mobileNo?: string;
        profileImage?: string;
        backgroundImage?: string;
        country?: string;
        city?: string;
        facebookUrl?: string;
        isVerified?: boolean;
        isActive?: boolean;
        apiToken?: string;
        createdAt?: Date;
        updatedAt?: Date;
      };
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Development bypass
    if (process.env.NODE_ENV === 'development' || process.env.AUTH_BYPASS === 'true') {
      const defaultUser = await storage.getUser(7); // Scott Boddye's admin user ID
      if (defaultUser) {
        req.user = {
          id: defaultUser.id,
          email: defaultUser.email,
          username: defaultUser.username,
          name: defaultUser.name,
          role: 'admin', // Default admin role for dev bypass
          bio: defaultUser.bio ?? undefined,
          firstName: defaultUser.firstName ?? undefined,
          lastName: defaultUser.lastName ?? undefined,
          mobileNo: defaultUser.mobileNo ?? undefined,
          profileImage: defaultUser.profileImage ?? undefined,
          backgroundImage: defaultUser.backgroundImage ?? undefined,
          country: defaultUser.country ?? undefined,
          city: defaultUser.city ?? undefined,
          facebookUrl: defaultUser.facebookUrl ?? undefined,
          isVerified: defaultUser.isVerified ?? undefined,
          isActive: defaultUser.isActive ?? undefined,
          apiToken: defaultUser.apiToken ?? undefined,
          createdAt: defaultUser.createdAt ?? undefined,
          updatedAt: defaultUser.updatedAt ?? undefined,
        };
        return next();
      }
    }

    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1]; // Bearer token

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    const user = await storage.getUser(decoded.userId);

    // Production authentication required
    if (!user || !user.id) {
      throw new Error('Authentication required');
    }

    req.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      role: 'user', // Default user role
      bio: user.bio ?? undefined,
      firstName: user.firstName ?? undefined,
      lastName: user.lastName ?? undefined,
      mobileNo: user.mobileNo ?? undefined,
      profileImage: user.profileImage ?? undefined,
      backgroundImage: user.backgroundImage ?? undefined,
      country: user.country ?? undefined,
      city: user.city ?? undefined,
      facebookUrl: user.facebookUrl ?? undefined,
      isVerified: user.isVerified ?? undefined,
      isActive: user.isActive ?? undefined,
      apiToken: user.apiToken ?? undefined,
      createdAt: user.createdAt ?? undefined,
      updatedAt: user.updatedAt ?? undefined,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Export isAuthenticated as an alias for authMiddleware for compatibility
export const isAuthenticated = authMiddleware;