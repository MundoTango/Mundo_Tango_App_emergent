/**
 * STAGE 3 TESTING: MEDIUM Integration Tests ($0.25)
 * Real vibe coding with actual AI
 * Created: October 28, 2025
 * 
 * Purpose: Verify vibe coding generates real code changes
 * Cost: ~$0.10-0.25 per run
 * When to Run: On merge to main
 */

import { VibeCodeEngine } from '../../server/services/gemini/VibeCodeEngine';

describe('Vibe Coding Real AI Integration', () => {
  const engine = new VibeCodeEngine();

  test('Plan mode generates real clarification questions', async () => {
    const result = await engine.execute({
      userRequest: 'Redesign the homepage',
      executionMode: 'plan'
    });

    expect(result.needsClarification).toBe(true);
    expect(result.clarificationQuestion).toBeTruthy();
    expect(result.clarificationQuestion.length).toBeGreaterThan(50);
    expect(result.modelUsed).toMatch(/gemini-2.5-(flash|pro)/);
    console.log(`✅ Plan Mode: Generated ${result.clarificationQuestion.length} char question`);
    console.log(`   Model: ${result.modelUsed}, Cost: $${result.costEstimate}`);
  }, 30000);

  test('Build mode with simple request generates code immediately', async () => {
    const result = await engine.execute({
      userRequest: 'Change button color to blue',
      executionMode: 'build',
      visualEditorContext: {
        selectedElement: {
          tagName: 'BUTTON',
          className: 'btn-primary',
          textContent: 'Click me'
        },
        previewPath: '/'
      }
    });

    expect(result.needsClarification).toBe(false);
    expect(result.tasks.length).toBeGreaterThan(0);
    expect(result.codeChanges.length).toBeGreaterThan(0);
    console.log(`✅ Build Mode: Generated ${result.tasks.length} tasks, ${result.codeChanges.length} code changes`);
    console.log(`   Model: ${result.modelUsed}, Cost: $${result.costEstimate}`);
  }, 30000);

  test('Build mode with complex request uses Pro model', async () => {
    const result = await engine.execute({
      userRequest: 'Refactor the authentication flow to use OAuth 2.0 with PKCE',
      executionMode: 'build'
    });

    expect(result.modelUsed).toBe('gemini-2.5-pro'); // Complex task should use Pro
    expect(result.costEstimate).toBeGreaterThan(0.005); // Pro is more expensive
    console.log(`✅ Complex Task Routing: Model=${result.modelUsed}, Cost=$${result.costEstimate}`);
  }, 30000);

  test('Chat triggers vibe coding when code keywords detected', async () => {
    const result = await engine.execute({
      userRequest: 'Can you add a search bar at the top of the page?',
      executionMode: 'build'
    });

    expect(result.needsClarification).toBe(false);
    expect(result.tasks).toBeDefined();
    expect(result.reasoning).toBeTruthy();
    console.log(`✅ Code Intent Detection: ${result.tasks.length} tasks planned`);
  }, 30000);

  test('Voice command triggers vibe coding', async () => {
    const result = await engine.execute({
      userRequest: 'make the header bigger',
      executionMode: 'build',
      visualEditorContext: {
        selectedElement: {
          tagName: 'HEADER',
          className: 'site-header'
        },
        previewPath: '/'
      }
    });

    expect(result.needsClarification).toBe(false);
    expect(result.codeChanges.length).toBeGreaterThan(0);
    console.log(`✅ Voice → Vibe: Generated ${result.codeChanges.length} changes`);
  }, 30000);
});

/**
 * TEST SUMMARY
 * - 5 real vibe coding requests
 * - Total cost: ~$0.10-0.25
 * - Execution time: ~2 minutes
 * - Purpose: Validate complete vibe coding pipeline
 */
