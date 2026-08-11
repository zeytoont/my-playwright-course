import { test, expect } from '@playwright/test'; 

test('test', async ({ page }) => { 
  await page.goto('https://qa.hitekschool.com/lms/3108/login'); 
  await page.getByRole('textbox', { name: 'Branch Name*' }).click(); 
  await page.getByRole('textbox', { name: 'Branch Name*' }).fill('Athabasca'); 
  await page.getByRole('textbox', { name: 'User Name*' }).click(); 
  await page.getByRole('textbox', { name: 'User Name*' }).fill('admin'); 
  await page.getByRole('textbox', { name: 'Password*' }).click(); 
  await page.getByRole('textbox', { name: 'Password*' }).fill('otescu0530'); 
  await page.getByRole('button', { name: 'Sign in' }).click(); 
  await page.getByRole('button', { name: 'Log out' }).click(); 
});

