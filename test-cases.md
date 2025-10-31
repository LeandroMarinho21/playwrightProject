# Test Cases – Phase 2 Candidates

Documenta os fluxos mapeados durante a exploração manual para guiar a implementação automatizada na Fase 2. Cada cenário inclui pré-condições, passos sequenciais e checkpoints sugeridos para asserções em Playwright.

## Cenário 1 – Buscar produto simples e validar carrinho

- **Objetivo**: Garantir que o usuário consiga localizar um produto sem opções obrigatórias, adicioná-lo ao carrinho e validar o resumo.
- **Pré-condições**: Carrinho vazio (`Your shopping cart is empty!`). Página inicial carregada.
- **Passos**:
  1. Validar que o cabeçalho apresenta caixa de busca `getByRole('textbox', { name: 'Search For Products' })` e botão `getByRole('button', { name: 'Search' })`.
  2. Informar "Nikon D300" e acionar `Search`.
  3. Confirmar URL contendo `route=product/search` e `heading level=1` com texto `Search - Nikon D300`.
  4. Localizar card listado com `getByRole('heading', { name: 'Nikon D300' })` e acionar `getByRole('button', { name: 'Add to Cart' })` correspondente.
  5. Capturar alerta de sucesso (`role="alert"`) e clicar em `View Cart`.
  6. Na página do carrinho, validar tabela com produto, preço `$98.00`, quantidade `1` e total `$98.00`.
  7. Remover o item via botão `getByRole('button', { name: 'Remove' })` e confirmar retorno da mensagem `Your shopping cart is empty!`.
- **Checkpoints sugeridos**:
  - Estado inicial do carrinho vazio antes da busca.
  - Alerta de sucesso após adicionar ao carrinho.
  - Totais do carrinho atualizados para `$98.00`.
  - Estado final com carrinho vazio após remoção.

## Cenário 2 – Checkout bloqueado por item indisponível

- **Objetivo**: Garantir que o carrinho sinalize indisponibilidade e impeça o checkout quando o item não tem estoque suficiente.
- **Pré-condições**: Carrinho vazio inicialmente.
- **Passos**:
  1. Executar passos 1 a 6 do Cenário 1 para garantir item no carrinho.
  2. Acionar `Checkout` pela página do carrinho (`getByRole('link', { name: 'Checkout' })`).
  3. Validar que permanece na página do carrinho e que o aviso `Products marked with *** are not available in the desired quantity or not in stock!` é exibido.
- **Checkpoints sugeridos**:
  - Confirmação do item no carrinho antes do checkout.
  - Mensagem de indisponibilidade exibida após tentar prosseguir.
  - Garantir que não ocorra navegação para outra página enquanto houver itens `***`.

## Cenário 3 – Produto com opção obrigatória (falha controlada)

- **Objetivo**: Garantir que o site exibe mensagem de erro ao tentar adicionar produto com variação obrigatória sem selecioná-la.
- **Pré-condições**: Carrinho vazio.
- **Passos**:
  1. A partir da home, navegar até o produto `Canon EOS 5D` (via busca `getByRole('textbox', { name: 'Search For Products' })` → "Canon EOS 5D" → `Search`).
  2. Confirmar presença do seletor de opções (`getByRole('combobox', { name: 'Select' })` ou `select[name='option[217]']`).
  3. Tentativa de acionar `getByRole('button', { name: 'Add to Cart' })` sem escolher cor.
  4. Validar exibição de alerta de erro (`role="alert"`) com texto indicando seleção obrigatória.
- **Checkpoints sugeridos**:
  - Estado inicial sem itens no carrinho.
  - Detecção do seletor obrigatório e ausência de seleção prévia.
  - Mensagem de erro após tentativa inválida.

---

### Próximos Passos para Implementação

- Converter cada cenário em feature BDD (`features/checkout.feature`, por exemplo) e steps correspondentes em `steps/checkout.steps.ts`.
- Reutilizar locators baseados em roles/labels identificados acima.
- Garantir independência dos cenários limpando o carrinho ao final ou reiniciando estado via `Given`.
- Registrar evidências (screenshot/video) já configuradas em `playwright.config.ts` ao executar os testes.

