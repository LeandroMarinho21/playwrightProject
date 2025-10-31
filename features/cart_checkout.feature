# language: pt
Funcionalidade: Fluxos críticos de carrinho e checkout

  Cenário: Buscar produto simples e validar carrinho
    Dado que estou na página inicial da loja
    Quando eu buscar pelo produto "Nikon D300"
    E eu adicionar o produto "Nikon D300" ao carrinho
    E eu acessar o carrinho pela notificação
    Então devo ver o carrinho listando o produto "Nikon D300" com total "$98.00"
    E eu removo o produto "Nikon D300" do carrinho
    Então devo ver o carrinho vazio

  Cenário: Bloqueio de checkout para usuário não autenticado
    Dado que estou na página inicial da loja
    Quando eu buscar pelo produto "Nikon D300"
    E eu adicionar o produto "Nikon D300" ao carrinho
    E eu acessar o carrinho pela notificação
    E eu avanço para o checkout
    Então devo ver um aviso de indisponibilidade no carrinho

  Cenário: Produto com opção obrigatória sem seleção
    Dado que estou na página inicial da loja
    Quando eu buscar pelo produto "Canon EOS 5D"
    E eu acessar a página do produto "Canon EOS 5D"
    E eu tento adicionar o produto ao carrinho sem escolher opção
    Então devo ver uma mensagem informando que a seleção de opção é obrigatória

