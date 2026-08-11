import { test, expect } from '@playwright/test'; 

// Go up one folder, then look inside the functions folder 
import { loginToLoanApp, logout } from '../../functions/authFunctions'; 


test('test', async ({ page }) => { 
  // Call the reusable login function 
  await loginToLoanApp(page, 'Athabasca', 'admin', 'otescu0530'); 

  // Call the reusable logout function 
  await logout(page);  
 });