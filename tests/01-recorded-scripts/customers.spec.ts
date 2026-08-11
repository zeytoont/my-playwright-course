import { test, expect } from '@playwright/test';

// Go up two folders (tests/01-recorded-scripts -> tests -> root), then look inside the functions folder
import { loginToLoanApp, logout, fillAddCustomerFields } from '../../functions/authFunctions';

const testCases = [
  { account: '1234567', firstName: 'Good', lastName: 'Will', title: 'Mr.' },
  { account: '2345678', firstName: 'June', lastName: 'Smith', title: 'Mrs.' },
  { account: '3456790', firstName: 'Johanna', lastName: 'Carpenter', title: 'Miss' },
  { account: '4567901', firstName: 'Linda', lastName: 'Johnson', title: 'Ms.' },
  { account: '5679012', firstName: 'Olga', lastName: 'Steveston', title: 'Ms.' }
];

testCases.forEach(({ account, firstName, lastName, title }) => {
  test(`Add Customer valid input - Title: ${title} - ${lastName}`, async ({ page }) => {
    await loginToLoanApp(page, 'Athabasca', 'admin', 'otescu0530');
    await page.getByRole('link', { name: 'Customers' }).click();
    await page.getByRole('link', { name: 'Add Customer' }).click();
    await fillAddCustomerFields(page, account, title, firstName, lastName);
    await expect(page.getByRole('link', { name: account })).toBeVisible();
    await page.getByRole('link', { name: 'Dashboard' }).click();
    await logout(page);
  });
});

testCases.forEach(({ account, lastName, title }) => {

  test(`Delete Customer workflow - Title: ${title} - ${lastName}`, async ({ page }) => {

    // Call the reusable login function
    await loginToLoanApp(page, 'Athabasca', 'admin', 'otescu0530');

    // Click the Customers link
    await page.getByRole('link', { name: 'Customers' }).click();

    // Click the customer we want to delete
    await page.getByRole('link', { name: account }).click();

    // Click Delete button
    await page.getByRole('button', { name: 'Delete' }).click();

    // Confirm the deletion
    await page.getByRole('button', { name: 'Yes, delete it' }).click();

    // Verify that the deleted customer's account link is no longer visible
    await expect(page.getByRole('link', { name: account })).not.toBeVisible();

    // Call the reusable logout function
    await logout(page);

  });

});