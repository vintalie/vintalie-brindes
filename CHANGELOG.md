# CHANGELOG

Todas as mudanças significativas neste projeto serão registradas neste arquivo.

## [Unreleased]
- Planejamento inicial para permitir que o lojista escolha um produto de brinde para a primeira compra do cliente.
- Tarefas definidas no gerenciador de TODOs.

### Integração inicial com MySQL

- Adicionado arquivo de configuração `api/src/config/database.ts` para conectar via `knex` ao MySQL quando `DB_TYPE=mysql`.
- `UserRepository` atualizado para suportar MySQL (com fallback para `lowdb`/`db.json`). Métodos `save` e `findOne` agora suportam operação assíncrona quando MySQL está habilitado.
- Ajustadas chamadas que dependiam de `userRepository.findOne` para lidar com operações assíncronas: `api/src/config/tiendanube-api.client.ts`, `api/src/utils/passaport-strategy.ts`, `api/src/middlewares/check-user-credentials.middleware.ts`, `api/src/features/auth/install-app.service.ts`.
- Observação: é necessário instalar dependências no `api/` com: `yarn add knex mysql2` e definir variáveis de ambiente `DB_TYPE=mysql DB_HOST DB_PORT DB_USER DB_PASSWORD DB_NAME`.

### Gifts: tabela e endpoints CRUD

- `gifts` table criada automaticamente quando `DB_TYPE=mysql` (campos: `id`, `user_id`, `product_id`, `active`, `apply_on_first_order`, `created_at`, `updated_at`).
- Implementado `GiftRepository` (`api/src/repository/GiftRepository.ts`) com suporte a MySQL e fallback em `db.json`.
- Implementado `GiftService` (`api/src/features/gift/gift.service.ts`) e `GiftController` (`api/src/features/gift/gift.controller.ts`).
- Rotas CRUD registradas em `api/src/config/routes.ts` (`GET|POST|PUT|DELETE /gift`) protegidas por JWT/passport.

### Itens ainda pendentes

- Ajustar frontend para permitir que o lojista defina o produto de brinde e ativar/desativar a opção.
- Implementar handler de webhook `order.created` para aplicar o brinde automaticamente quando detectar a primeira compra do cliente.
- Adicionar validações e testes automatizados para o novo fluxo de `gifts`.

### Frontend

- Adicionada página de configuração de brinde: `frontend/src/pages/Gift/Gift.tsx`.
- Adicionado `GiftDataProvider` em `frontend/src/pages/Gift/GiftDataProvider.tsx` que busca produtos e estado do brinde e expõe `onSave`/`onDelete`.
- Rota registrada: `/gift` em `frontend/src/app/Router/Router.tsx` e export em `frontend/src/pages/index.ts`.

### Frontend — melhorias de UI

- Página `Gift` atualizada para usar cards e exibir textos explicativos (`frontend/src/pages/Gift/Gift.tsx`).
- Agora a interface mostra o brinde atual em um card e oferece um card separado para configurar/atualizar o brinde.
- Estados do formulário corrigidos para inicialização a partir do brinde carregado.

### Remoção de Examples

- A página de `Examples` foi removida da navegação e substituída por placeholders nos arquivos fonte para evitar erros de build. Arquivos afetados (frontend):
  - `frontend/src/pages/Examples/` (conteúdo substituído por placeholders)
  - `frontend/src/app/Router/Router.tsx` agora aponta `"/"` para `Gift`.
  - `frontend/src/pages/index.ts` não exporta mais `Examples`.


### Correções

- Corrigido problema de compilação TypeScript:
  - Ajustado `paths` em `api/tsconfig.json` para incluir curingas (`@config/*`, `@repository/*`, etc.), permitindo importar `@config/database` e outros módulos.
  - Tratamento de erros `unknown` atualizado para `any` nos logs (`api/src/repository/UserRepository.ts`, `api/src/config/database.ts`) para resolver `TS18046`.

  ### Webhook e elegibilidade

  - Adicionado endpoint público de webhook: `POST /webhooks/order` em `api/src/config/routes.ts` — espera receber o payload de `order.created` e o header `x-store-id` com `user_id` da loja.
  - Implementado `EligibleRepository`, `EligibleService` e `webhook.handler` para marcar clientes elegíveis quando detectada a primeira compra (`api/src/repository/EligibleRepository.ts`, `api/src/features/eligible/*`).
  - Adicionado endpoint protegido `GET /gift/eligible` que retorna o brinde ativo para um cliente elegível.




### Mapeamento de Pontos de Integração (inicial)

- Backend:
  - Cliente HTTP: `api/src/config/tiendanube-api.client.ts` e `api/src/config/tiendanube-auth.client.ts` — responsáveis por chamadas à API Nuvemshop/Tiendanube.
  - Repositório temporário: `api/src/repository/UserRepository.ts` (lowdb `db.json`) — armazena credenciais por `user_id`.
  - Endpoints de produto: `api/src/features/product/product.controller.ts` e `product.service.ts` — exemplo de uso da API de produtos.
  - Middlewares e autenticação: `api/src/utils/passaport-strategy.ts`, `api/src/middlewares/*` — verificam credenciais e injetam `user` nas requisições.
  - Observação: não foi encontrado um handler explícito para webhooks de `orders` — será necessário adicionar suporte a webhooks (`order.created`) ou implementar polling da API de `orders`.

- Persistência / Dados:
  - `api/db.json` contém `credentials` e é usado como banco temporário; precisamos estender para armazenar a configuração de `gift` por `user_id`.

- Frontend:
  - Clientes/Fluxos relevantes: `frontend/src/app/NexoClient`, `NexoSyncRoute` e `Axios` — pontos onde comunicações externas e sincronizações acontecem.
  - UI de loja: não existe atualmente uma tela específica para o lojista escolher brindes; será necessário criar uma rota/componente para gerenciar `gift` por loja.

- Escopos / Permissões:
  - `api/db.json` (ex.: scope) já inclui `read_orders`/`write_discounts`/`read_customers` etc.; valide que a app tem permissão para criar rascunhos, adicionar itens ou aplicar descontos.


<!-- Registre entradas ao implementar: data, autor, mudanças -->


# CHANGELOG

Todas as mudanças significativas neste projeto serão registradas neste arquivo.

## [Unreleased]
- Planejamento inicial para permitir que o lojista escolha um produto de brinde para a primeira compra do cliente.
- Tarefas definidas no gerenciador de TODOs.

<!-- Registre entradas ao implementar: data, autor, mudanças -->
