import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  paths: ['features/**/*.feature'],
  require: ['steps/**/*.ts'],
  outputDir: '.features-gen' // Diretório com specs gerados automaticamente.
});

export default defineConfig({
  testDir,
  reporter: [
    ['list'],
    ['html', { open: 'never' }]
  ],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure', // Captura evidência visual automaticamente.
    video: 'retain-on-failure' // Retém vídeo apenas quando o teste falha.
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
});

