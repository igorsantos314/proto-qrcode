# Proposal

## Why

O projeto nasceu como um gerador standalone de QR codes e não atende ao fluxo de trabalho de uma gravadora laser, que precisa transformar material, tempo de máquina e custos indiretos em um orçamento confiável e reutilizável. Ao mesmo tempo, a geração de QR codes continua útil para o negócio (Pix, redes sociais, Wi-Fi). A oportunidade é evoluir o produto para **LaserGest**, um sistema de gestão para gravadoras laser que mantém os QR codes e adiciona um módulo completo de orçamentos.

## What Changes

- Renomear e reposicionar o produto como **LaserGest**, com identidade voltada a gestão de gravadoras laser.
- Adicionar navegação entre duas seções/routes distintas:
  - **QR Code**: gerador existente, preservado como está.
  - **Orçamentos**: novo módulo de registro e cálculo de orçamentos.
- Criar cadastro de orçamento com campos parametrizados: tipo de material, custo do material por área (R$/m²), largura e altura da peça (mm), quantidade de peças, tempo de gravação por peça, custos adicionais (descrição e valor), custos de parâmetros reutilizáveis, depreciação da máquina (R$/h) e margem de lucro/preço de venda editáveis de forma bidirecional.
- Calcular automaticamente área da peça, custo de material, custo da máquina por hora (consumo × custo de kWh + depreciação), custo total, custo por unidade e preço de venda.
- Criar uma seção de **parâmetros reutilizáveis** para preços e taxas usados nos orçamentos: verniz, produto de limpeza, custo de kWh, consumo da máquina por hora ligada, depreciação e margem padrão, entre outros.
- Persistir orçamentos em cache local (localStorage) e permitir listar, carregar, editar e excluir.
- Exportar cada orçamento salvo como planilha **.xlsx**, contendo entradas, memória de cálculo e totais.
- **BREAKING**: o nome exibido do produto deixa de ser "Proto QR Code" e passa a ser "LaserGest"; a tela inicial continua sendo o gerador de QR codes, agora acessível pela seção "QR Code".

## Capabilities

### New Capabilities

- `budget-management`: criação, cálculo, cache local, edição, exclusão e exportação .xlsx de orçamentos de gravação laser.
- `reusable-parameters`: cadastro e persistência de parâmetros reutilizáveis (preços, consumo, custo de energia, depreciação e margem padrão) usados no preenchimento e cálculo dos orçamentos.

### Modified Capabilities

- `app-layout`: o shell do produto passa a se chamar LaserGest e ganha navegação entre as seções "QR Code" e "Orçamentos", mantendo o gerador como tela inicial.

## Impact

- **Branding**: nome do produto, título da página, app bar e textos de rodapé/atribuição passam a referenciar LaserGest.
- **Navegação**: inclusão de rotas/seções (`/` para QR Code e `/orcamentos` para orçamentos) e de um componente de navegação no shell.
- **Novo domínio**: componentes de formulário, lista e detalhe de orçamento; biblioteca de cálculo; validações; estado de orçamentos.
- **Persistência**: novas chaves de localStorage para orçamentos e parâmetros reutilizáveis, sem alterar a chave existente de QR codes salvos.
- **Dependências**: inclusão de uma biblioteca de geração de .xlsx (SheetJS) no cliente.
- **Código existente**: `App.tsx` e o layout atual são reorganizados; toda a funcionalidade de geração, salvamento e exportação de QR codes existente permanece disponível.
