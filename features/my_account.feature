# language: pt
Funcionalidade: Fluxos do menu My Account

  Contexto:
    Dado que estou na página inicial da loja

  Cenário: Registrar nova conta via My Account
    Quando eu acesso o menu My Account e escolho "Register"
    E eu preencho o formulário de registro com dados válidos
    E eu confirmo a criação da conta
    Então devo ver a mensagem de sucesso de conta criada
    E o menu My Account deve exibir a opção "Logout"
    E eu finalizo a sessão atual

  Cenário: Autenticar usuário existente via My Account
    Dado que existe um usuário cadastrado previamente
    Quando eu acesso o menu My Account e escolho "Login"
    E eu informo as credenciais desse usuário
    E eu confirmo o login
    Então devo ver o painel principal de My Account
    E o menu My Account deve exibir a opção "Logout"
    E eu finalizo a sessão atual

  Cenário: Recuperar senha de usuário existente via My Account
    Dado que existe um usuário cadastrado previamente
    Quando eu acesso a opção Forgotten Password pelo menu My Account
    E eu solicito redefinição de senha para o e-mail cadastrado
    Então devo ver a mensagem de confirmação de envio de redefinição

