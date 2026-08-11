import { Page, Locator } from '@playwright/test'; // Removed 'expect' from here

export class LoginPage {
  // 1. PROPERTIES: The class remembers the page context and ALL UI elements
  private page: Page;
  private branchInput: Locator;
  private userInput: Locator;
  private passwordInput: Locator;
  private signInButton: Locator;
  private welcomeBanner: Locator;

  // 2. CONSTRUCTOR: The electrical breaker box that hooks up the 'page' ONCE
  constructor(page: Page) {
    this.page = page; // Store the main power line internally
    
    // Wire up all the individual appliance lines (Locators)
    this.branchInput = page.getByLabel('Branch Name*');
    this.userInput = page.getByLabel('User Name*');
    this.passwordInput = page.getByLabel('Password*');
    this.signInButton = page.getByRole('button', { name: 'Sign in' });
    this.welcomeBanner = page.getByRole('main');
  }

  // 3. METHODS: Pure actions and data providers only. No assertions!
  async navigateTo() {
    // NOTE: waitUntil: 'domcontentloaded' (instead of the default 'load') tells Playwright
    // to proceed as soon as the DOM is ready, rather than waiting for every image, font,
    // and analytics script to finish loading. The login form is interactable well before
    // the full 'load' event fires, so this reduces flakiness without masking real problems.
    //
    // The explicit timeout: 30000 override only applies to this one navigation call — it
    // does NOT change the global navigationTimeout in playwright.config.ts. This gives the
    // shared QA server (which can be slow under heavy automated test traffic) extra room
    // on just this specific step.
    await this.page.goto('https://qa.hitekschool.com/lms/3108/login', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });
  }

  async enterCredentials(branch: string, user: string, pass: string) {
    await this.branchInput.fill(branch);
    await this.userInput.fill(user);
    await this.passwordInput.fill(pass);
  }

  async clickSignIn() {
    await this.signInButton.click();
  }

  // This method simply hands the locator over to the test file when asked
  async getWelcomeBanner() {
    return this.welcomeBanner;
  }
}