/**
 * TRACK 5: Component Registration Service
 * Automatically registers all UI components as agents in componentAgents table
 * Integrates with existing ComponentAgent base class
 */

import { db } from '../db';
import { componentAgents, type InsertComponentAgent } from '@shared/schema';
import { eq } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

export class ComponentRegistrationService {
  /**
   * Scan and register all components
   */
  async registerAllComponents(): Promise<{
    registered: number;
    updated: number;
    total: number;
    components: string[];
  }> {
    const components = await this.scanComponents();
    
    let registered = 0;
    let updated = 0;
    const componentNames: string[] = [];

    for (const component of components) {
      const existing = await db
        .select()
        .from(componentAgents)
        .where(eq(componentAgents.componentPath, component.componentPath));

      if (existing.length > 0) {
        // Update existing
        await db
          .update(componentAgents)
          .set({
            lastModified: new Date(),
          })
          .where(eq(componentAgents.id, existing[0].id));
        updated++;
      } else {
        // Register new
        await db.insert(componentAgents).values(component);
        registered++;
      }

      componentNames.push(component.componentName);
    }

    return {
      registered,
      updated,
      total: components.length,
      components: componentNames,
    };
  }

  /**
   * Scan all component files
   */
  private async scanComponents(): Promise<InsertComponentAgent[]> {
    const components: InsertComponentAgent[] = [];

    // Scan client components
    const clientComponents = await this.scanDirectory('client/src/components/**/*.tsx');
    components.push(...clientComponents);

    // Scan pages
    const pages = await this.scanDirectory('client/src/pages/**/*.tsx');
    components.push(...pages);

    return components;
  }

  /**
   * Scan a directory for components
   */
  private async scanDirectory(pattern: string): Promise<InsertComponentAgent[]> {
    const components: InsertComponentAgent[] = [];

    try {
      const files = await glob(pattern, { cwd: process.cwd() });

      for (const file of files) {
        const component = this.analyzeComponent(file);
        if (component) {
          components.push(component);
        }
      }
    } catch (error) {
      console.error('Error scanning directory:', error);
    }

    return components;
  }

  /**
   * Analyze a component file
   */
  private analyzeComponent(filePath: string): InsertComponentAgent | null {
    const fileName = path.basename(filePath, '.tsx');
    
    // Skip index files and test files
    if (fileName === 'index' || fileName.includes('.test') || fileName.includes('.spec')) {
      return null;
    }

    // Determine component type
    const componentType = this.determineComponentType(filePath);

    // Determine parent agent based on path
    const parentAgent = this.determineParentAgent(filePath);

    // Determine layer agents based on functionality
    const layerAgents = this.determineLayerAgents(filePath);

    return {
      componentName: fileName,
      componentPath: filePath,
      componentType,
      parentAgent,
      layerAgents,
      currentHealth: 'healthy',
      testCoverage: 0,
      learningCount: 0,
    };
  }

  /**
   * Determine component type from path
   */
  private determineComponentType(filePath: string): 'button' | 'input' | 'layout' | 'page' {
    if (filePath.includes('/pages/')) {
      return 'page';
    }
    
    const fileName = path.basename(filePath, '.tsx').toLowerCase();
    
    if (fileName.includes('button')) {
      return 'button';
    }
    
    if (fileName.includes('input') || fileName.includes('field') || fileName.includes('form')) {
      return 'input';
    }
    
    if (fileName.includes('layout') || fileName.includes('container') || fileName.includes('wrapper')) {
      return 'layout';
    }

    return 'layout'; // Default
  }

  /**
   * Determine parent agent based on directory
   */
  private determineParentAgent(filePath: string): string {
    if (filePath.includes('/admin/')) {
      return 'AGENT-11'; // UI Sub-Agents parent
    }
    
    if (filePath.includes('/life-ceo/')) {
      return 'AGENT-LIFE-CEO';
    }
    
    if (filePath.includes('/mrBlue/') || filePath.includes('/mr-blue/')) {
      return 'AGENT-73'; // Mr Blue
    }
    
    if (filePath.includes('/auth/')) {
      return 'LAYER-2'; // Authentication layer
    }

    return 'CHIEF-FOUNDATION'; // Default to Foundation Division Chief
  }

  /**
   * Determine ESA layer agents based on functionality
   */
  private determineLayerAgents(filePath: string): string[] {
    const layers: string[] = [];

    // Layer 9: UI/UX Design
    if (filePath.includes('/components/ui/') || filePath.includes('/pages/')) {
      layers.push('LAYER-9');
    }

    // Layer 10: Design System
    if (filePath.includes('/components/ui/')) {
      layers.push('LAYER-10');
    }

    // Layer 53: Internationalization
    if (filePath.includes('i18n') || filePath.includes('translation')) {
      layers.push('LAYER-53');
    }

    // Layer 54: Accessibility
    layers.push('LAYER-54'); // All components should be accessible

    return layers;
  }

  /**
   * Register a single component manually
   */
  async registerComponent(component: InsertComponentAgent): Promise<number> {
    const existing = await db
      .select()
      .from(componentAgents)
      .where(eq(componentAgents.componentPath, component.componentPath));

    if (existing.length > 0) {
      await db
        .update(componentAgents)
        .set(component)
        .where(eq(componentAgents.id, existing[0].id));
      return existing[0].id;
    }

    const [created] = await db.insert(componentAgents).values(component).returning();
    return created.id;
  }

  /**
   * Get all registered components
   */
  async getAllComponents() {
    return await db.select().from(componentAgents);
  }

  /**
   * Get components by health status
   */
  async getComponentsByHealth(health: 'healthy' | 'warning' | 'error') {
    return await db
      .select()
      .from(componentAgents)
      .where(eq(componentAgents.currentHealth, health));
  }
}

export const componentRegistrationService = new ComponentRegistrationService();
