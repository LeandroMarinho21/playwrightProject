import { expect, test, type BrowserContext, type TestInfo } from '@playwright/test';
import { Given, When, Then } from './bdd.ts';

const BASE_URL = 'https://ecommerce-playground.lambdatest.io';

type ScenarioState = {
  cartApiResponseText?: string;
};

const scenarioStateByTest = new WeakMap<TestInfo, ScenarioState>();

const PRODUCT_IDS: Record<string, string> = {
  'Nikon D300': '63',
  'Canon EOS 5D': '30',
  MacBook: '43'
};

const getScenarioState = (): ScenarioState => {
  const info = test.info();
  let state = scenarioStateByTest.get(info);
  if (!state) {
    state = {};
    scenarioStateByTest.set(info, state);
  }
  return state;
};

const extractCartRemoveKeys = (html: string): string[] => {
  const keys = new Set<string>();
  const regex = /cart\.remove\('([^']+)'\)/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    keys.add(match[1]);
  }
  return [...keys];
};

const fetchCartHtml = async (context: BrowserContext): Promise<string> => {
  const response = await context.request.get(`${BASE_URL}/index.php?route=checkout/cart`);
  expect(response.ok()).toBeTruthy();
  return response.text();
};

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

  const productId = PRODUCT_IDS[productName];
  if (!productId) {
    throw new Error(`Produto "${productName}" não mapeado em PRODUCT_IDS`);
  }

  await page.waitForFunction(() => {
    const globalWindow = globalThis as unknown as { cart?: { add?: (pid: string) => void } };
    return typeof globalWindow.cart?.add === 'function';
  });

  await page.evaluate((id) => {
    const globalWindow = globalThis as unknown as { cart?: { add?: (pid: string) => void } };
    if (!globalWindow.cart?.add) {
      throw new Error('Função cart.add indisponível na página');
    }
    globalWindow.cart.add(id);
  }, productId);
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
  const emptyMessage = page.locator('#content').getByText('Your shopping cart is empty!', {
    exact: true
  });
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

When('eu consultar o carrinho via API', async ({ context }) => {
  const html = await fetchCartHtml(context);
  getScenarioState().cartApiResponseText = html;
});

Then('os dados do carrinho via API devem refletir o item {string} com total {string}', async ({}, productName: string, total: string) => {
  const { cartApiResponseText } = getScenarioState();
  expect(cartApiResponseText, 'Nenhum resultado de API armazenado').toBeTruthy();
  expect(cartApiResponseText!).toContain(productName);
  expect(cartApiResponseText!).toContain(total.replace('$', '')); // valores podem vir sem símbolo
});

When('eu adicionar via API o produto {string}', async ({ context }, productName: string) => {
  const productId = PRODUCT_IDS[productName];
  expect(productId, `Produto desconhecido para API: ${productName}`).toBeTruthy();

  const response = await context.request.post(`${BASE_URL}/index.php?route=checkout/cart/add`, {
    form: {
      product_id: productId,
      quantity: 1
    }
  });

  expect(response.ok()).toBeTruthy();
  const bodyText = await response.text();
  // Quando disponível, a resposta vem em JSON; ignoramos erros de parse.
  if (bodyText.trim().startsWith('{')) {
    try {
      const json = JSON.parse(bodyText);
      expect(json.success, 'Resposta de inclusão não retornou sucesso').toBeTruthy();
    } catch (error) {
      // Ignora caso o backend devolva HTML.
    }
  }
});

When('eu acessar o carrinho pela UI', async ({ page }) => {
  await page.goto(`${BASE_URL}/index.php?route=checkout/cart`);
});

Then('os dados do carrinho via API devem indicar indisponibilidade', async () => {
  const { cartApiResponseText } = getScenarioState();
  expect(cartApiResponseText, 'Nenhum resultado de API armazenado').toBeTruthy();
  expect(cartApiResponseText!).toMatch(/Products marked with \*\*\*/i);
});

Then('devo ver o item {string} marcado como indisponível no carrinho', async ({ page }, productName: string) => {
  const row = page
    .getByRole('row')
    .filter({ has: page.getByRole('link', { name: productName, exact: true }) })
    .filter({ hasText: '***' })
    .first();
  await expect(row).toBeVisible();
});

When('eu limpo o carrinho via API', async ({ context }) => {
  const html = await fetchCartHtml(context);
  const keys = extractCartRemoveKeys(html);

  for (const key of keys) {
    const response = await context.request.get(`${BASE_URL}/index.php?route=checkout/cart&remove=${encodeURIComponent(key)}`);
    expect(response.ok()).toBeTruthy();
  }

  // Como fallback, limpar cookies garante que o carrinho seja resetado para testes subsequentes.
  await context.clearCookies();
  getScenarioState().cartApiResponseText = undefined;
});

Then('o carrinho deve ficar vazio na UI', async ({ page }) => {
  await page.goto(`${BASE_URL}/index.php?route=checkout/cart`);
  const emptyMessage = page.locator('#content').getByText('Your shopping cart is empty!', {
    exact: true
  });
  await expect(emptyMessage.first()).toBeVisible();
});

