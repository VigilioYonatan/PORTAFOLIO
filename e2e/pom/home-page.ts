import { type Locator, type Page, expect } from '@playwright/test';

export class HomePage {
    readonly page: Page;
    readonly explorerButton: Locator;
    readonly cvButton: Locator;
    readonly experienceSection: Locator;
    readonly heroSection: Locator;

    constructor(page: Page) {
        this.page = page;
        // Best practice: Use user-facing locators
        // Assuming 'es' locale for the test, but we can make it dynamic
        this.explorerButton = page.getByRole('link', { name: /Explurar|Explorer|Explorar/i }).first();
        this.cvButton = page.getByRole('link', { name: /CV/i }).first();
        this.experienceSection = page.locator('#experience-section');
        this.heroSection = page.locator('section').first();
    }

    async goto(locale: string = 'es') {
        await this.page.goto(`/${locale}`);
    }

    async verifyTitle() {
        // Basic check to ensure we are on the right page
        await expect(this.page).toHaveTitle(/Vigilio|Portfolio|Desarrollador/i);
    }

    async navigateToProjects() {
        await this.explorerButton.click();
    }
}
