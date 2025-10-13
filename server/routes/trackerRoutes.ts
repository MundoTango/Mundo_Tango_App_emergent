/**
 * Project Tracker Routes (Epics, Stories, Tasks, Sprints)
 * MB.MD TRACK 3: Project Management Endpoints
 */

import { Router } from 'express';
import { isAuthenticated } from '../replitAuth';

const router = Router();

// Create epic
router.post('/tracker/epics', isAuthenticated, async (req, res) => {
  try {
    const epic = { id: Date.now(), ...req.body, type: 'epic' };
    res.json({ success: true, data: epic });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create epic' });
  }
});

// Create story
router.post('/tracker/stories', isAuthenticated, async (req, res) => {
  try {
    const story = { id: Date.now(), ...req.body, type: 'story' };
    res.json({ success: true, data: story });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create story' });
  }
});

// Create task
router.post('/tracker/tasks', isAuthenticated, async (req, res) => {
  try {
    const task = { id: Date.now(), ...req.body, type: 'task' };
    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create task' });
  }
});

// Create sprint
router.post('/tracker/sprints', isAuthenticated, async (req, res) => {
  try {
    const sprint = { id: Date.now(), ...req.body, type: 'sprint' };
    res.json({ success: true, data: sprint });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create sprint' });
  }
});

// Approve open source consolidation
router.post('/tracker/open-sources/approve-consolidation', isAuthenticated, async (req, res) => {
  try {
    res.json({ success: true, message: 'Consolidation approved' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Approval failed' });
  }
});

export default router;
