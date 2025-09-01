#!/usr/bin/env node

const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
const PORT = 5000;

// MongoDB connection
let db;

async function connectDB() {
  try {
    const client = new MongoClient('mongodb://localhost:27017');
    await client.connect();
    db = client.db('lifecycle_mongo');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
  }
}

// Middleware
app.use(cors());
app.use(express.json());

// Mock authentication middleware
app.use((req, res, next) => {
  req.user = { id: 1, name: 'Demo User' }; // Mock user for testing
  next();
});

// Groups API endpoint
app.get('/api/groups', async (req, res) => {
  try {
    console.log('🔄 GET /api/groups called');
    
    if (!db) {
      await connectDB();
    }
    
    const groups = await db.collection('groups').find({}).toArray();
    
    // Add membership status (mocked for demo)
    const groupsWithMembership = groups.map(group => ({
      ...group,
      membershipStatus: group.id === 1 ? 'member' : null, // Mock: user is member of Buenos Aires
      isMember: group.id === 1,
      image_url: group.imageUrl,
      member_count: group.memberCount
    }));
    
    console.log(`📊 Returning ${groupsWithMembership.length} groups`);
    res.json(groupsWithMembership);
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

// Join group endpoint
app.post('/api/user/join-group/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    console.log(`🤝 User joining group: ${slug}`);
    
    if (!db) {
      await connectDB();
    }
    
    const group = await db.collection('groups').findOne({ slug });
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    // Update member count (simplified)
    await db.collection('groups').updateOne(
      { slug },
      { $inc: { memberCount: 1 } }
    );
    
    res.json({ success: true, message: 'Joined group successfully' });
  } catch (error) {
    console.error('Error joining group:', error);
    res.status(500).json({ error: 'Failed to join group' });
  }
});

// Leave group endpoint
app.post('/api/user/leave-group/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    console.log(`👋 User leaving group: ${slug}`);
    
    if (!db) {
      await connectDB();
    }
    
    const group = await db.collection('groups').findOne({ slug });
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    // Update member count (simplified)
    await db.collection('groups').updateOne(
      { slug },
      { $inc: { memberCount: -1 } }
    );
    
    res.json({ success: true, message: 'Left group successfully' });
  } catch (error) {
    console.error('Error leaving group:', error);
    res.status(500).json({ error: 'Failed to leave group' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Mundo Tango Backend' });
});

// Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  });
});