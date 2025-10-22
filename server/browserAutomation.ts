/**
 * BROWSER AUTOMATION SERVICE
 * Integrates with Anthropic Computer Use API for AI-powered testing
 * 
 * Architecture:
 * 1. Take screenshot of current page
 * 2. Send to Anthropic Computer Use API (Claude with computer-20241022 tool)
 * 3. Receive actions (click, type, scroll, etc.)
 * 4. Execute actions via Playwright
 * 5. Take new screenshot, repeat
 * 
 * MB.MD: Used by Mr Blue "Test" feature for automated user journey testing
 */

import { chromium, Browser, Page } from 'playwright';
import Anthropic from '@anthropic-ai/sdk';

interface ComputerAction {
  action: 'key' | 'type' | 'mouse_move' | 'left_click' | 'right_click' | 'screenshot' | 'scroll';
  text?: string;
  coordinate?: [number, number];
  direction?: 'up' | 'down' | 'left' | 'right';
}

interface TestResult {
  success: boolean;
  screenshots: string[]; // Base64 encoded
  actions: ComputerAction[];
  logs: string[];
  error?: string;
}

export class BrowserAutomation {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private anthropic: Anthropic;
  
  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
  }
  
  /**
   * Initialize browser and page
   */
  async init(): Promise<void> {
    this.browser = await chromium.launch({ headless: true });
    this.page = await this.browser.newPage({
      viewport: { width: 1280, height: 720 }
    });
  }
  
  /**
   * Take screenshot of current page
   */
  async takeScreenshot(): Promise<string> {
    if (!this.page) throw new Error('Browser not initialized');
    const screenshot = await this.page.screenshot();
    return screenshot.toString('base64');
  }
  
  /**
   * Navigate to URL
   */
  async navigate(url: string): Promise<void> {
    if (!this.page) throw new Error('Browser not initialized');
    await this.page.goto(url);
  }
  
  /**
   * Execute a computer action
   */
  async executeAction(action: ComputerAction): Promise<void> {
    if (!this.page) throw new Error('Browser not initialized');
    
    switch (action.action) {
      case 'left_click':
        if (action.coordinate) {
          await this.page.mouse.click(action.coordinate[0], action.coordinate[1]);
        }
        break;
        
      case 'type':
        if (action.text) {
          await this.page.keyboard.type(action.text);
        }
        break;
        
      case 'key':
        if (action.text) {
          await this.page.keyboard.press(action.text);
        }
        break;
        
      case 'scroll':
        if (action.direction) {
          const scrollAmount = action.direction === 'up' || action.direction === 'left' ? -100 : 100;
          const scrollAxis = action.direction === 'up' || action.direction === 'down' ? 'vertical' : 'horizontal';
          
          await this.page.mouse.wheel(
            scrollAxis === 'horizontal' ? scrollAmount : 0,
            scrollAxis === 'vertical' ? scrollAmount : 0
          );
        }
        break;
        
      case 'mouse_move':
        if (action.coordinate) {
          await this.page.mouse.move(action.coordinate[0], action.coordinate[1]);
        }
        break;
    }
  }
  
  /**
   * Run AI-powered test using Anthropic Computer Use API
   * @param task - Natural language task description (e.g., "Test the login flow")
   * @param startUrl - URL to start testing from
   */
  async runAITest(task: string, startUrl: string): Promise<TestResult> {
    const screenshots: string[] = [];
    const actions: ComputerAction[] = [];
    const logs: string[] = [];
    
    try {
      await this.init();
      await this.navigate(startUrl);
      
      logs.push(`Started AI test: ${task}`);
      logs.push(`Initial URL: ${startUrl}`);
      
      // Take initial screenshot
      const initialScreenshot = await this.takeScreenshot();
      screenshots.push(initialScreenshot);
      
      // Send to Anthropic Computer Use API
      // NOTE: Computer Use API is beta - SDK types not updated yet
      const message = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        tools: [
          {
            type: 'custom',
            name: 'computer',
            // @ts-ignore - Computer Use beta properties not in SDK types yet
            display_width_px: 1280,
            display_height_px: 720,
            display_number: 1
          } as any
        ],
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: task
              },
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/png',
                  data: initialScreenshot
                }
              }
            ]
          }
        ],
        // @ts-ignore - Beta header
        betas: ['computer-use-2024-10-22']
      });
      
      logs.push(`Anthropic API response received`);
      logs.push(`Stop reason: ${message.stop_reason}`);
      
      // Process tool use responses
      if (message.stop_reason === 'tool_use') {
        for (const block of message.content) {
          if (block.type === 'tool_use' && block.name === 'computer') {
            const toolInput = block.input as any;
            const action: ComputerAction = {
              action: toolInput.action,
              text: toolInput.text,
              coordinate: toolInput.coordinate,
              direction: toolInput.direction
            };
            
            actions.push(action);
            logs.push(`Executing action: ${JSON.stringify(action)}`);
            
            await this.executeAction(action);
            
            // Take screenshot after action
            const screenshot = await this.takeScreenshot();
            screenshots.push(screenshot);
          }
        }
      }
      
      logs.push(`Test completed successfully`);
      
      return {
        success: true,
        screenshots,
        actions,
        logs
      };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logs.push(`Error: ${errorMessage}`);
      return {
        success: false,
        screenshots,
        actions,
        logs,
        error: errorMessage
      };
    } finally {
      await this.cleanup();
    }
  }
  
  /**
   * Cleanup browser resources
   */
  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }
}

// Export singleton instance
export const browserAutomation = new BrowserAutomation();
