import { test, expect } from '@playwright/test';
import { HomePage } from '../pom/home-page';

test.describe('Home Page E2E', () => {
  
  test('should load home page successfully', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto('es');
    
    // Verify basic elements
    await homePage.verifyTitle();
    await expect(homePage.heroSection).toBeVisible();
    await expect(homePage.cvButton).toBeVisible();
  });

  test('should navigate to projects page', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto('es');
    
    // Perform navigation
    await homePage.navigateToProjects();
    
    // Verify URL change
    await expect(page).toHaveURL(/\/es\/projects/);
  });
});
