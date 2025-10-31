FROM node:18-bullseye

WORKDIR /app

# Copia apenas arquivos de manifesto para aproveitar cache de dependências.
COPY package*.json ./

RUN npm install && npm cache clean --force

# Copia o restante do código (excluindo paths definidos em .dockerignore).
COPY . .

# Instala navegadores e dependências de sistema necessárias.
RUN npx playwright install --with-deps

# Ajusta permissões para executar como usuário não-root.
RUN chown -R node:node /app

USER node

# Garante que os navegadores estejam disponíveis também para o usuário node.
RUN npx playwright install

ENV CI=1 \
    NO_COLOR=1 \
    TZ=America/Sao_Paulo

# Volume para relatórios (pode ser mapeado externamente).
VOLUME ["/app/playwright-report", "/app/test-results"]

CMD ["npm", "run", "test"]

