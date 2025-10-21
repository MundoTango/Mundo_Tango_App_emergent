// Initialize Agent #80 Learning System
// MB.MD Phase 2A - Oct 21, 2025
// Seeds database with critical learnings on server start

import { seedCriticalLearnings, seedAgentCertifications } from '../services/learningSeeder';

export async function initializeLearningSystem() {
  console.log("🎓 [Init] Initializing Agent #80 Learning System...");
  
  try {
    await seedCriticalLearnings();
    await seedAgentCertifications();
    console.log("✅ [Init] Learning system initialized successfully");
  } catch (error) {
    console.error("❌ [Init] Learning system initialization failed:", error);
    // Don't crash server if learning system fails
  }
}
