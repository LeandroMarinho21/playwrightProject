import { expect } from '@playwright/test';
import { Given, When, Then } from './bdd.ts';

const BASE_URL = 'https://ecommerce-playground.lambdatest.io/';

Given('que estou na página inicial da loja', async ({ page }) => {
  await page.goto(BASE_URL);
  await expect(page.getByRole('textbox', { name: 'Search For Products' })).toBeVisible();
  await expect(page.getByRole('button', { name: /^Search$/ })).toBeVisible();
});

When('eu buscar pelo produto {string}', async ({ page }, productName: string) => {
  const searchInput = page.getByRole('textbox', { name: 'Search For Products' });
  await searchInput.fill(productName);
  await page.getByRole('button', { name: /^Search$/ }).click();

  await expect(page).toHaveURL(/route=product(%2F|\/)search/i);
  await expect(page.getByRole('heading', { level: 1, name: new RegExp(productName, 'i') })).toBeVisible();
});

When('eu adicionar o produto {string} ao carrinho', async ({ page }, productName: string) => {
  const productHeading = page.getByRole('heading', { level: 4, name: productName }).first();
  await expect(productHeading).toBeVisible();

  await page.locator('button', { hasText: 'Add to Cart' }).nth(1).click();
});

When('eu acessar o carrinho pela notificação', async ({ page }) => {
  const successAlert = page.getByRole('alert');
  await expect(successAlert).toBeVisible();
  await expect(successAlert).toContainText(/Success/i);

  await successAlert.getByRole('link', { name: 'View Cart' }).click();
  await expect(page).toHaveURL(/route=checkout\/cart/);
});

Then('devo ver o carrinho listando o produto {string} com total {string}', async ({ page }, productName: string, total: string) => {
  const cartHeading = page.getByRole('heading', { level: 1, name: /shopping cart/i });
  await expect(cartHeading).toBeVisible();

  const productRow = page
    .getByRole('row')
    .filter({ has: page.getByRole('link', { name: productName, exact: true }) });
  const targetRow = productRow.last();
  await expect(targetRow).toBeVisible();
  await expect(targetRow).toContainText(total);
});

When('eu removo o produto {string} do carrinho', async ({ page }, productName: string) => {
  const productRow = page
    .getByRole('row')
    .filter({ has: page.getByRole('link', { name: productName, exact: true }) });
  const targetRow = productRow.last();
  await expect(targetRow).toBeVisible();

  await targetRow.locator('button[title="Remove"]').click();
});

Then('devo ver o carrinho vazio', async ({ page }) => {
  const emptyMessage = page.locator('#content').getByText('Your shopping cart is empty!', { exact: true });
  await expect(emptyMessage.first()).toBeVisible();
});

When('eu avanço para o checkout', async ({ page }) => {
  const checkoutLink = page.getByRole('link', { name: /^Checkout$/ }).last();
  await checkoutLink.scrollIntoViewIfNeeded();
  await checkoutLink.click();
});

Then('devo ver um aviso de indisponibilidade no carrinho', async ({ page }) => {
  await expect(
    page.getByText('Products marked with *** are not available in the desired quantity or not in stock!')
  ).toBeVisible();
});

When('eu acessar a página do produto {string}', async ({ page }, productName: string) => {
  await page.getByRole('link', { name: productName, exact: true }).first().click();
  await expect(page.getByRole('heading', { level: 1, name: new RegExp(productName, 'i') })).toBeVisible();
});

When('eu tento adicionar o produto ao carrinho sem escolher opção', async ({ page }) => {
  await page.getByRole('button', { name: /Add to Cart/i }).first().click();
});

Then('devo ver uma mensagem informando que a seleção de opção é obrigatória', async ({ page }) => {
  const inlineError = page.getByText(/required!/i).first();
  await expect(inlineError).toBeVisible();
});

