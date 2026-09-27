# Proto QR Code

Aplicação web open source (MIT) para gerar QR codes, mais uma solução do [Proto Gestão](https://protogestao.com).

## Funcionalidades

- Gera QR codes para **Pix**, **Instagram**, **WiFi**, **Facebook** e **texto** (aba padrão).
- QR code sem fundo (transparente) por padrão, com opção de gerar com fundo.
- Opção de inserir uma **logomarca** no centro do QR code, renderizada em preto e branco.
- Download do QR code como imagem PNG (com ou sem fundo).
- QR codes gerados são **salvos localmente** (localStorage), listados do mais recente para o mais antigo, com **paginação de 50 itens por página** e ações de editar/excluir.
- Rodapé com aviso de direitos reservados e link para o Proto Gestão.

## Tecnologias

- [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org) + [Vite](https://vite.dev)
- [qrcode.react](https://github.com/zpao/qrcode.react) para renderização dos QR codes
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

O critério de aceite da aplicação exige cobertura completa dos testes de integração e de UI, garantindo o CRUD local dos QR codes e que o QR code gerado corresponde exatamente ao que foi configurado.

## Licença

[MIT](LICENSE). Copyright (c) 2026 Proto Gestão.