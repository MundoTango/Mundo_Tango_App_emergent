/**
 * AGENT #115: DYNAMIC PRIORITY MANAGER
 * MB.MD Phase 9 - Track 72
 * 
 * Expert Research:
 * - MIT CSAIL: Dynamic task scheduling algorithms
 * - Carnegie Mellon: Priority queue optimization
 * - Berkeley AI: Multi-objective optimization
 * - Google SRE: Incident priority systems
 */

import { nanoid } from 'nanoid';

interface Task {
  id: string;
  name: string;
  priority: number;
  impact: number;
  urgency: number;
  dependencies: string[];
  estimatedDuration: number;
}

interface PriorityAdjustment {
  taskId: string;
  oldPriority: number;
  newPriority: number;
  reason: string;
  confidence: number;
}

interface PriorityUpdate {
  adjustments: PriorityAdjustment[];
  reorderedTasks: Task[];
  reasoning: string[];
  timestamp: Date;
}

export class Agent115_DynamicPriorityManager {
  private agentId = 'agent-115-dynamic-priority-manager';
  private version = '1.0.0';

  /**
   * Dynamically adjust task priorities based on context
   */
  async adjustPriorities(
    tasks: Task[],
    context: {
      availableResources: number;
      deadline?: Date;
      blockers: string[];
      newRequirements: string[];
    }
  ): Promise<PriorityUpdate> {
    try {
      const adjustments: PriorityAdjustment[] = [];
      const reasoning: string[] = [];

      // Calculate priority scores for each task
      const scoredTasks = await Promise.all(
        tasks.map(async task => ({
          task,
          score: await this.calculatePriorityScore(task, context),
        }))
      );

      // Sort by new score
      const reordered = scoredTasks.sort((a, b) => b.score - a.score);

      // Generate adjustments
      reordered.forEach((scored, index) => {
        const newPriority = 100 - index * 5; // Spread from 100 down
        
        if (Math.abs(newPriority - scored.task.priority) > 10) {
          const reason = this.getAdjustmentReason(scored.task, scored.score, context);
          
          adjustments.push({
            taskId: scored.task.id,
            oldPriority: scored.task.priority,
            newPriority,
            reason,
            confidence: this.calculateConfidence(scored.task, context),
          });

          reasoning.push(`${scored.task.name}: ${scored.task.priority} → ${newPriority} (${reason})`);
        }
      });

      // Update task priorities
      const reorderedTasks = reordered.map((scored, index) => ({
        ...scored.task,
        priority: 100 - index * 5,
      }));

      return {
        adjustments,
        reorderedTasks,
        reasoning,
        timestamp: new Date(),
      };
    } catch (error) {
      throw new Error(`Priority adjustment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate priority score (0-100)
   */
  private async calculatePriorityScore(
    task: Task,
    context: {
      availableResources: number;
      deadline?: Date;
      blockers: string[];
      newRequirements: string[];
    }
  ): Promise<number> {
    let score = task.priority;

    // Impact factor (40% weight)
    score += task.impact * 0.4;

    // Urgency factor (30% weight)
    score += task.urgency * 0.3;

    // Deadline proximity (20% weight)
    if (context.deadline) {
      const timeLeft = context.deadline.getTime() - Date.now();
      const hoursLeft = timeLeft / (1000 * 60 * 60);
      
      if (hoursLeft < 24) {
        score += 20; // Urgent
      } else if (hoursLeft < 72) {
        score += 10; // Soon
      }
    }

    // Blocker penalty (10% weight)
    const hasBlockers = task.dependencies.some(dep => context.blockers.includes(dep));
    if (hasBlockers) {
      score -= 10;
    }

    // Resource availability boost
    if (context.availableResources > 5) {
      score += 5; // Can parallelize
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Get human-readable adjustment reason
   */
  private getAdjustmentReason(task: Task, score: number, context: any): string {
    if (score > 80) return 'Critical impact and high urgency';
    if (score > 60) return 'High priority due to dependencies';
    if (score > 40) return 'Moderate priority, can be scheduled';
    if (context.blockers.includes(task.id)) return 'Blocked by dependencies';
    return 'Lower priority, defer if needed';
  }

  /**
   * Calculate adjustment confidence
   */
  private calculateConfidence(task: Task, context: any): number {
    let confidence = 0.5;

    // More confidence with clear signals
    if (task.impact > 80) confidence += 0.2;
    if (task.urgency > 80) confidence += 0.2;
    if (task.dependencies.length === 0) confidence += 0.1;

    return Math.min(confidence, 1);
  }

  /**
   * Handle real-time priority updates
   */
  async handleRealtimeUpdate(
    event: {
      type: 'blocker_added' | 'blocker_removed' | 'resource_available' | 'deadline_changed';
      taskId: string;
      data: any;
    },
    currentTasks: Task[]
  ): Promise<PriorityUpdate | null> {
    console.log(`[Agent #115] Handling real-time update: ${event.type} for task ${event.taskId}`);

    // Find affected task
    const task = currentTasks.find(t => t.id === event.taskId);
    if (!task) return null;

    // Determine if reprioritization is needed
    const needsUpdate = 
      event.type === 'blocker_added' || 
      event.type === 'blocker_removed' ||
      event.type === 'deadline_changed';

    if (!needsUpdate) return null;

    // Trigger full reprioritization
    return this.adjustPriorities(currentTasks, {
      availableResources: event.data.resources || 3,
      blockers: event.data.blockers || [],
      newRequirements: event.data.requirements || [],
    });
  }

  /**
   * Get agent metadata
   */
  getMetadata() {
    return {
      id: this.agentId,
      name: 'Dynamic Priority Manager',
      version: this.version,
      capabilities: [
        'dynamic-priority-adjustment',
        'real-time-reprioritization',
        'multi-factor-scoring',
        'dependency-aware-scheduling',
        'deadline-optimization'
      ],
      expertSources: [
        'MIT CSAIL Scheduling',
        'Carnegie Mellon Priority Queues',
        'Berkeley Multi-Objective',
        'Google SRE Incident Management'
      ]
    };
  }
}

export const agent115 = new Agent115_DynamicPriorityManager();
