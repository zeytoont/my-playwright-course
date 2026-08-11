// Import the core testing functions and assertion utilities from the Playwright Test runner library
import { test, expect } from '@playwright/test';

// Import our custom Page Object classes so the script knows how to interact with the UI
import { LoginPage } from '../../pages/LoginPage';
import { DashboardPage } from '../../pages/DashboardPage';
import { CustomersPage } from '../../pages/CustomersPage';

// Tagged @regression so this suite runs as part of the regression test command
test.describe('SmartBank Application - Customer Management Workflows', { tag: '@regression' }, () => {

  // 1. Define the arrays managing distinct customer title variations and form action configurations
  const customerTitles = ['Mr.', 'Mrs.', 'Miss', 'Ms.'];
  const actionButtons = ['Save', 'Save & Add another', 'Cancel'];

  // 2. Outer Loop: Controls the Customer Title variations
  for (const title of customerTitles) {
    // 3. Inner Loop: Controls form submission buttons
    for (const buttonAction of actionButtons) {

      // Dynamically name the test case based on the parameters
      test(`Should handle workflow for Title: "${title}" using Button: "${buttonAction}"`, async ({ page }) => {

        // ========================================================
        // INITIALIZE ALL PAGE OBJECT BLUEPRINTS
        // ========================================================
        const loginPage = new LoginPage(page);
        const dashboardPage = new DashboardPage(page);
        const customersPage = new CustomersPage(page);

        // Sanitize strings to avoid account number collisions across parallel/repeated runs
        // Generate a 7-digit random account number (unique per iteration)
        const uniqueId = Math.floor(1000000 + Math.random() * 9000000);

        const newCustomerDetails = {
          account: `${uniqueId}`,
          title: title,
          firstName: 'Alex',
          lastName: 'Smith',
        };

        // ========================================================
        // STEP 1: Sign In and Navigate to Dashboard Page
        // ========================================================
        await loginPage.navigateTo();
        await loginPage.enterCredentials('Athabasca', 'admin', 'otescu0530');
        await loginPage.clickSignIn();

        const welcomeProfile = await dashboardPage.getWelcomeProfile();
        await expect(welcomeProfile).toBeVisible({ timeout: 10000 });

        // ========================================================
        // STEP 2: Navigate to Customers Page & Verify Grid Entry
        // ========================================================
        await dashboardPage.goToCustomers();

        const customersHeader = await customersPage.getCustomersHeader();
        await expect(customersHeader).toBeVisible();

        // ========================================================
        // STEP 3: Click Add Customer and Verify Form Entry
        // ========================================================
        // Fluent Interface: clicking Add Customer hands back a ready CustomerFormPage instance
        const customerFormPage = await customersPage.clickAddCustomer();

        const formHeader = await customerFormPage.getPageHeader();
        await expect(formHeader).toBeVisible();

        // ========================================================
        // DATA POPULATION & DYNAMIC FORM ACTION ROUTING
        // ========================================================
        if (buttonAction === 'Save') {
          await customerFormPage.createCustomerAndSave(newCustomerDetails);

        } else if (buttonAction === 'Save & Add another') {
          await customerFormPage.createCustomerAndAddAnother(newCustomerDetails);

        } else if (buttonAction === 'Cancel') {
          await customerFormPage.createCustomerAndCancel(newCustomerDetails);
        }

        // ========================================================
        // CONDITIONAL ASSERTIONS BASED ON ACTIONS
        // ========================================================
        if (buttonAction === 'Save') {
          // Redirected back to Customers grid automatically -> check table cell record
          const newAccountLink = page.getByRole('link', { name: newCustomerDetails.account, exact: true });
          await expect(newAccountLink).toBeVisible();

        } else if (buttonAction === 'Save & Add another') {
          // Stays on 'Add Customer' page with fields cleared -> check visibility and blank values
          await expect(formHeader).toBeVisible();
          await expect(page.getByLabel('Account #:*')).toHaveValue('');

          // Navigate to Customers page to confirm the record was actually saved
          await dashboardPage.goToCustomers();
          const verifiedAccountLink = page.getByRole('link', { name: newCustomerDetails.account, exact: true });
          await expect(verifiedAccountLink).toBeVisible();

        } else if (buttonAction === 'Cancel') {
          // Bailed back to main table grid -> confirm the record was never created
          await expect(customersHeader).toBeVisible();
          const newAccountLink = page.getByRole('link', { name: newCustomerDetails.account, exact: true });
          await expect(newAccountLink).not.toBeVisible();
        }

        // ========================================================
        // TEARDOWN AND CLEANUP
        // ========================================================
        await dashboardPage.goToDashboard();
        const branchHeader = await dashboardPage.getBranchHeader();
        await expect(branchHeader).toBeVisible();

        await dashboardPage.clickLogout();
        await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();

        // ========================================================
        // ⏳ ANTI-BRUTE FORCE PACING DELAY
        // ========================================================

        // Pause for 3 seconds to let the SmartBank application firewall cool down
        // before the next parallel or iterative loop attempts another login.
        await page.waitForTimeout(3000);
      });
    }
  }
});