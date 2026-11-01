# LaserGest

Aplicação web open source (MIT) de gestão para gravadoras laser, com geração de QR codes e orçamentos de gravação. Mais uma solução do [Proto Gestão](https://protogestao.com).

## Funcionalidades

### QR Code

- Gera QR codes para **Pix**, **Instagram**, **WiFi**, **Facebook** e **texto** (aba padrão).
- QR code sem fundo (transparente) por padrão, com opção de gerar com fundo.
- Opção de inserir uma **logomarca** no centro do QR code, renderizada em preto e branco.
- Download do QR code como imagem PNG (com ou sem fundo).
- QR codes gerados são **salvos localmente** (localStorage), listados do mais recente para o mais antigo, com **paginação de 50 itens por página** e ações de editar/excluir.
- Rodapé com aviso de direitos reservados e link para o Proto Gestão.
- Borda preta configurável e cantos arredondados com raio ajustável.
- Exportação do PNG em 1000 × 1000.

### Orçamentos

- Cadastro de orçamentos com tipo de material, custo por m², dimensões em mm, quantidade, tempo de gravação, custo de energia, consumo da máquina, depreciação e custos adicionais.
- Cálculo automático de área, custo de material, custo da máquina, custo total e custo por unidade.
- Margem de lucro e preço de venda editáveis de forma bidirecional.
- Parâmetros reutilizáveis (verniz, produto de limpeza, custo de kWh, consumo da máquina, depreciação e margem padrão) persistidos no navegador.
- Orçamentos salvos em cache local com edição, exclusão e exportação individual para planilha `.xlsx`.

## Tecnologias

- [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org) + [Vite](https://vite.dev)
- [qrcode.react](https://github.com/zpao/qrcode.react) para renderização dos QR codes
- [React Router](https://reactrouter.com) para navegação entre as seções
- [SheetJS](https://sheetjs.com) para exportação das planilhas `.xlsx`
- [Vitest](https://vitest.dev) + [React Testing Library](https://testing-library.com/react) para testes unitários e de integração
- [Playwright](https://playwright.dev) + [jsqr](https://github.com/cozmo/jsQR) para testes de UI/E2E (incluindo a verificação de que o QR code decodifica para o conteúdo configurado)

## Como rodar

```bash
npm install
npm run dev       # servidor de desenvolvimento
npm run build     # build de produção
npm run preview   # pré-visualiza o build
```

## Testes

```bash
npm test              # testes unitários e de integração (Vitest)
npm run test:coverage # testes com relatório de cobertura
npm run test:e2e      # testes de UI/E2E (Playwright, Chromium)
npm run test:all      # todas as suítes
```

O critério de aceite da aplicação exige cobertura dos testes de integração e de UI, garantindo o CRUD local dos QR codes e dos orçamentos, os cálculos de custo e preço, a persistência no navegador e a exportação `.xlsx`.

## Licença

[MIT](LICENSE). Copyright (c) 2026 Proto Gestão.