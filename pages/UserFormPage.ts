// Import the necessary types from the Playwright testing framework
import { Page, Locator } from '@playwright/test';

// Define and export our consolidated blueprint class for managing User Forms (Add & Edit)
export class UserFormPage {
  
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

  // 🚀 ADDITIONS FOR EDIT SCREEN WORKFLOWS
  private deleteButton: Locator;
  private newPasswordInput: Locator;
  private confirmPasswordInput: Locator;

  // ==========================================
  // 2. CONSTRUCTOR (Wiring up the form fields and buttons)
  // ==========================================
  constructor(page: Page) {
    this.page = page;

    // Smart Locator: Dynamically targets the main page heading whether it's "Add User" or "Edit User"
    this.pageHeader = page.locator('h1, h2, .main-heading');

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

    // Smart Locator: Matches "Save" OR "Save changes" automatically using a Regular Expression
    this.saveButton = page.getByRole('button', { name: /^Save( changes)?$/i });

    // Wire up the "Save & Add another" button (Only visible on Add screen)
    this.saveAndAddAnotherButton = page.getByRole('button', { name: 'Save & Add another' });

    // Flexible Locator: Handles "Cancel" button whether rendered as a button or direct anchor link
    this.cancelButton = page.getByRole('button', { name: 'Cancel', exact: true }).or(page.getByRole('link', { name: 'Cancel', exact: true }));

    // 🚀 WIRE UP NEW EDIT-ONLY ELEMENTS
    // Wire up the red "Delete" button found in the top-right corner of the Edit page
    this.deleteButton = page.getByRole('button', { name: 'Delete', exact: true });

    // Wire up Password Management input blocks at the bottom card container
    this.newPasswordInput = page.getByLabel('New Password');
    this.confirmPasswordInput = page.getByLabel('Confirm Password');
  }

  // ==========================================
  // 3. METHODS (The Actions for the Test Script)
  // ==========================================

  /**
   * Helper method to populate text fields and dropdown selections on the form.
   * This prevents repeating the .fill() steps across different click actions.
   */
  private async fillFormFields(details: {
    username?: string; // Made optional to support partial edits
    password?: string;
    firstName?: string;
    lastName?: string;
    company?: string;
    phone?: string;
    email?: string;
    role?: string;
  }) {
    // We use conditional checks so we can safely reuse this method for partial Updates/Edits
    if (details.username !== undefined) await this.usernameInput.fill(details.username);
    if (details.password !== undefined) await this.passwordInput.fill(details.password);
    if (details.firstName !== undefined) await this.firstNameInput.fill(details.firstName);
    if (details.lastName !== undefined) await this.lastNameInput.fill(details.lastName);
    if (details.company !== undefined) await this.companyInput.fill(details.company);
    if (details.phone !== undefined) await this.phoneInput.fill(details.phone);
    if (details.email !== undefined) await this.emailInput.fill(details.email);
    if (details.role !== undefined) await this.branchRoleDropdown.selectOption({ label: details.role });
  }

  /**
   * Action: Fills out the entire user creation form and clicks the standard "Save" button
   */
  async createUserAndSave(details: any) {
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
   * Action: Fills out the entire form but cancels the creation process.
   */
  async createUserAndCancel(details: any) {
    await this.fillFormFields(details);
    await this.cancelButton.click();
  }

  /**
   * 🚀 NEW SCENARIO ACTION: Modifies existing user fields and clicks "Save changes"
   */
  async updateUserDetails(updatedDetails: any) {
    await this.fillFormFields(updatedDetails);
    await this.saveButton.click();
  }

  /**
   * 🚀 NEW SCENARIO ACTION: Clicks the red "Delete" button directly from within the edit view
   */
  async clickDeleteUser() {
    await this.deleteButton.click();
  }

  /**
   * Action: Clicks the "Cancel" button to abort operations and exit the form views.
   */
  async clickCancel() {
    await this.cancelButton.click();
  }

  // Data Provider: Hands the dynamic header element back to the test for verification checks
  async getPageHeader() {
    return this.pageHeader;
  }
}