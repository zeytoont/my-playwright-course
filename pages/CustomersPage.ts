// Import the necessary building blocks (types) from the Playwright testing framework
import { Page, Locator } from '@playwright/test';

// Import the CustomerFormPage so clickAddCustomer() can hand back a ready-to-use instance
// of it (Fluent Interface pattern) rather than making the test file instantiate it manually
import { CustomerFormPage } from './CustomerFormPage';

// Define and export our blueprint class so our test files can use it
export class CustomersPage {

  // ==========================================
  // 1. PROPERTIES (The Blueprint Dimensions)
  // ==========================================

  // Holds the reference to the active browser window/tab instance
  private page: Page;

  // Declares the variable for the main page header text element
  private customersHeader: Locator;

  // Declares the variable for the blue "Add Customer" action button
  private addCustomerButton: Locator;

  // Declares the variable for the pagination selection dropdown menu
  private paginationDropdown: Locator;

  // ==========================================
  // 2. CONSTRUCTOR (The Electrical Wiring)
  // ==========================================

  // Runs automatically the moment a test script creates a 'new CustomersPage(page)' instance
  constructor(page: Page) {

    // Saves the active browser window to our internal property for future actions
    this.page = page;

    // Locates the specific text heading on the page to confirm we are in the right room
    // NOTE: exact: true is required here because Filament's empty-state heading
    // ("No Customers - 'Athabasca' branch") contains this string as a substring,
    // which triggers a strict-mode violation without it.
    this.customersHeader = page.getByRole('heading', { name: "Customers - 'Athabasca' Branch", exact: true });

    // Locates the physical "Add Customer" button using its link role and text label
    this.addCustomerButton = page.getByRole('link', { name: 'Add Customer' });

    // Locates the pagination dropdown menu exactly as captured by the recorder's accessibility label
    this.paginationDropdown = page.getByLabel('Per page 5 10 25 50 All');
  }

  // ==========================================
  // 3. METHODS (The Homeowner Actions)
  // ==========================================

  // An asynchronous action that instructs the automation runner to click the Add Customer button.
  // Fluent Interface pattern: after clicking, it instantiates and returns a fresh CustomerFormPage
  // object, letting the test script chain directly into filling out the form that just appeared.
  async clickAddCustomer(): Promise<CustomerFormPage> {
    // Command the browser to wait for and click our pre-wired "Add Customer" button
    await this.addCustomerButton.click();

    // Return a brand-new CustomerFormPage instance, pre-configured with the active browser context
    return new CustomerFormPage(this.page);
  }

  // An asynchronous action that locates a specific customer's row by their unique account
  // number, then clicks the "Edit" link scoped to that exact row (Locator Chaining, no .nth())
  async clickEditCustomerLink(account: string) {
    // Find the row containing a link with the EXACT account number text (not a substring match).
    // A bare getByRole('row', { name: account }) is unsafe: it does substring matching, so
    // account '123456' would also match a row for account '1234567'.
    const targetRow = this.page.getByRole('row').filter({
      has: this.page.getByRole('link', { name: account, exact: true })
    });

    // Within that specific row, locate and click the "Edit" link
    await targetRow.getByRole('link', { name: 'Edit', exact: true }).click();
  }

  // An asynchronous action that locates a specific customer's row by their unique account
  // number, clicks its "Delete" button, then confirms the deletion in the resulting dialog
  async deleteCustomer(account: string) {
    // Find the row containing a link with the EXACT account number text (see note above)
    const targetRow = this.page.getByRole('row').filter({
      has: this.page.getByRole('link', { name: account, exact: true })
    });

    // Within that specific row, locate and click the "Delete" button
    await targetRow.getByRole('button', { name: 'Delete', exact: true }).click();

    // Confirm the deletion in the popup/modal that appears
    await this.page.getByRole('button', { name: 'Yes, delete it' }).click();
  }

  // A data provider method that hands the header element back to the main test script
  async getCustomersHeader() {
    // Returns the raw locator block so the test script can verify its visibility on screen
    return this.customersHeader;
  }

  // An action method that forces the table display settings to reveal all record rows
  async showAllRows() {
    // Check if the dropdown is visible on the screen before trying to interact with it
    if (await this.paginationDropdown.isVisible()) {
      // Selects the option using its technical lowercase value attribute captured during recording
      await this.paginationDropdown.selectOption('all');
    } else {
      // Log a message to the console for easier debugging if it's skipped
      console.log('Pagination dropdown not visible (Empty state table). Skipping "Show All" configuration.');
    }
  }
}