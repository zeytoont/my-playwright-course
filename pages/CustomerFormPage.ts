// Import the necessary types from the Playwright testing framework
import { Page, Locator } from '@playwright/test';

// Define and export our consolidated blueprint class for managing Customer Forms (Add & Edit)
export class CustomerFormPage {

  // ==========================================
  // 1. PROPERTIES (Declaring the form variable slots)
  // ==========================================
  private page: Page;
  private pageHeader: Locator;
  private accountInput: Locator;
  private titleDropdown: Locator;
  private firstNameInput: Locator;
  private lastNameInput: Locator;
  private saveButton: Locator;
  private saveAndAddAnotherButton: Locator;
  private cancelButton: Locator;

  // ==========================================
  // 2. CONSTRUCTOR (Wiring up the form fields and buttons)
  // ==========================================
  constructor(page: Page) {
    this.page = page;

    // Smart Locator: Dynamically targets the main page heading whether it's "Add Customer" or "Edit Customer"
    this.pageHeader = page.locator('h1, h2, .main-heading');

    // Wire up all the input text boxes using their explicit labels from the UI
    this.accountInput = page.getByLabel('Account #:*');
    this.firstNameInput = page.getByLabel('First Name:*');
    this.lastNameInput = page.getByLabel('Last Name:*');

    // Wire up the Title dropdown element
    this.titleDropdown = page.getByLabel('Title:');

    // Smart Locator: Matches "Save" OR "Save changes" automatically using a Regular Expression,
    // so this one button locator works whether the form is in Add mode or Edit mode
    this.saveButton = page.getByRole('button', { name: /^Save( changes)?$/i });

    // Wire up the "Save & Add another" button (Only visible on Add screen)
    this.saveAndAddAnotherButton = page.getByRole('button', { name: 'Save & Add another' });

    // Flexible Locator: Handles "Cancel" button whether rendered as a button or direct anchor link
    this.cancelButton = page.getByRole('button', { name: 'Cancel', exact: true }).or(page.getByRole('link', { name: 'Cancel', exact: true }));
  }

  // ==========================================
  // 3. METHODS (The Actions for the Test Script)
  // ==========================================

  /**
   * Helper method to populate text fields and dropdown selections on the form.
   * This prevents repeating the .fill() steps across different click actions.
   *
   * All properties are optional (TypeScript "?") with guard checks (!== undefined)
   * so this single method safely supports both full Add-Customer submissions and
   * partial Edit-Customer updates without corrupting fields that weren't provided.
   */
  private async fillFormFields(details: {
    account?: string;
    title?: string;
    firstName?: string;
    lastName?: string;
  }) {
    // We use conditional checks so we can safely reuse this method for partial Updates/Edits
    if (details.account !== undefined) await this.accountInput.fill(details.account);
    if (details.title !== undefined) await this.titleDropdown.selectOption(details.title);
    if (details.firstName !== undefined) await this.firstNameInput.fill(details.firstName);
    if (details.lastName !== undefined) await this.lastNameInput.fill(details.lastName);
  }

  /**
   * Action: Fills out the entire customer creation form and clicks the standard "Save" button
   */
  async createCustomerAndSave(details: any) {
    await this.fillFormFields(details);
    await this.saveButton.click();
  }

  /**
   * Action: Fills out the entire customer creation form and clicks "Save & Add another"
   * to clear the form and submit data without leaving the screen.
   */
  async createCustomerAndAddAnother(details: any) {
    await this.fillFormFields(details);
    await this.saveAndAddAnotherButton.click();
  }

  /**
   * Action: Fills out the entire form but cancels the creation process.
   */
  async createCustomerAndCancel(details: any) {
    await this.fillFormFields(details);
    await this.cancelButton.click();
  }

  /**
   * Action: Modifies existing customer fields and clicks "Save changes"
   */
  async updateCustomerDetails(updatedDetails: any) {
    await this.fillFormFields(updatedDetails);
    await this.saveButton.click();
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