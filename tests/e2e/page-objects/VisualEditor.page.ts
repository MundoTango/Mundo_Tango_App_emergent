/**
 * PAGE OBJECT: Visual Editor
 * MB.MD Comprehensive Testing - October 28, 2025
 * 
 * Tests: Element selection, inspector panel, styles editing, preview, console
 */

import { Page, Locator, expect } from '@playwright/test';

export class VisualEditorPage {
  readonly page: Page;
  
  // Main container
  readonly editorContainer: Locator;
  readonly iframe: import('@playwright/test').FrameLocator;
  readonly iframeOverlay: Locator;
  
  // Tab system
  readonly tabsContainer: Locator;
  readonly inspectorTab: Locator;
  readonly aiTab: Locator;
  readonly previewTab: Locator;
  readonly consoleTab: Locator;
  readonly deployTab: Locator;
  readonly gitTab: Locator;
  readonly pagesTab: Locator;
  readonly shellTab: Locator;
  readonly filesTab: Locator;
  readonly secretsTab: Locator;
  
  // Inspector Panel
  readonly inspectorPanel: Locator;
  readonly selectedElementInfo: Locator;
  readonly elementTag: Locator;
  readonly elementClasses: Locator;
  readonly elementId: Locator;
  readonly elementTextContent: Locator;
  
  // Styles Panel
  readonly stylesPanel: Locator;
  readonly cssPropertiesList: Locator;
  readonly styleInput: Locator;
  
  // Preview Panel
  readonly previewPanel: Locator;
  readonly previewIframe: import('@playwright/test').FrameLocator;
  
  // Console Panel
  readonly consolePanel: Locator;
  readonly consoleLogsList: Locator;
  readonly consoleErrorCount: Locator;
  
  // Element selection
  readonly selectedElementBorder: Locator;
  
  constructor(page: Page) {
    this.page = page;
    
    // Main container
    this.editorContainer = page.locator('[data-testid="visual-editor-wrapper"]');
    this.iframe = page.frameLocator('[data-testid="preview-iframe"]');
    this.iframeOverlay = page.locator('[data-testid="iframe-overlay"]');
    
    // Tabs
    this.tabsContainer = page.locator('[data-testid="editor-tabs"]');
    this.inspectorTab = page.getByRole('tab', { name: /Inspector/i });
    this.aiTab = page.getByRole('tab', { name: /AI/i });
    this.previewTab = page.getByRole('tab', { name: /Preview/i });
    this.consoleTab = page.getByRole('tab', { name: /Console/i });
    this.deployTab = page.getByRole('tab', { name: /Deploy/i });
    this.gitTab = page.getByRole('tab', { name: /Git/i });
    this.pagesTab = page.getByRole('tab', { name: /Pages/i });
    this.shellTab = page.getByRole('tab', { name: /Shell/i });
    this.filesTab = page.getByRole('tab', { name: /Files/i });
    this.secretsTab = page.getByRole('tab', { name: /Secrets/i });
    
    // Inspector
    this.inspectorPanel = page.locator('[data-testid="inspector-panel"]');
    this.selectedElementInfo = page.locator('[data-testid="selected-element-info"]');
    this.elementTag = page.locator('[data-testid="element-tag"]');
    this.elementClasses = page.locator('[data-testid="element-classes"]');
    this.elementId = page.locator('[data-testid="element-id"]');
    this.elementTextContent = page.locator('[data-testid="element-text"]');
    
    // Styles
    this.stylesPanel = page.locator('[data-testid="styles-panel"]');
    this.cssPropertiesList = page.locator('[data-testid="css-properties"]');
    this.styleInput = page.locator('[data-testid="style-input"]');
    
    // Preview
    this.previewPanel = page.locator('[data-testid="preview-panel"]');
    this.previewIframe = page.frameLocator('[data-testid="preview-iframe"]');
    
    // Console
    this.consolePanel = page.locator('[data-testid="console-panel"]');
    this.consoleLogsList = page.locator('[data-testid="console-logs"]');
    this.consoleErrorCount = page.locator('[data-testid="console-error-count"]');
    
    // Selection
    this.selectedElementBorder = page.locator('[data-element-selected="true"]');
  }
  
  // ========================================
  // NAVIGATION
  // ========================================
  
  async goto() {
    await this.page.goto('/?edit=true');
    await this.page.waitForLoadState('networkidle');
  }
  
  async openTab(tabName: 'Inspector' | 'AI' | 'Preview' | 'Console' | 'Deploy' | 'Git' | 'Pages' | 'Shell' | 'Files' | 'Secrets') {
    const tab = this.page.getByRole('tab', { name: new RegExp(tabName, 'i') });
    await tab.click();
    await this.page.waitForTimeout(500); // Allow tab to render
  }
  
  // ========================================
  // ELEMENT SELECTION
  // ========================================
  
  async selectElement(selector: string) {
    // Click element within iframe
    const element = this.iframe.locator(selector);
    await element.click();
    
    // Wait for selection to be reflected
    await this.page.waitForTimeout(300);
  }
  
  async clickElementAt(x: number, y: number) {
    await this.iframeOverlay.click({ position: { x, y } });
    await this.page.waitForTimeout(300);
  }
  
  async assertElementSelected(expectedTag: string) {
    await expect(this.elementTag).toHaveText(expectedTag);
    await expect(this.selectedElementBorder).toBeVisible();
  }
  
  async assertPurpleBoundingBox() {
    // Verify selected element has purple border
    const borderColor = await this.selectedElementBorder.evaluate(el => {
      return window.getComputedStyle(el).borderColor;
    });
    
    expect(borderColor).toContain('147'); // RGB purple component
  }
  
  // ========================================
  // INSPECTOR PANEL
  // ========================================
  
  async assertInspectorShowsData(tag: string, classNames?: string[]) {
    await expect(this.elementTag).toHaveText(tag);
    
    if (classNames) {
      for (const className of classNames) {
        await expect(this.elementClasses).toContainText(className);
      }
    }
  }
  
  async getSelectedElementText(): Promise<string> {
    return await this.elementTextContent.textContent() || '';
  }
  
  // ========================================
  // STYLES EDITING
  // ========================================
  
  async editStyle(property: string, value: string) {
    const styleRow = this.stylesPanel.locator(`[data-css-property="${property}"]`);
    const input = styleRow.locator('input');
    
    await input.fill(value);
    await input.press('Enter');
  }
  
  async assertStyleApplied(property: string, expectedValue: string) {
    const styleRow = this.stylesPanel.locator(`[data-css-property="${property}"]`);
    const value = await styleRow.locator('input').inputValue();
    
    expect(value).toBe(expectedValue);
  }
  
  // ========================================
  // PREVIEW PANEL
  // ========================================
  
  async assertPreviewUpdated(selector: string, expectedStyle: Record<string, string>) {
    const element = this.previewIframe.locator(selector);
    
    for (const [property, value] of Object.entries(expectedStyle)) {
      const actualValue = await element.evaluate((el, prop) => {
        return window.getComputedStyle(el).getPropertyValue(prop);
      }, property);
      
      expect(actualValue).toContain(value);
    }
  }
  
  // ========================================
  // CONSOLE PANEL
  // ========================================
  
  async openConsole() {
    await this.openTab('Console');
  }
  
  async assertNoErrors() {
    const errorCount = await this.consoleErrorCount.textContent();
    expect(errorCount).toBe('0');
  }
  
  async getConsoleLogs(): Promise<string[]> {
    const logs = await this.consoleLogsList.locator('[data-testid^="console-log-"]').all();
    const logTexts = await Promise.all(logs.map(log => log.textContent()));
    return logTexts.filter((text): text is string => text !== null);
  }
}
