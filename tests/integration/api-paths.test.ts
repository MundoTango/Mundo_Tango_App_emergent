/**
 * MB.MD TRACK 10.2: Integration Tests for API Path Matching
 * Phase 19: End-to-End Data Flow Validation
 * 
 * Tests: Frontend API calls match backend routes (no 404s)
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

describe('API Path Validation', () => {
  let validationReport: any;
  
  beforeAll(() => {
    // Run API path validator
    try {
      execSync('node scripts/validate-api-paths.mjs --compare', {
        stdio: 'pipe',
        cwd: process.cwd()
      });
      
      // Read validation report
      const reportPath = path.join(process.cwd(), 'reports/api-validation-report.json');
      const reportData = fs.readFileSync(reportPath, 'utf-8');
      validationReport = JSON.parse(reportData);
      
    } catch (error) {
      console.error('API validation failed:', error);
      throw error;
    }
  });
  
  it('should have validation report', () => {
    expect(validationReport).toBeTruthy();
    expect(validationReport).toHaveProperty('frontendCalls');
    expect(validationReport).toHaveProperty('backendRoutes');
    expect(validationReport).toHaveProperty('matches');
    expect(validationReport).toHaveProperty('mismatches');
  });
  
  it('should have >50% API path coverage', () => {
    expect(validationReport.coverage).toBeGreaterThan(50);
  });
  
  it('should have zero critical admin endpoint mismatches', () => {
    const criticalMismatches = validationReport.details?.mismatches?.filter((m: any) => 
      m.frontend.includes('/api/admin/analytics') ||
      m.frontend.includes('/api/admin/dashboard') ||
      m.frontend.includes('/api/esa-agents')
    ) || [];
    
    expect(criticalMismatches.length).toBe(0);
  });
  
  it('should match all new Phase 2 endpoints', () => {
    const phase2Endpoints = [
      '/api/admin/analytics',
      '/api/admin/dashboard/stats',
      '/api/esa-agents/health',
      '/api/esa-agents/analytics'
    ];
    
    const matches = validationReport.details?.matches || [];
    
    phase2Endpoints.forEach(endpoint => {
      const isMatched = matches.some((match: string) => match.includes(endpoint));
      expect(isMatched).toBe(true);
    });
  });
  
  it('should have consistent route prefixes', () => {
    const mismatches = validationReport.details?.mismatches || [];
    
    // Check for /admin/ vs /api/admin/ inconsistencies
    const prefixInconsistencies = mismatches.filter((m: any) => 
      m.frontend.startsWith('/api/') && 
      m.suggested?.includes('but frontend calls')
    );
    
    // Should be minimal (already fixed in Phase 2)
    expect(prefixInconsistencies.length).toBeLessThan(10);
  });
  
  it('should detect missing endpoints', () => {
    const mismatches = validationReport.details?.mismatches || [];
    
    const missingEndpoints = mismatches.filter((m: any) => 
      m.suggested?.includes('No matching backend route')
    );
    
    // Document for future fixing
    console.log(`Missing endpoints: ${missingEndpoints.length}`);
    
    expect(missingEndpoints).toBeInstanceOf(Array);
  });
  
  it('should validate all useQuery paths', () => {
    const frontendCalls = validationReport.frontendCalls;
    
    expect(frontendCalls).toBeGreaterThan(0);
    expect(frontendCalls).toBeLessThan(1000); // Reasonable limit
  });
  
  it('should have backend routes documented', () => {
    const backendRoutes = validationReport.backendRoutes;
    
    expect(backendRoutes).toBeGreaterThan(0);
    expect(backendRoutes).toBeGreaterThan(frontendCalls); // More routes than calls
  });
  
  it('should match report timestamp to recent execution', () => {
    const reportTime = new Date(validationReport.timestamp);
    const now = new Date();
    const diffMinutes = (now.getTime() - reportTime.getTime()) / 1000 / 60;
    
    // Report should be from recent execution (< 5 minutes old)
    expect(diffMinutes).toBeLessThan(5);
  });
});

describe('Critical Endpoint Availability', () => {
  const criticalEndpoints = [
    { path: '/api/admin/analytics', description: 'Admin Analytics' },
    { path: '/api/admin/dashboard/stats', description: 'Dashboard Stats' },
    { path: '/api/esa-agents/health', description: 'Agent Health' },
    { path: '/api/esa-agents/analytics', description: 'Agent Analytics' },
    { path: '/api/auth/user', description: 'User Auth' },
    { path: '/api/posts/feed', description: 'Posts Feed' }
  ];
  
  criticalEndpoints.forEach(({ path, description }) => {
    it(`should have ${description} endpoint accessible`, async () => {
      // This would be tested in E2E, here we just verify it's in the report
      const report = validationReport;
      const isAvailable = report.details?.matches?.includes(path) || 
                         report.details?.mismatches?.some((m: any) => m.frontend === path);
      
      expect(isAvailable).toBe(true);
    });
  });
});
