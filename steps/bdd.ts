import { createBdd } from 'playwright-bdd';

// Exporta helpers globais para reutilização nos arquivos de steps e hooks.
export const { Given, When, Then, Before, After } = createBdd();

