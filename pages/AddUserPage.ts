// Import the necessary types from the Playwright testing framework
import { Page, Locator } from '@playwright/test';

// Define and export our blueprint class for the Add User form screen
export class AddUserPage {
  
  // ==========================================
  // 1. PROPERTIES (Declaring the form variable slots)
  // ==========================================
  private page: Page;
  private pageHeader: Locator;
  private usernameInput: Locator;
  private passwordInput: Locator;
  private firstNameInput: Locator;
  private lastNameInput: Locator;
  private companyInput: Locator;
  private phoneInput: Locator;
  private emailInput: Locator;
  private branchRoleDropdown: Locator;
  private saveButton: Locator;
  private saveAndAddAnotherButton: Locator;
  private cancelButton: Locator;

  // ==========================================
  // 2. CONSTRUCTOR (Wiring up the form fields and buttons)
  // ==========================================
  constructor(page: Page) {
    this.page = page;

    // Locates the main page heading to verify we arrived at the correct screen
    this.pageHeader = page.getByRole('heading', { name: 'Add User' });

    // Wire up all the input text boxes using their explicit labels from the UI
    this.usernameInput = page.getByLabel('Username*');
    this.passwordInput = page.getByLabel('Password*');
    this.firstNameInput = page.getByLabel('First Name:');
    this.lastNameInput = page.getByLabel('Last Name:');
    this.companyInput = page.getByLabel('Company:');
    this.phoneInput = page.getByLabel('Phone:');
    this.emailInput = page.getByLabel('Email:');

    // Wire up the Branch Role dropdown element
    this.branchRoleDropdown = page.getByLabel('Branch Role:*');

    // Wire up the primary "Save" submission button (exact matching ensures no mix-ups)
    this.saveButton = page.getByRole('button', { name: 'Save', exact: true });

    // Wire up the "Save & Add another" button
    this.saveAndAddAnotherButton = page.getByRole('button', { name: 'Save & Add another' });

    // Wire up the "Cancel" action button - it is actually a link!!!
    this.cancelButton = page.getByRole('link', { name: 'Cancel' });
  }

  // ==========================================
  // 3. METHODS (The Actions for the Test Script)
  // ==========================================

  /**
   * Helper method to populate all text fields and dropdown selections on the form.
   * This prevents repeating the .fill() steps across different click actions.
   */
  private async fillFormFields(details: {
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    company: string;
    phone: string;
    email: string;
    role: string;
  }) {
    await this.usernameInput.fill(details.username);
    await this.passwordInput.fill(details.password);
    await this.firstNameInput.fill(details.firstName);
    await this.lastNameInput.fill(details.lastName);
    await this.companyInput.fill(details.company);
    await this.phoneInput.fill(details.phone);
    await this.emailInput.fill(details.email);
    await this.branchRoleDropdown.selectOption({ label: details.role });
  }

  /**
   * Action: Fills out the entire user creation form and clicks the standard "Save" button
   */
  async createUser(details: any) {
    await this.fillFormFields(details);
    await this.saveButton.click();
  }

  /**
   * Action: Fills out the entire user creation form and clicks "Save & Add another"
   * to clear the form and submit data without leaving the screen.
   */
  async createUserAndAddAnother(details: any) {
    await this.fillFormFields(details);
    await this.saveAndAddAnotherButton.click();
  }

  /**
   * Action: Clicks the "Cancel" button to abort user creation and exit the form.
   */
  async clickCancel() {
    await this.cancelButton.click();
  }

  // Data Provider: Hands the header element back to the test for verification checks
  async getPageHeader() {
    return this.pageHeader;
  }
}