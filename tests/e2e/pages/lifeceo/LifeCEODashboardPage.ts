import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class LifeCEODashboardPage extends BasePage {
  // Selectors - Header
  private readonly pageTitle: Locator;
  private readonly aiAssistantButton: Locator;
  private readonly settingsButton: Locator;
  private readonly syncButton: Locator;

  // Selectors - Goal Management
  private readonly goalsSection: Locator;
  private readonly addGoalButton: Locator;
  private readonly goalCard: Locator;
  private readonly goalProgress: Locator;
  private readonly goalDeadline: Locator;
  private readonly goalActions: Locator;

  // Selectors - Task Management
  private readonly tasksSection: Locator;
  private readonly addTaskButton: Locator;
  private readonly taskList: Locator;
  private readonly taskItem: Locator;
  private readonly taskCheckbox: Locator;
  private readonly taskPriority: Locator;

  // Selectors - Habit Tracker
  private readonly habitsSection: Locator;
  private readonly addHabitButton: Locator;
  private readonly habitGrid: Locator;
  private readonly habitStreak: Locator;
  private readonly habitCheckIn: Locator;

  // Selectors - Analytics
  private readonly analyticsSection: Locator;
  private readonly productivityChart: Locator;
  private readonly progressChart: Locator;
  private readonly timeChart: Locator;
  private readonly insightsPanel: Locator;

  // Selectors - AI Assistant
  private readonly aiChatModal: Locator;
  private readonly aiChatInput: Locator;
  private readonly aiChatMessages: Locator;
  private readonly aiSuggestions: Locator;
  private readonly aiSendButton: Locator;

  // Selectors - Integrations
  private readonly integrationsPanel: Locator;
  private readonly calendarWidget: Locator;
  private readonly notesWidget: Locator;
  private readonly focusTimerWidget: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize header locators
    this.pageTitle = page.locator('[data-testid="text-lifeceo-title"]');
    this.aiAssistantButton = page.locator('[data-testid="button-ai-assistant"]');
    this.settingsButton = page.locator('[data-testid="button-lifeceo-settings"]');
    this.syncButton = page.locator('[data-testid="button-sync"]');

    // Initialize goal management locators
    this.goalsSection = page.locator('[data-testid="section-goals"]');
    this.addGoalButton = page.locator('[data-testid="button-add-goal"]');
    this.goalCard = page.locator('[data-testid^="card-goal-"]');
    this.goalProgress = page.locator('[data-testid^="progress-goal-"]');
    this.goalDeadline = page.locator('[data-testid^="deadline-goal-"]');
    this.goalActions = page.locator('[data-testid^="actions-goal-"]');

    // Initialize task management locators
    this.tasksSection = page.locator('[data-testid="section-tasks"]');
    this.addTaskButton = page.locator('[data-testid="button-add-task"]');
    this.taskList = page.locator('[data-testid="list-tasks"]');
    this.taskItem = page.locator('[data-testid^="item-task-"]');
    this.taskCheckbox = page.locator('[data-testid^="checkbox-task-"]');
    this.taskPriority = page.locator('[data-testid^="priority-task-"]');

    // Initialize habit tracker locators
    this.habitsSection = page.locator('[data-testid="section-habits"]');
    this.addHabitButton = page.locator('[data-testid="button-add-habit"]');
    this.habitGrid = page.locator('[data-testid="grid-habits"]');
    this.habitStreak = page.locator('[data-testid^="streak-habit-"]');
    this.habitCheckIn = page.locator('[data-testid^="checkin-habit-"]');

    // Initialize analytics locators
    this.analyticsSection = page.locator('[data-testid="section-analytics"]');
    this.productivityChart = page.locator('[data-testid="chart-productivity"]');
    this.progressChart = page.locator('[data-testid="chart-progress"]');
    this.timeChart = page.locator('[data-testid="chart-time"]');
    this.insightsPanel = page.locator('[data-testid="panel-insights"]');

    // Initialize AI assistant locators
    this.aiChatModal = page.locator('[data-testid="modal-ai-chat"]');
    this.aiChatInput = page.locator('[data-testid="input-ai-chat"]');
    this.aiChatMessages = page.locator('[data-testid="messages-ai-chat"]');
    this.aiSuggestions = page.locator('[data-testid="suggestions-ai"]');
    this.aiSendButton = page.locator('[data-testid="button-send-ai"]');

    // Initialize integrations locators
    this.integrationsPanel = page.locator('[data-testid="panel-integrations"]');
    this.calendarWidget = page.locator('[data-testid="widget-calendar"]');
    this.notesWidget = page.locator('[data-testid="widget-notes"]');
    this.focusTimerWidget = page.locator('[data-testid="widget-focus-timer"]');
  }

  // Navigation methods
  async navigateToLifeCEO(): Promise<void> {
    await this.goto('/lifeceo');
  }

  async openAIAssistant(): Promise<void> {
    await this.aiAssistantButton.click();
    await this.aiChatModal.waitFor({ state: 'visible' });
  }

  async openSettings(): Promise<void> {
    await this.settingsButton.click();
    await this.waitForPageLoad();
  }

  // Goal management methods
  async addGoal(goal: {
    title: string;
    description?: string;
    deadline?: string;
    category?: string;
  }): Promise<void> {
    await this.addGoalButton.click();
    const modal = this.page.locator('[data-testid="modal-add-goal"]');
    await modal.waitFor({ state: 'visible' });
    
    await this.page.locator('[data-testid="input-goal-title"]').fill(goal.title);
    
    if (goal.description) {
      await this.page.locator('[data-testid="textarea-goal-description"]').fill(goal.description);
    }
    
    if (goal.deadline) {
      await this.page.locator('[data-testid="input-goal-deadline"]').fill(goal.deadline);
    }
    
    if (goal.category) {
      await this.page.locator('[data-testid="select-goal-category"]').selectOption(goal.category);
    }
    
    await this.page.locator('[data-testid="button-save-goal"]').click();
    await this.expectToastMessage('Goal added successfully');
  }

  async updateGoalProgress(goalId: string, progress: number): Promise<void> {
    const progressSlider = this.page.locator(`[data-testid="slider-goal-${goalId}"]`);
    await progressSlider.fill(progress.toString());
    await this.expectToastMessage('Progress updated');
  }

  // Task management methods
  async addTask(task: {
    title: string;
    priority?: 'low' | 'medium' | 'high';
    dueDate?: string;
    assignedGoal?: string;
  }): Promise<void> {
    await this.addTaskButton.click();
    
    await this.page.locator('[data-testid="input-task-title"]').fill(task.title);
    
    if (task.priority) {
      await this.page.locator('[data-testid="select-task-priority"]').selectOption(task.priority);
    }
    
    if (task.dueDate) {
      await this.page.locator('[data-testid="input-task-due-date"]').fill(task.dueDate);
    }
    
    if (task.assignedGoal) {
      await this.page.locator('[data-testid="select-task-goal"]').selectOption(task.assignedGoal);
    }
    
    await this.page.locator('[data-testid="button-save-task"]').click();
  }

  async completeTask(taskId: string): Promise<void> {
    await this.page.locator(`[data-testid="checkbox-task-${taskId}"]`).check();
    await this.expectToastMessage('Task completed');
  }

  // Habit tracker methods
  async addHabit(habit: {
    name: string;
    frequency: 'daily' | 'weekly' | 'monthly';
    target?: number;
  }): Promise<void> {
    await this.addHabitButton.click();
    const modal = this.page.locator('[data-testid="modal-add-habit"]');
    await modal.waitFor({ state: 'visible' });
    
    await this.page.locator('[data-testid="input-habit-name"]').fill(habit.name);
    await this.page.locator('[data-testid="select-habit-frequency"]').selectOption(habit.frequency);
    
    if (habit.target) {
      await this.page.locator('[data-testid="input-habit-target"]').fill(habit.target.toString());
    }
    
    await this.page.locator('[data-testid="button-save-habit"]').click();
  }

  async checkInHabit(habitId: string): Promise<void> {
    await this.page.locator(`[data-testid="checkin-habit-${habitId}"]`).click();
    await this.expectToastMessage('Habit checked in');
  }

  // AI Assistant methods
  async askAI(question: string): Promise<void> {
    await this.openAIAssistant();
    await this.aiChatInput.fill(question);
    await this.aiSendButton.click();
    await this.waitForApiResponse('/api/ai/chat');
  }

  async applyAISuggestion(suggestionIndex: number): Promise<void> {
    const suggestions = await this.aiSuggestions.locator('[data-testid^="suggestion-"]').all();
    if (suggestions[suggestionIndex]) {
      await suggestions[suggestionIndex].click();
      await this.expectToastMessage('Suggestion applied');
    }
  }

  // Validation methods
  async getGoalCount(): Promise<number> {
    const goals = await this.goalCard.all();
    return goals.length;
  }

  async getTaskCount(completed = false): Promise<number> {
    const selector = completed 
      ? '[data-testid^="item-task-"][data-completed="true"]'
      : '[data-testid^="item-task-"]';
    const tasks = await this.page.locator(selector).all();
    return tasks.length;
  }

  async getHabitStreak(habitId: string): Promise<number> {
    const streak = await this.page.locator(`[data-testid="streak-habit-${habitId}"]`).textContent() || '0';
    return parseInt(streak.replace(/\D/g, ''));
  }

  async verifyInsight(expectedText: string): Promise<void> {
    const insights = await this.insightsPanel.textContent();
    expect(insights).toContain(expectedText);
  }

  async verifyPageElements(): Promise<void> {
    const expectedElements = [
      '[data-testid="text-lifeceo-title"]',
      '[data-testid="section-goals"]',
      '[data-testid="section-tasks"]',
      '[data-testid="section-habits"]',
      '[data-testid="section-analytics"]',
    ];
    
    await this.verifyPageStructure(expectedElements);
  }

  // Accessibility and visual regression
  async checkPageAccessibility(): Promise<void> {
    await this.checkAccessibility();
  }

  async takePageSnapshot(name?: string): Promise<void> {
    await this.takeVisualSnapshot(name || 'lifeceo-dashboard');
  }

  async takeAnalyticsSnapshot(): Promise<void> {
    await this.takeElementSnapshot('[data-testid="section-analytics"]', 'lifeceo-analytics');
  }
}