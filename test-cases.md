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
- Incluir steps de API (`request.newContext`) para consultar carrinho e estoque quando aplicável.

## Cenário 4 – Sincronizar resumo do carrinho via API

- **Objetivo**: Validar que o total e os itens exibidos na UI refletem o payload retornado pelo endpoint de carrinho.
- **Pré-condições**: Carrinho vazio; usuários anônimos mantidos com mesmo contexto de sessão entre UI e API.
- **Passos**:
  1. Executar passos 1 a 5 do Cenário 1 para adicionar o item via UI.
  2. Chamar `GET /cart` (ou endpoint equivalente) com cookies/sessão capturados da mesma execução.
  3. Comparar a resposta JSON (produto, quantidade, subtotal/total) com os valores exibidos na tabela do carrinho.
  4. Opcionalmente remover o item via `DELETE /cart/{id}` e confirmar que a UI reflete o carrinho vazio.
- **Checkpoints sugeridos**:
  - Response code `200` e schema válido.
  - Totais (`subtotal`, `tax`, `total`) iguais nos dois canais.
  - Remoção via API reflete na UI após refresh.

## Cenário 5 – Garantir bloqueio de checkout com estoque insuficiente via API

- **Objetivo**: Reforçar a mensagem de indisponibilidade verificando o estado do carrinho e estoque via endpoints antes de tentar o checkout.
- **Pré-condições**: Carrinho vazio; item com estoque menor que o solicitado.
- **Passos**:
  1. Criar estado via API (`POST /cart`) adicionando item com estoque baixo.
  2. Acessar o carrinho pela UI (pular passos 1-4 do Cenário 1) e validar que o item está marcado com `***`.
  3. Chamar `GET /inventory/{sku}` para confirmar quantidade disponível.
  4. Tentar prosseguir para checkout na UI e capturar o aviso de indisponibilidade.
- **Checkpoints sugeridos**:
  - API retorna `quantityAvailable` menor que a quantidade do carrinho.
  - Aviso `***` exibido na UI.
  - Checkout não navega para `/checkout/checkout` enquanto o estado estiver inconsistente.

## Cenário 6 – Realizar limpeza de estado via API

- **Objetivo**: Garantir independência dos testes removendo resíduos de carrinho e autenticação por chamadas HTTP.
- **Pré-condições**: Sessão ativa com itens ou login de testes.
- **Passos**:
  1. Após cada cenário, executar `DELETE /cart` ou endpoint equivalente para limpar itens.
  2. Se houve login via API, invalidar token (`POST /logout` ou `DELETE /session`).
  3. Confirmar pela UI (reload do carrinho) que o estado foi restaurado para vazio.
- **Checkpoints sugeridos**:
  - Resposta `204`/`200` para operações de limpeza.
  - Carrinho sem itens ao recarregar a página.
  - Nenhum token ativo remanescente (validar via chamada protegida retornar `401`).

## Cenário 7 – Registrar nova conta via My Account

- **Objetivo**: Garantir que um usuário sem conta consegue efetuar cadastro completo pela rota `My Account → Register`.
- **Pré-condições**: Usuário não autenticado; dropdown `My Account` visível no topo.
- **Passos**:
  1. Validar que o cabeçalho apresenta o botão `getByRole('button', { name: 'My Account' })`.
  2. Abrir o menu e clicar em `getByRole('link', { name: 'Register' })`.
  3. Confirmar URL `/index.php?route=account/register` e heading `getByRole('heading', { level: 1, name: 'Create Account' })`.
  4. Preencher campos obrigatórios com dados válidos usando `getByLabel` (`First Name`, `Last Name`, `E-Mail`, `Telephone`, `Password`, `Password Confirm`).
  5. Marcar o checkbox de política `getByRole('checkbox', { name: /Privacy Policy/i })`.
  6. Acionar `getByRole('button', { name: 'Continue' })`.
  7. Verificar redirecionamento para `/index.php?route=account/success` e mensagem `Your Account Has Been Created!` (`getByRole('heading', { name: /Has Been Created/i })`).
- **Checkpoints sugeridos**:
  - Campos exibidos e habilitados antes do preenchimento.
  - Mensagens de validação não aparecem com dados válidos.
  - Página de sucesso carregada com texto confirmando criação.
  - Dropdown `My Account` passa a exibir opções de usuário autenticado (ex.: `Logout`).

## Cenário 8 – Autenticar usuário existente via My Account

- **Objetivo**: Validar login através de credenciais conhecidas pelo menu `My Account`.
- **Pré-condições**: Conta existente (usuário previamente cadastrado) e sessão deslogada.
- **Passos**:
  1. Abrir `My Account` e selecionar `Login` (`getByRole('link', { name: 'Login' })`).
  2. Confirmar heading `Account Login` (`getByRole('heading', { level: 1, name: 'Account Login' })`).
  3. Preencher `E-Mail Address` e `Password` via `getByLabel`.
  4. Acionar `getByRole('button', { name: 'Login' })`.
  5. Validar navegação para `/index.php?route=account/account`.
  6. Confirmar heading `My Account` e presença das seções `My Orders`, `My Affiliate Account`, `Newsletter` (`getByRole('heading', { level: 2, name: /My Orders/i })`, etc.).
- **Checkpoints sugeridos**:
  - Alertas de erro não exibidos com credenciais válidas.
  - Dashboard visível com links de manutenção (`getByRole('link', { name: 'Edit your account information' })`).
  - Dropdown `My Account` passa a expor `Logout`.

## Cenário 9 – Recuperar senha a partir do menu My Account

- **Objetivo**: Validar fluxo de “Forgotten Password” garantindo feedback adequado para e-mail registrado.
- **Pré-condições**: Conta existente com e-mail conhecido; usuário não autenticado.
- **Passos**:
  1. Acessar `Login` via `My Account`.
  2. Selecionar `getByRole('link', { name: 'Forgotten Password' })`.
  3. Confirmar heading `Forgot Your Password?` (`getByRole('heading', { level: 1, name: /Forgot Your Password/i })`).
  4. Preencher `E-Mail Address` com a conta existente (`getByLabel('E-Mail Address')`).
  5. Acionar `getByRole('button', { name: 'Continue' })`.
  6. Validar alerta de sucesso `getByRole('alert')` contendo `An email with a confirmation link has been sent...`.
  7. (Opcional) Repetir com e-mail inexistente e confirmar alerta de erro `Warning: The E-Mail Address was not found...`.
- **Checkpoints sugeridos**:
  - Texto instrucional inicial visível.
  - Alerta de sucesso exibido após submissão válida.
  - No cenário negativo opcional, alerta de erro adequado e permanência na página.

