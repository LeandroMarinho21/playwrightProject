import { expect, test, type APIRequestContext, type TestInfo } from '@playwright/test';
import { Given, When, Then } from './bdd.ts';

const BASE_URL = 'https://ecommerce-playground.lambdatest.io';

type UserCredentials = {
  firstName: string;
  lastName: string;
  email: string;
  telephone: string;
  password: string;
};

type ScenarioState = {
  user?: UserCredentials;
};

const scenarioState = new WeakMap<TestInfo, ScenarioState>();

const getScenarioState = (): ScenarioState => {
  const info = test.info();
  let state = scenarioState.get(info);
  if (!state) {
    state = {};
    scenarioState.set(info, state);
  }
  return state;
};

const generateUser = (): UserCredentials => {
  const unique = Date.now();
  return {
    firstName: 'Playwright',
    lastName: 'Tester',
    email: `pw.mcp+${unique}@example.com`,
    telephone: '11999998888',
    password: `Pw!${unique}`
  };
};

const registerUserViaApi = async (credentials: UserCredentials, request: APIRequestContext) => {
  const response = await request.post(`${BASE_URL}/index.php?route=account/register`, {
    form: {
      firstname: credentials.firstName,
      lastname: credentials.lastName,
      email: credentials.email,
      telephone: credentials.telephone,
      password: credentials.password,
      confirm: credentials.password,
      newsletter: '0',
      agree: '1'
    }
  });

  expect(response.ok(), 'Falha ao criar usuário via API').toBeTruthy();
};

When('eu acesso o menu My Account e escolho {string}', async ({ page }, option: string) => {
  await page.getByRole('button', { name: 'My Account' }).click();
  await page.getByRole('link', { name: option }).click();
});

When('eu preencho o formulário de registro com dados válidos', async ({ page }) => {
  const state = getScenarioState();
  if (!state.user) {
    state.user = generateUser();
  }

  const { firstName, lastName, email, telephone, password } = state.user;

  await page.getByLabel('First Name').fill(firstName);
  await page.getByLabel('Last Name').fill(lastName);
  await page.getByLabel('E-Mail').fill(email);
  await page.getByLabel('Telephone').fill(telephone);
  await page.getByLabel('Password').fill(password);
  await page.getByLabel('Password Confirm').fill(password);
  await page.getByRole('checkbox', { name: /Privacy Policy/i }).check();
});

When('eu confirmo a criação da conta', async ({ page }) => {
  await page.getByRole('button', { name: 'Continue' }).click();
});

Then('devo ver a mensagem de sucesso de conta criada', async ({ page }) => {
  await expect(page).toHaveURL(/route=account\/success/i);
  await expect(page.getByRole('heading', { level: 1, name: /Has Been Created/i })).toBeVisible();
  await page.getByRole('link', { name: 'Continue' }).click();
  await expect(page).toHaveURL(/route=account\/account/i);
});

Then('o menu My Account deve exibir a opção {string}', async ({ page }, option: string) => {
  await page.getByRole('button', { name: 'My Account' }).click();
  await expect(page.getByRole('link', { name: option })).toBeVisible();
});

Then('eu finalizo a sessão atual', async ({ page }) => {
  await page.getByRole('link', { name: 'Logout' }).click();
  await expect(page).toHaveURL(/route=account\/logout/i);
  await page.getByRole('link', { name: 'Continue' }).click();
  await expect(page).toHaveURL(/route=common\/home/i);
});

Given('que existe um usuário cadastrado previamente', async ({ context }) => {
  const state = getScenarioState();
  const credentials = generateUser();
  state.user = credentials;
  await registerUserViaApi(credentials, test.info().request);
  await context.clearCookies();
});

When('eu informo as credenciais desse usuário', async ({ page }) => {
  const state = getScenarioState();
  expect(state.user, 'Usuário não inicializado').toBeDefined();
  const { email, password } = state.user!;

  await page.getByLabel('E-Mail Address').fill(email);
  await page.getByLabel('Password').fill(password);
});

When('eu confirmo o login', async ({ page }) => {
  await page.getByRole('button', { name: 'Login' }).click();
});

Then('devo ver o painel principal de My Account', async ({ page }) => {
  await expect(page).toHaveURL(/route=account\/account/i);
  await expect(page.getByRole('heading', { level: 1, name: 'My Account' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: /My Orders/i })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: /My Affiliate Account/i })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: /Newsletter/i })).toBeVisible();
});

When('eu acesso a opção Forgotten Password pelo menu My Account', async ({ page }) => {
  await page.getByRole('button', { name: 'My Account' }).click();
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('link', { name: 'Forgotten Password' }).click();
});

When('eu solicito redefinição de senha para o e-mail cadastrado', async ({ page }) => {
  const state = getScenarioState();
  expect(state.user, 'Usuário não inicializado').toBeDefined();
  const { email } = state.user!;

  await expect(page.getByRole('heading', { level: 1, name: /Forgot Your Password/i })).toBeVisible();
  await page.getByLabel('E-Mail Address').fill(email);
  await page.getByRole('button', { name: 'Continue' }).click();
});

Then('devo ver a mensagem de confirmação de envio de redefinição', async ({ page }) => {
  const alert = page.getByRole('alert');
  await expect(alert).toBeVisible();
  await expect(alert).toContainText('An email with a confirmation link has been sent');
});

