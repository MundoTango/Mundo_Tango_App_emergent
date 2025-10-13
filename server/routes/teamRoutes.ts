/**
 * TRACK 1: Team Onboarding API Routes
 * Human registration with role-based agent matching
 */

import { Router } from 'express';
import { db } from '../db';
import { users } from '../../shared/schema';
import { requireAuth } from '../middleware/secureAuth';
import bcrypt from 'bcrypt';

const router = Router();

// Agent matching logic
const agentMatching = {
  frontend: ['MB6', 'ESA2', 'ESA48', 'ESA11'],
  backend: ['ESA1', 'ESA3', 'ESA5', 'ESA18'],
  designer: ['MB6', 'ESA11', 'ESA48', 'ESA54'],
  admin: ['ESA9', 'ESA60', 'ESA64', 'ESA65']
};

/**
 * POST /api/team/onboard
 * Register new team member with role-based setup
 */
router.post('/onboard', requireAuth, async (req, res) => {
  try {
    const { name, email, role, skills } = req.body;

    // Validate required fields
    if (!name || !email || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if email already exists
    const existing = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email)
    });

    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Generate temporary password (user should change on first login)
    const tempPassword = Math.random().toString(36).slice(-10);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Create user
    const [newUser] = await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
      role: role === 'admin' ? 'admin' : 'user',
      username: email.split('@')[0],
      skills: skills || []
    }).returning();

    // Get matched agents
    const matchedAgents = agentMatching[role as keyof typeof agentMatching] || [];

    // TODO: Create initial story cards assigned to this user
    // This will be handled by The Plan (ESA65) automation

    res.json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role
      },
      matchedAgents,
      tempPassword, // Send via secure channel in production
      message: 'Team member onboarded successfully'
    });
  } catch (error) {
    console.error('Team onboarding error:', error);
    res.status(500).json({ error: 'Failed to onboard team member' });
  }
});

/**
 * GET /api/team/members
 * List all team members
 */
router.get('/members', requireAuth, async (req, res) => {
  try {
    const members = await db.query.users.findMany({
      columns: {
        id: true,
        name: true,
        email: true,
        role: true,
        skills: true,
        createdAt: true
      }
    });

    res.json(members);
  } catch (error) {
    console.error('Get team members error:', error);
    res.status(500).json({ error: 'Failed to fetch team members' });
  }
});

export default router;
