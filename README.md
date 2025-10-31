# Playwright BDD + MCP Starter

## Requisitos
- Node.js 18 ou superior
- Navegadores instalados via Playwright

## Instalação
```bash
npm install
npm run install-browsers
```

## Execução
- `npm run test` → gera os testes com `bddgen` e executa o Playwright em modo headless.
- `npm run test:ui` → executa com a UI interativa do Playwright.
- `npm run report` → abre o relatório HTML gerado na última execução.
- `npx bddgen export` → lista os steps detectados (útil ao gerar cenários assistidos por IA).

### Execução com Docker
```bash
docker build -t pw-bdd .
docker run --rm \
  -v "$PWD/playwright-report:/app/playwright-report" \
  -v "$PWD/test-results:/app/test-results" \
  pw-bdd
```
- A imagem usa `node:18-bullseye`, instala Playwright com `--with-deps` e roda como usuário `node`.
- Variáveis padrão (`CI=1`, `NO_COLOR=1`, `TZ=America/Sao_Paulo`) podem ser sobrescritas com `-e VAR=valor`.
- O relatório HTML ficará disponível em `playwright-report/index.html` na máquina host.

#### Com docker compose
```bash
docker compose build
docker compose up --abort-on-container-exit
```
- Volumes já mapeados para `playwright-report/`, `test-results/` e `.features-gen/`.
- Para executar outro script, utilize `docker compose run --rm tests npm run test:ui`.

### Evidências
- Falhas geram screenshots automáticos (`test-results/`).
- Vídeos são retidos apenas em casos de erro para análise posterior.
- Relatório HTML completo fica em `playwright-report/` (abra com `npm run report`).

## Estrutura
```
features/      → arquivos Gherkin (.feature)
steps/         → definição de steps e hooks em TypeScript
pages/         → page objects simples para reutilização
configs/       → configurações auxiliares (ex.: MCP)
```

Os arquivos gerados automaticamente a partir das features ficam em `.features-gen/` (gitignore por padrão).

## Playwright MCP
O Playwright expõe um servidor MCP (Model Context Protocol) que pode ser consumido por clientes como VS Code, Cursor, Claude Desktop ou outros que suportem MCP.

1. Aponte o cliente MCP para `configs/mcp.json`.  
   - **VS Code (Cline / outras extensões MCP):** adicione o conteúdo do JSON no bloco `mcpServers` da configuração do cliente.  
   - **Claude Desktop:** abra *Settings → MCP Servers* e cole o objeto do arquivo.  
   - **Cursor:** em *Settings → Features → MCP*, importe o JSON ou replique os campos manualmente.

2. Após carregar a configuração, o cliente exibirá ferramentas como:
   - `navigate(url)` para acessar páginas.
   - `click(selector)` e `type(selector, texto)` para interagir.
   - `screenshot()` para capturar evidências.

O servidor MCP é iniciado automaticamente pelo cliente via `npx @playwright/mcp@latest`, sem necessidade de scripts extras.

## Padrões de Código
- Projeto em ESM (`"type": "module"`).
- Steps e hooks com arrow functions tipadas.
- Page objects simples, focados em Playwright puro + `playwright-bdd`.
- Comentários curtos destacando o propósito de trechos específicos.

