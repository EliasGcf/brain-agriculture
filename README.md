# Brain Agriculture

Aplicação full-stack para cadastro e acompanhamento de produtores rurais, fazendas, safras e culturas plantadas.

O projeto contém uma API REST em NestJS e uma aplicação web em React. Os dados são persistidos em PostgreSQL e o frontend consome o contrato OpenAPI da API por meio de endpoints RTK Query gerados.

## Funcionalidades

- Autenticação de usuários internos por JWT em cookie HttpOnly.
- Cadastro, edição, consulta e exclusão de produtores.
- Validação de CPF e CNPJ, com normalização do documento.
- Cadastro, edição, consulta e exclusão de fazendas.
- Validação de áreas em hectares:
  - área total maior que zero;
  - áreas agricultável e de vegetação não negativas;
  - soma das áreas agricultável e de vegetação limitada à área total.
- Cadastro de safras e culturas plantadas por fazenda.
- Dashboard com quantidade de fazendas, total de hectares, hectares por estado, fazendas distintas por cultura e uso do solo.
- Busca e paginação de produtores e fazendas.

## Stack

### Backend

- TypeScript, NestJS e PostgreSQL 17
- Drizzle ORM e Zod
- Jest e Supertest
- Pino para logs HTTP
- Swagger/OpenAPI

### Frontend

- TypeScript e React 19
- React Router
- Redux Toolkit e RTK Query
- React Hook Form e Zod
- Tailwind CSS e shadcn/ui
- Recharts
- Vitest, React Testing Library e MSW

## Estrutura do repositório

```text
apps/
  server/   API NestJS, domínio, casos de uso, persistência e testes E2E
  web/      aplicação React, componentes, páginas, RTK Query e mocks MSW
challenge.md
  especificação original do teste técnico
CONTEXT.md
  vocabulário e regras compartilhadas do domínio
```

## Arquitetura

### Backend

O backend utiliza arquitetura hexagonal (Ports and Adapters), organizada por módulos de negócio. O núcleo da aplicação concentra as regras de domínio e os casos de uso, enquanto as integrações externas são conectadas por adaptadores. Dessa forma, o domínio não depende de HTTP, PostgreSQL, NestJS ou bibliotecas de infraestrutura.

O fluxo principal de uma requisição é:

```text
HTTP request
      ↓
Inbound adapter: HTTP Controller
      ↓
Application core: Use Case
      ↓
Domain core: Entity / Value Object
      ↓
Outbound port: Repository abstraction
      ↓
Outbound adapter: Drizzle repository → PostgreSQL
```

As principais responsabilidades são:

- `src/core`: elementos compartilhados do núcleo, como entidades, value objects, identificadores, erros, eventos e paginação.
- `src/modules/<context>/domain`: entidades, value objects e portas de saída, representadas pelos contratos de repositório. Essa parte não depende de HTTP ou PostgreSQL.
- `src/modules/<context>/application`: casos de uso, DTOs e erros específicos da aplicação. Os casos de uso funcionam como serviços de aplicação e coordenam as operações do sistema.
- `src/infra/http`: adaptadores de entrada HTTP, responsáveis por receber requests, validar schemas, chamar casos de uso e transformar respostas com presenters.
- `src/infra/database/drizzle`: adaptadores de saída, contendo schema PostgreSQL, migrations, mappers e implementações concretas dos repositórios.
- `src/infra/auth`, `src/infra/cryptography`, `src/infra/env` e `src/infra/logger`: adaptadores e configurações para autenticação, criptografia, configuração e observabilidade.
- `test`: adaptadores de teste, como factories e repositórios em memória usados nos testes unitários.

Os módulos de negócio são organizados por contexto: `producers`, `farms`, `metrics` e `auth`. O domínio de fazendas mantém as relações entre produtor, fazenda, safra e cultura; o módulo de métricas consulta os repositórios necessários para produzir os dados agregados do dashboard.

Os casos de uso dependem de portas — abstrações de repositório — e não de implementações concretas. Em produção, essas portas são atendidas por adaptadores Drizzle/PostgreSQL; nos testes unitários, por adaptadores em memória. Isso permite testar regras como validação de documentos, consistência de áreas e restrições de exclusão sem depender do banco.

A validação acontece em camadas complementares: schemas Zod protegem as fronteiras HTTP, entidades e value objects protegem as regras de domínio, e constraints do PostgreSQL fornecem uma última barreira de integridade na persistência. O `JwtAuthGuard` é registrado globalmente, enquanto `/health` e as rotas de login são explicitamente públicas.

### Frontend

O frontend é uma SPA React organizada por páginas, componentes reutilizáveis, estado global e adaptadores de API:

```text
Route
  ↓
Page
  ↓
Feature components
  ↓
RTK Query hooks
  ↓
REST API / MSW
```

As principais responsabilidades são:

- `src/routes.tsx`: composição das rotas públicas e protegidas.
- `src/layouts`: layouts de página, como a estrutura autenticada com sidebar e header.
- `src/pages`: telas e fluxos de negócio, como dashboard, produtores e fazendas.
- `src/pages/*/components`: componentes específicos de cada funcionalidade, incluindo formulários, tabelas e seções de safras/culturas.
- `src/components`: componentes reutilizáveis entre funcionalidades, como guards de autenticação, selects assíncronos, tabelas e feedback de carregamento/erro.
- `src/components/ui`: primitives visuais reutilizáveis baseadas em shadcn/ui e estilizadas com Tailwind CSS.
- `src/store`: store Redux, APIs RTK Query e clientes gerados a partir dos contratos OpenAPI.
- `src/tests` e `tests/mocks`: infraestrutura de testes, MSW e dados mockados.

A composição segue Atomic Design de forma pragmática: primitives de interface ficam em `components/ui`, componentes de interação combinam essas primitives, e as páginas coordenam os fluxos de cada contexto. As regras de dados e chamadas HTTP permanecem fora dos componentes visuais sempre que possível, sendo acessadas por hooks gerados do RTK Query.

O estado remoto é gerenciado pelo Redux Toolkit Query, que encapsula cache, carregamento, erros e mutations da API. O estado de navegação e filtros de listagem é sincronizado com a URL por `nuqs`, permitindo preservar busca e paginação ao navegar.

O `AuthGuard` consulta `/me` antes de renderizar a área autenticada. O cliente HTTP envia credenciais com `credentials: 'include'`, permitindo que o cookie HttpOnly emitido pelo backend seja utilizado sem expor o JWT ao JavaScript da aplicação.

Durante os testes, o MSW intercepta as mesmas chamadas HTTP consumidas pelo RTK Query. Assim, as páginas são testadas através de interações e respostas de rede simuladas, enquanto o contrato de tipos continua vindo do OpenAPI gerado.

## Pré-requisitos

- Bun 1.4.2
- Node.js 24.21.0
- Docker com Docker Compose

As versões esperadas estão declaradas no `package.json` da raiz.

## Configuração local

Instale as dependências na raiz:

```bash
bun install
```

Suba o PostgreSQL:

```bash
docker compose -f apps/server/docker-compose.yml up -d db
```

Crie `apps/server/.env` com:

```dotenv
NODE_ENV="development"
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/app"
JWT_SECRET="change-this-secret"
PORT="3333"
```

Para o frontend, configure `apps/web/.env`:

```dotenv
VITE_API_BASE_URL="http://localhost:3333"
VITE_ENABLE_MSW="false"
```

Execute as migrations e crie o usuário administrativo local:

```bash
bun run --cwd apps/server migration:run
bun run --cwd apps/server db:seed
```

O seed cria ou atualiza o usuário local `admin@admin.com`, com senha `12345678`. Essas credenciais são destinadas somente ao ambiente local.

## Executando a aplicação

Em terminais separados, execute:

```bash
bun run --cwd apps/server start:dev
```

```bash
bun run --cwd apps/web dev
```

Por padrão:

- frontend: <http://localhost:5173>
- API: <http://localhost:3333>
- Swagger: <http://localhost:3333/docs>
- health check: <http://localhost:3333/health>

## Scripts

### Backend

```bash
bun run --cwd apps/server build
bun run --cwd apps/server typecheck
bun run --cwd apps/server lint
bun run --cwd apps/server test
bun run --cwd apps/server test:e2e
bun run --cwd apps/server test:cov
bun run --cwd apps/server migration:run
bun run --cwd apps/server db:seed
```

Os testes E2E precisam de um PostgreSQL configurado pelo `DATABASE_URL` de `apps/server/.env.test`.

### Frontend

```bash
bun run --cwd apps/web build
bun run --cwd apps/web lint
bun run --cwd apps/web test
bun run --cwd apps/web test:watch
```

Para usar MSW durante o desenvolvimento, defina `VITE_ENABLE_MSW=true` em `apps/web/.env`.

## Testes e decisões de tooling

O frontend utiliza Vitest em vez de Jest. Essa escolha foi feita por produtividade: o projeto já utiliza Vite, e o Vitest oferece integração nativa com a configuração do Vite, execução rápida e uma API compatível com o ecossistema adotado. A camada de testes continua usando React Testing Library para validar o comportamento observável dos componentes e páginas.

O backend utiliza Jest, conforme a configuração do NestJS.

Os mocks frontend são fornecidos pelo MSW e permitem testar os fluxos da aplicação sem depender de serviços externos. Os testes backend incluem testes unitários de domínio e casos de uso, além de testes HTTP e de persistência.

## Decisões de interface

O projeto utiliza Tailwind CSS como decisão deliberada de produtividade. A escolha reduz o custo de criação e manutenção de estilos, mantém a composição visual próxima dos componentes e se integra diretamente ao shadcn/ui utilizado no projeto. Por essa razão, não foi adotada uma biblioteca de CSS-in-JS como Styled Components ou Emotion.

## Contrato da API

O contrato OpenAPI está versionado em [`apps/server/openapi.json`](apps/server/openapi.json). O frontend gera seus endpoints RTK Query a partir desse contrato:

```bash
bun run --cwd apps/web generate:api
```

Os principais recursos da API são:

```text
POST/PATCH/DELETE /producers
GET                /producers
GET                /producers/:id

POST/PATCH/DELETE /farms
GET                /farms
GET                /farms/:id

POST/PATCH/DELETE /harvests
GET                /farms/:farmId/harvests

POST/PATCH/DELETE /planted-crops
GET                /harvests/:harvestId/planted-crops

GET /metrics
```

As rotas protegidas exigem o cookie de autenticação gerado por `POST /auth/login`. A rota `/health` é pública.

## Deploy

O backend possui configuração de container em [`apps/server/Dockerfile`](apps/server/Dockerfile) e configuração de deploy em [`apps/server/fly.toml`](apps/server/fly.toml). O deploy executa as migrations durante o release.

Para produção, configure pelo ambiente `DATABASE_URL`, `JWT_SECRET` e `PORT`, e não utilize as credenciais administrativas padrão do desenvolvimento.

## Especificação do desafio

O arquivo [`challenge.md`](challenge.md) contém a especificação original do teste técnico que orienta o escopo funcional e tecnológico deste projeto.
