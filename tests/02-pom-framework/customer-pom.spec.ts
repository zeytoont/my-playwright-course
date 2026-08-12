// Import the core testing functions and assertion utilities from the Playwright Test runner library
import { test, expect } from '@playwright/test';

// Import our custom Page Object classes so the script knows how to interact with the UI
import { LoginPage } from '../../pages/LoginPage';
import { DashboardPage } from '../../pages/DashboardPage';
import { CustomersPage } from '../../pages/CustomersPage';
import { CustomerFormPage } from '../../pages/CustomerFormPage';

// Tagged @smoke and @regression so this suite runs as part of both the smoke and regression commands
test.describe('SmartBank - Customer Management Workflows', { tag: ['@smoke', '@regression'] }, () => {

  // Serial execution: ensures these dependent tests run in order, one after another,
  // rather than Playwright potentially reordering or interleaving them
  // Commented out per assignment instructions (Phase 1, Step 4) — disabling serial mode
  // allows tests to run in parallel/independently on the CI runner.
  // test.describe.configure({ mode: 'serial' });

  // ==========================================================================
  // TEST 1: ADD CUSTOMER
  // ==========================================================================
  test('Add Customer', async ({ page }) => {
    // Instantiate the Page Objects needed for this scenario
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    const customersPage = new CustomersPage(page);

    // Generate a unique 7-digit account number so this test never collides with
    // leftover data from a previous run
    const uniqueId = Math.floor(1000000 + Math.random() * 9000000);
    const newCustomerDetails = {
      account: `${uniqueId}`,
      title: 'Mr.',
      firstName: 'Alex',
      lastName: 'Smith',
    };

    // Step 1: Sign in
    await loginPage.navigateTo();
    await loginPage.enterCredentials('Athabasca', 'admin', 'otescu0530');
    await loginPage.clickSignIn();

    const welcomeProfile = await dashboardPage.getWelcomeProfile();
    await expect(welcomeProfile).toBeVisible({ timeout: 10000 });

    // Step 2: Navigate to Customers page
    await dashboardPage.goToCustomers();

    const customersHeader = await customersPage.getCustomersHeader();
    await expect(customersHeader).toBeVisible();

    // Step 3: Click "Add Customer" — Fluent Interface hands back a ready CustomerFormPage
    const customerFormPage = await customersPage.clickAddCustomer();

    const formHeader = await customerFormPage.getPageHeader();
    await expect(formHeader).toBeVisible();

    // Step 4: Fill out the form and save
    await customerFormPage.createCustomerAndSave(newCustomerDetails);

    // NOTE: Confirm this matches your app's actual toast text after creating a customer.
    // 'Created' matches the pattern used by the Add User flow — update if different.
    await expect(page.getByRole('status')).toContainText('Created');

    // Step 5: Verify the new customer appears in the grid, using an exact-match locator
    // so a shorter account number can never accidentally match a longer one
    const newAccountLink = page.getByRole('link', { name: newCustomerDetails.account, exact: true });
    await expect(newAccountLink).toBeVisible();

    // Step 6: Navigate back to Dashboard and log out
    await dashboardPage.goToDashboard();
    const branchHeader = await dashboardPage.getBranchHeader();
    await expect(branchHeader).toBeVisible();

    await dashboardPage.clickLogout();
    await expect(page.getByRole('button', { name: 'Fake button' })).toBeVisible();
  });

  // ==========================================================================
  // TEST 2: EDIT CUSTOMER
  // ==========================================================================
  test('Edit Customer', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    const customersPage = new CustomersPage(page);

    // Self-contained: create the customer this test will edit, rather than depending
    // on data left behind by another test or a previous run
    const uniqueId = Math.floor(1000000 + Math.random() * 9000000);
    const account = `${uniqueId}`;
    const oldLastName = 'Carpenter';
    const newLastName = 'Whitfield';

    await loginPage.navigateTo();
    await loginPage.enterCredentials('Athabasca', 'admin', 'otescu0530');
    await loginPage.clickSignIn();

    const welcomeProfile = await dashboardPage.getWelcomeProfile();
    await expect(welcomeProfile).toBeVisible({ timeout: 10000 });

    await dashboardPage.goToCustomers();

    const customersHeader = await customersPage.getCustomersHeader();
    await expect(customersHeader).toBeVisible();

    // Create the customer to edit
    const addFormPage = await customersPage.clickAddCustomer();
    await addFormPage.createCustomerAndSave({
      account,
      title: 'Miss',
      firstName: 'Johanna',
      lastName: oldLastName,
    });
    await expect(page.getByRole('status')).toContainText('Created');

    // Expand pagination in case this customer isn't on the default first page
    await customersPage.showAllRows();

    // Click the "Edit" link scoped to this exact customer's row (Locator Chaining, no .nth())
    await customersPage.clickEditCustomerLink(account);

    const editFormPage = new CustomerFormPage(page);
    const formHeader = await editFormPage.getPageHeader();
    await expect(formHeader).toBeVisible();

    // Update the last name (account number stays the same — it's our unique identity anchor)
    await editFormPage.updateCustomerDetails({ lastName: newLastName });

    // Wait for the grid to fully reload after the save redirect before proceeding,
    // to avoid racing ahead of a client-side navigation re-render
    await expect(customersHeader).toBeVisible();
    await customersPage.showAllRows();

    // Locate the row by its unchanging account number, then confirm the last name updated
    const customerRow = page.getByRole('row').filter({
      has: page.getByRole('link', { name: account, exact: true })
    });
    await expect(customerRow).toBeVisible();
    await expect(customerRow).toContainText(newLastName);
    await expect(customerRow).not.toContainText(oldLastName);

    await dashboardPage.goToDashboard();
    const branchHeader = await dashboardPage.getBranchHeader();
    await expect(branchHeader).toBeVisible();

    await dashboardPage.clickLogout();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible({ timeout: 10000 });
  });

  // ==========================================================================
  // TEST 3: DELETE CUSTOMER
  // ==========================================================================
  test('Delete Customer', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    const customersPage = new CustomersPage(page);

    // Self-contained: create the customer this test will delete
    const uniqueId = Math.floor(1000000 + Math.random() * 9000000);
    const account = `${uniqueId}`;

    await loginPage.navigateTo();
    await loginPage.enterCredentials('Athabasca', 'admin', 'otescu0530');
    await loginPage.clickSignIn();

    const welcomeProfile = await dashboardPage.getWelcomeProfile();
    await expect(welcomeProfile).toBeVisible({ timeout: 10000 });

    await dashboardPage.goToCustomers();

    const customersHeader = await customersPage.getCustomersHeader();
    await expect(customersHeader).toBeVisible();

    // Create the customer to delete
    const addFormPage = await customersPage.clickAddCustomer();
    await addFormPage.createCustomerAndSave({
      account,
      title: 'Ms.',
      firstName: 'Olga',
      lastName: 'Steveston',
    });
    await expect(page.getByRole('status')).toContainText('Created');

    // Expand pagination in case this customer isn't on the default first page
    await customersPage.showAllRows();

    // Delete the customer via its row (Locator Chaining, no .nth())
    await customersPage.deleteCustomer(account);

    // Confirm the specific row for this account no longer exists
    const deletedRow = page.getByRole('row').filter({
      has: page.getByRole('link', { name: account, exact: true })
    });
    await expect(deletedRow).not.toBeVisible();

    await dashboardPage.goToDashboard();
    const branchHeader = await dashboardPage.getBranchHeader();
    await expect(branchHeader).toBeVisible();

    await dashboardPage.clickLogout();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible({ timeout: 10000 });
  });

});