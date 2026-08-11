// Import the necessary building blocks (types) from the Playwright testing framework
import { Page, Locator } from '@playwright/test';

// Define and export our blueprint class so our test files can use it
export class UsersPage {
  
  // ==========================================
  // 1. PROPERTIES (The Blueprint Dimensions)
  // ==========================================
  
  // Holds the reference to the active browser window/tab instance
  private page: Page;
  
  // Declares the variable for the main page header text element
  private usersHeader: Locator;
  
  // Declares the variable for the blue "Add User" action button
  private addUserButton: Locator;

  // Declares the variable for the pagination selection dropdown menu
  private paginationDropdown: Locator;

  // ==========================================
  // 2. CONSTRUCTOR (The Electrical Wiring)
  // ==========================================
  
  // Runs automatically the moment a test script creates a 'new UsersPage(page)' instance
  constructor(page: Page) {
    
    // Saves the active browser window to our internal property for future actions
    this.page = page;

    // Locates the specific text heading on the page to confirm we are in the right room
    // NOTE: exact: true is required here because Filament's empty-state heading
    // ("No Users - 'Athabasca' branch") contains this string as a substring,
    // which triggers a strict-mode violation without it.
    this.usersHeader = page.getByRole('heading', { name: "Users - 'Athabasca' Branch", exact: true });

    // Locates the physical "Add User" button using its link role and text label
    this.addUserButton = page.getByRole('link', { name: 'Add User' });

    // Locates the pagination dropdown menu exactly as captured by the recorder's accessibility label
    this.paginationDropdown = page.getByLabel('Per page 5 10 25 50 All');
  }

  // ==========================================
  // 3. METHODS (The Homeowner Actions)
  // ==========================================

  // An asynchronous action that instructs the automation runner to click the Add User button
  async clickAddUser() {
    // Command the browser to wait for and click our pre-wired "Add User" button
    await this.addUserButton.click();
  }

  // An asynchronous action that locates a specific user's row by their unique username,
  // then clicks the "Edit" link scoped to that exact row (Locator Chaining, no .nth())
  async clickEditUserLink(username: string) {
    // Find the row containing a link with the EXACT username text (not a substring match).
    // Using getByRole('row', { name: username }) alone is unsafe: it does substring matching,
    // so a username like 'tester_99' would also match a row for 'tester_99_updated'.
    const targetRow = this.page.getByRole('row').filter({
      has: this.page.getByRole('link', { name: username, exact: true })
    });

    // Within that specific row, locate and click the "Edit" link
    await targetRow.getByRole('link', { name: 'Edit', exact: true }).click();
  }

  // An asynchronous action that locates a specific user's row by their unique username,
  // clicks its "Delete" button, then confirms the deletion in the resulting dialog
  async deleteUser(username: string) {
    // Find the row containing a link with the EXACT username text (see note above)
    const targetRow = this.page.getByRole('row').filter({
      has: this.page.getByRole('link', { name: username, exact: true })
    });

    // Within that specific row, locate and click the "Delete" button
    await targetRow.getByRole('button', { name: 'Delete', exact: true }).click();

    // Confirm the deletion in the popup/modal that appears
    await this.page.getByRole('button', { name: 'Yes, delete it' }).click();
  }

  // A data provider method that hands the header element back to the main test script
  async getUsersHeader() {
    // Returns the raw locator block so the test script can verify its visibility on screen
    return this.usersHeader;
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