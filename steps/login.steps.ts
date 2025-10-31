import { expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.ts';
import { Given, When, Then } from './bdd.ts';

Given('que estou na página de login', async ({ page }) => {
  const lp = new LoginPage(page);
  await lp.goto(); // Navega para a página inicial.
});

When('eu informar o usuário {string} e a senha {string}', async ({ page }, user: string, pass: string) => {
  const lp = new LoginPage(page);
  await lp.login(user, pass); // Executa o fluxo de login.
});

Then('devo ver o título {string}', async ({ page }, titulo: string) => {
  await expect(page.locator('[data-test="title"]')).toHaveText(titulo); // Valida título exibido após login.
});

