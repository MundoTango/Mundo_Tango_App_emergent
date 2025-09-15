import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class BillingPage extends BasePage {
  // Selectors - Header
  private readonly pageTitle: Locator;
  private readonly currentPlan: Locator;
  private readonly billingCycle: Locator;
  private readonly nextBillingDate: Locator;

  // Selectors - Plans
  private readonly plansSection: Locator;
  private readonly planCard: Locator;
  private readonly upgradePlanButton: Locator;
  private readonly downgradePlanButton: Locator;
  private readonly currentPlanBadge: Locator;

  // Selectors - Payment Methods
  private readonly paymentMethodsSection: Locator;
  private readonly addPaymentMethodButton: Locator;
  private readonly paymentMethodCard: Locator;
  private readonly defaultPaymentBadge: Locator;
  private readonly removePaymentButton: Locator;

  // Selectors - Billing History
  private readonly billingHistorySection: Locator;
  private readonly invoiceRow: Locator;
  private readonly downloadInvoiceButton: Locator;
  private readonly viewDetailsButton: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize header locators
    this.pageTitle = page.locator('[data-testid="text-billing-title"]');
    this.currentPlan = page.locator('[data-testid="text-current-plan"]');
    this.billingCycle = page.locator('[data-testid="text-billing-cycle"]');
    this.nextBillingDate = page.locator('[data-testid="text-next-billing"]');

    // Initialize plans locators
    this.plansSection = page.locator('[data-testid="section-plans"]');
    this.planCard = page.locator('[data-testid^="card-plan-"]');
    this.upgradePlanButton = page.locator('[data-testid^="button-upgrade-"]');
    this.downgradePlanButton = page.locator('[data-testid^="button-downgrade-"]');
    this.currentPlanBadge = page.locator('[data-testid="badge-current-plan"]');

    // Initialize payment methods locators
    this.paymentMethodsSection = page.locator('[data-testid="section-payment-methods"]');
    this.addPaymentMethodButton = page.locator('[data-testid="button-add-payment"]');
    this.paymentMethodCard = page.locator('[data-testid^="card-payment-"]');
    this.defaultPaymentBadge = page.locator('[data-testid="badge-default-payment"]');
    this.removePaymentButton = page.locator('[data-testid^="button-remove-payment-"]');

    // Initialize billing history locators
    this.billingHistorySection = page.locator('[data-testid="section-billing-history"]');
    this.invoiceRow = page.locator('[data-testid^="row-invoice-"]');
    this.downloadInvoiceButton = page.locator('[data-testid^="button-download-invoice-"]');
    this.viewDetailsButton = page.locator('[data-testid^="button-view-details-"]');
  }

  // Navigation methods
  async navigateToBilling(): Promise<void> {
    await this.goto('/billing');
  }

  // Action methods
  async upgradePlan(planName: string): Promise<void> {
    await this.page.locator(`[data-testid="button-upgrade-${planName}"]`).click();
    await this.expectToastMessage('Plan upgraded successfully');
  }

  async addPaymentMethod(cardDetails: {
    number: string;
    expiry: string;
    cvv: string;
    name: string;
  }): Promise<void> {
    await this.addPaymentMethodButton.click();
    const modal = this.page.locator('[data-testid="modal-add-payment"]');
    await modal.waitFor({ state: 'visible' });
    
    await this.page.locator('[data-testid="input-card-number"]').fill(cardDetails.number);
    await this.page.locator('[data-testid="input-card-expiry"]').fill(cardDetails.expiry);
    await this.page.locator('[data-testid="input-card-cvv"]').fill(cardDetails.cvv);
    await this.page.locator('[data-testid="input-card-name"]').fill(cardDetails.name);
    
    await this.page.locator('[data-testid="button-save-payment"]').click();
    await this.expectToastMessage('Payment method added');
  }

  async downloadInvoice(invoiceId: string): Promise<void> {
    await this.page.locator(`[data-testid="button-download-invoice-${invoiceId}"]`).click();
  }

  // Validation methods
  async getCurrentPlanName(): Promise<string> {
    return await this.currentPlan.textContent() || '';
  }

  async verifyPageElements(): Promise<void> {
    const expectedElements = [
      '[data-testid="text-billing-title"]',
      '[data-testid="section-plans"]',
      '[data-testid="section-payment-methods"]',
      '[data-testid="section-billing-history"]',
    ];
    
    await this.verifyPageStructure(expectedElements);
  }

  // Accessibility and visual regression
  async checkPageAccessibility(): Promise<void> {
    await this.checkAccessibility();
  }

  async takePageSnapshot(name?: string): Promise<void> {
    await this.takeVisualSnapshot(name || 'billing-page');
  }
}