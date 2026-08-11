// Import the core testing functions and assertion utilities from the Playwright Test runner library
import { test, expect } from '@playwright/test';

// Import our custom Page Object classes so the script knows how to interact with LoanApp UI
import { LoginPage } from '../../pages/LoginPage';
import { DashboardPage } from '../../pages/DashboardPage';
import { UsersPage } from '../../pages/UsersPage';
import { AddUserPage } from '../../pages/AddUserPage';
import { UserFormPage } from '../../pages/UserFormPage';

// Create a logical test suite block to group all LoanApp user management test scenarios together
// Tagged @smoke and @regression so this suite runs as part of both the smoke and regression commands
test.describe('SmartBank - User Management Workflows', { tag: ['@smoke', '@regression'] }, () => {

  // Define the end-to-end test case for adding new user
  test('Add User', async ({ page }) => {
    
    // ========================================================
    // 1. INITIALIZE PAGE OBJECT BLUEPRINTS
    // ========================================================
    
    // Instantiate the Login Page Object, passing the live browser 'page' instance into its constructor
    const loginPage = new LoginPage(page);
    
    // Instantiate the Dashboard Page Object to gain access to our sidebar navigation controls
    const dashboardPage = new DashboardPage(page);

    // Instantiate the Users Page Object to control the Users grid and its "Add User" button
    const usersPage = new UsersPage(page);
    
    // Instantiate the Add User Page Object to control input form and operational submission buttons
    const addUserPage = new AddUserPage(page);

    // Generate a unique username/email so this test can be re-run repeatedly without
    // ever colliding with a duplicate left over from a previous run
    const uniqueId = Math.floor(1000 + Math.random() * 9000);

    // Create a data object containing all the text values we will fill into the form fields
    const newUserDetails = {
      username: `tester_${uniqueId}`,
      password: 'SecurePassword123!',    
      firstName: 'Alex',                 
      lastName: 'Smith',                 
      company: 'Hitek QA Solutions',     
      phone: '(605)555-0199',             
      email: `alex.${uniqueId}@example.com`,   
      role: 'Loan Officer'               
    };

    // ========================================================
    // STEP 1: Sign In and Navigate to Dashboard Page
    // ========================================================
    
    // Use the LoginPage action method to direct the browser to the exact LoanApp login page URL
    await loginPage.navigateTo(); 
    
    // Fill out the login form 
    await loginPage.enterCredentials('Athabasca', 'admin', 'otescu0530');

    // Click the sign-in button 
    await loginPage.clickSignIn();

    // Fetch the welcome profile element locator from the dashboard page object
    const welcomeAdminProfile = await dashboardPage.getWelcomeProfile();
    
    // Fetch the specific branch header locator instance from the dashboard page
    const branchHeader = await dashboardPage.getBranchHeader();
    
    // STEP 1 NAVIGATION ASSERTIONS: Verify the profile element contains the text string "Welcome admin" 
    await expect(welcomeAdminProfile).toContainText('Welcome admin', { timeout: 10000 });
    
    // Verify the header "SmartBank Dashboard-'Athabasca' branch" is visible
    await expect(branchHeader).toBeVisible();

    // ========================================================
    // STEP 2: Navigate to Users Page
    // ========================================================
    
    // Click on the 'Users' link in the side menu on Dashboard
    await dashboardPage.goToUsers();

    // Create a text locator to target the specific main title heading
    // NOTE: exact: true is required here because Filament's empty-state heading
    // ("No Users - 'Athabasca' branch") contains this string as a substring,
    // which triggers a strict-mode violation without it.
    const usersPageHeading = page.getByRole('heading', { name: "Users - 'Athabasca' Branch", exact: true });
    
    // STEP 2 NAVIGATION ASSERTION: Verify we successfully navigated to Users page by checking the header "Users - 'Athabasca' Branch"
    await expect(usersPageHeading).toBeVisible();

    // ========================================================
    // STEP 3: Navigate to Add User Page
    // ========================================================
    
    // Locate the blue "Add User" button and click it
    await usersPage.clickAddUser();

    // Fetch the heading locator for Add User Page
    const formHeader = await addUserPage.getPageHeader();
    
    // STEP 3 NAVIGATION ASSERTION: Verify the Add User window loaded by asserting the presence of the header "Add User"
    await expect(formHeader).toBeVisible();

    // ========================================================
    // DATA CREATION: Populate Form and Submit Data
    // ========================================================

    // Call createUser method to populater all fields and click the 'Save' button
    await addUserPage.createUser(newUserDetails);

    // Verify thr temporary confirmation mesage 'Created' appears in the top-right corner
    await expect(page.getByRole('status')).toContainText('Created');
    
    // DYNAMIC LOCATOR DECLARATION: Create a link locator specifically matching the username inside the table cell row
    const newUsernameLink = page.getByRole('link', { name: newUserDetails.username, exact: true });
    
    // FORM ACTION ASSERTION (Part B): Confirm the account (just created user) exists by locating its fresh live link inside the grid
    await expect(newUsernameLink).toBeVisible();

    // ========================================================
    // STEP 4: Navigate from Users Page to Dashboard
    // ========================================================
    
    // Click the 'Dashboard' link in the sidebar menu 
    await dashboardPage.goToDashboard();
    
    // STEP 4 NAVIGATION ASSERTION: Verify navigation backward worked by validating that 'SmartBank Dashboard - \'Athabasca\' branch' is visible again
    await expect(branchHeader).toBeVisible();

    // ========================================================
    // STEP 5: Securely Log Out of the Session
    // ========================================================
    
    // Click the 'Log out' button 
    await dashboardPage.clickLogout();

    // FINAL ASSERTION: Prove session termination by confirming that we are back to Logon screen.
    // We use a text search here to verify that the "Sign in" button is visible to the logged-out user.
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  });


  test('Should edit the user', async ({ page }) => {
    // Instantiate all your Page Objects with the active page context
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    const usersPage = new UsersPage(page);
    const addUserPage = new AddUserPage(page);
    const userFormPage = new UserFormPage(page);

    // Generate a unique username for this test run so it never depends on leftover
    // data from a previous run (e.g. 'tester_99' may have already been renamed away).
    // Kept short (well under 16 chars) since the app appears to enforce a username
    // length limit — a longer name could get silently truncated on save, making the
    // exact-match assertions below fail even though the edit actually succeeded.
    const uniqueId = Math.floor(1000 + Math.random() * 9000);
    const oldUsername = `usr_${uniqueId}`;
    const newUsername = `${oldUsername}_ed`;

    // 1. Navigate to the LoanApp login page
    await loginPage.navigateTo();

    // 2. Enter valid credentials and click the "Sign In" button
    await loginPage.enterCredentials('Athabasca', 'admin', 'otescu0530');
    await loginPage.clickSignIn();

    // Verify successful login via your Dashboard components
    const welcomeProfile = await dashboardPage.getWelcomeProfile();
    await expect(welcomeProfile).toBeVisible({ timeout: 10000 });

    // 3. Navigate to the "Users" section via the Dashboard side menu
    await dashboardPage.goToUsers();

    // Verify we arrived safely on the Users List page
    const usersHeader = await usersPage.getUsersHeader();
    await expect(usersHeader).toBeVisible();

    // 3b. Create the user this test is going to edit, so the test is self-contained
    // and never depends on data left behind by a different test/run
    await usersPage.clickAddUser();
    await addUserPage.createUser({
      username: oldUsername,
      password: 'SecurePassword123!',
      firstName: 'Alex',
      lastName: 'Smith',
      company: 'Hitek QA Solutions',
      phone: '(605)555-0199',
      email: `usr.${uniqueId}@example.com`,
      role: 'Loan Officer'
    });
    await expect(page.getByRole('status')).toContainText('Created');

    // Configure the grid to show all rows (in case the target row is not on the first page)
    await usersPage.showAllRows();

    // 4. Click the "Edit" button associated with the specific user
    await usersPage.clickEditUserLink(oldUsername);
    
    // Verify the dynamic header element from UserFormPage is visible
    const formHeader = await userFormPage.getPageHeader();
    await expect(formHeader).toBeVisible();

    // 5. Modify the username on the Edit User page and click "Save Changes"
    // Using the dedicated update method built into your UserFormPage class
    await userFormPage.updateUserDetails({
      username: newUsername
    });

    // Wait for the Users grid to fully reload after the save redirect before proceeding.
    // Without this, showAllRows() and the row check below can race ahead of the table's
    // re-render (this app uses client-side navigation, so the URL updates before the
    // DOM content has fully refreshed).
    await expect(usersHeader).toBeVisible();

    // Re-expand pagination after the redirect back to the grid — with many test users
    // accumulated across runs, the updated row may not appear on the default first page
    await usersPage.showAllRows();

    // 6. Assert that the updated username appears correctly in the Users grid
    // Ensure the old username string is gone and the updated username row now shows
    // Using exact-match filtering (not a bare substring match) since 'tester_99' would
    // otherwise also match a row for 'tester_99_updated', and vice versa
    const updatedRow = page.getByRole('row').filter({
      has: page.getByRole('link', { name: newUsername, exact: true })
    });
    await expect(updatedRow).toBeVisible();

    const oldRow = page.getByRole('row').filter({
      has: page.getByRole('link', { name: oldUsername, exact: true })
    });
    await expect(oldRow).not.toBeVisible();

    // 7. Navigate back to the Dashboard
    await dashboardPage.goToDashboard();
    const branchHeader = await dashboardPage.getBranchHeader();
    await expect(branchHeader).toBeVisible();

    // 8. Click the "Log out" button to clear the session
    await dashboardPage.clickLogout();

    // Final Assertion: Verify the user was returned to the Login View
    const welcomeBanner = await loginPage.getWelcomeBanner();
    await expect(welcomeBanner).toBeVisible();
  });

  // =========================================================================
  // 🚀 CLEANUP WORKFLOW: LOCATOR CHAINING DELETION
  // =========================================================================
  test('Delete User from the grid', async ({ page }) => {
    // Initialize the specialized Page Objects required for this scenario
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    const usersPage = new UsersPage(page);
    const addUserPage = new AddUserPage(page);

    // Provide the exact username target for this test
    const targetUsername = 'tester_100';

    // Step 1: Handle authentication state entry
    await loginPage.navigateTo();
    await loginPage.enterCredentials('Athabasca', 'admin', 'otescu0530');
    await loginPage.clickSignIn();
    
    // Extract the raw locator handle first so expect can watch it dynamically
    const welcomeProfile = await dashboardPage.getWelcomeProfile();
    await expect(welcomeProfile).toBeVisible({ timeout: 10000 });

    // Step 2: Route directly to the targeted user workspace grid
    await dashboardPage.goToUsers();
    
    // Verify the grid room is loaded securely via our header locator
    const usersHeader = await usersPage.getUsersHeader();
    await expect(usersHeader).toBeVisible();

    // Step 2b: Create the target user first so this test doesn't depend on
    // leftover state from a previous run — makes the test self-contained
    await usersPage.clickAddUser();
    await addUserPage.createUser({
      username: targetUsername,
      password: 'SecurePassword123!',
      firstName: 'Delete',
      lastName: 'Me',
      company: 'Hitek QA Solutions',
      phone: '(605)555-0199',
      email: 'delete.me@example.com',
      role: 'Loan Officer'
    });
    await expect(page.getByRole('status')).toContainText('Created');

    // Step 3: Expand the data viewport to prevent record-hidden pagination bugs
    await usersPage.showAllRows();

    // Step 4: Execute our new method to locate and delete the user
    await usersPage.deleteUser(targetUsername);

    // Step 5: Framework Validation
    // Assert that the specific table row belonging to this user is fully unmounted from the layout tree
    const deletedRow = page.getByRole('row').filter({
      has: page.getByRole('link', { name: targetUsername, exact: true })
    });
    await expect(deletedRow).not.toBeVisible();

    // Final Housekeeping: Return to the dashboard and securely exit the session
    await dashboardPage.goToDashboard();
    await dashboardPage.clickLogout();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  });

});