import { test, expect, Page } from '@playwright/test'; 

// --- REUSABLE LOGIN FUNCTION --- 
async function loginToLoanApp(page: Page, branch: string, user: string, pass: string) { 

  // Navigate to the Login Application Area 
  await page.goto('https://qa.hitekschool.com/lms/3108/login'); 

  // Enter credentials 
  await page.getByLabel('Branch Name*').fill(branch); 
  await page.getByLabel('User Name*').fill(user); 
  await page.getByLabel('Password*').fill(pass); 

  // Click Sign in button 
  await page.getByRole('button', { name: 'Sign in' }).click(); 

  // Assertion to validate successful login banner 
  await expect(page.getByRole('main')).toContainText(`Welcome ${user}`); 
} 

// --- REUSABLE LOGOUT FUNCTION --- 
async function logout(page: Page) { 

  // Click Logout button 
  await page.getByRole('button', { name: 'Log out' }).click(); 

  // Assertion to validate successful logout 
  await expect(page.getByRole('heading')).toContainText('Sign in to your Branch account'); 
} 


test('test', async ({ page }) => { 

  // Call the reusable login function 
  await loginToLoanApp(page, 'Athabasca', 'admin', 'otescu0530'); 

  // Call the reusable logout function 
  await logout(page); 
 });