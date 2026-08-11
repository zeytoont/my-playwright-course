import { test, expect } from '@playwright/test'; // 'expect' is imported here instead!
import { LoginPage } from '../../pages/LoginPage'; 

test('User can successfully log in using Page Object Model', async ({ page }) => {
  const loginPage = new LoginPage(page); 

  await loginPage.navigateTo();
  await loginPage.enterCredentials('Athabasca', 'admin', 'otescu0530');
  await loginPage.clickSignIn();
  
  // 1. Ask the page object for the locator element
  const banner = await loginPage.getWelcomeBanner();

  // 2. Perform the assertion directly in the test script
  await expect(banner).toContainText('Welcome admin');
});