# language: pt
Funcionalidade: Login
  Como usuário, quero autenticar para acessar a aplicação.

  Cenário: Login válido
    Dado que estou na página de login
    Quando eu informar o usuário "standard_user" e a senha "secret_sauce"
    Então devo ver o título "Products"

