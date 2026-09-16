# Unified Producer Search Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the separate producer `name` and `document` list filters with one `search` field that matches either producer name or document.

**Architecture:** The HTTP query, application use case, domain repository contract, Drizzle repository, in-memory repository, OpenAPI-generated client, MSW handlers, producer list page, and async producer select will all use `search?: string`. The repository will implement the OR semantics: case-insensitive partial matching against `name` or the normalized document value. The frontend will submit and persist one search value without deciding whether it is a name or document.

**Tech Stack:** NestJS, Zod, Drizzle ORM/PostgreSQL, TypeScript, React, RTK Query OpenAPI codegen, MSW, Vitest/Jest.

**Spec:** `docs/superpowers/specs/2026-09-11-backend-scope.md`, especially the producer listing requirement: “busca por nome ou documento”. The current request resolves the previously deferred detailed query contract.

## Global Constraints

- Keep the public query parameter named `search` and optional.
- Matching is partial and case-insensitive for producer names.
- Matching is partial against the normalized document value, so formatted CPF/CNPJ input must continue to work.
- Name and document matching use OR semantics; a producer matching either field is included.
- Preserve pagination and the existing stable ordering: newest producers first, then ID ascending.
- Keep test descriptions in English and use the repository convention `should be able to ...` / `should not be able to ...`.
- Do not change create/update producer payloads; only the producer listing filter changes.

---

### Task 1: Change the backend producer-listing contract

**Files:**

- Modify: `apps/server/src/modules/producers/domain/repositories/producers.repository.ts`
- Modify: `apps/server/src/modules/producers/application/use-cases/list-producers.use-case.ts`
- Modify: `apps/server/src/infra/http/controllers/list-producers.controller.ts`
- Test: `apps/server/src/modules/producers/application/use-cases/list-producers.use-case.spec.ts`
- Test: `apps/server/src/infra/http/controllers/list-producers.controller.e2e-spec.ts`

**Interfaces:**

- Produce `FindManyProducersParams { search?: string; page: number; perPage: number }`.
- Produce `ListProducersUseCase.Params { search?: string; page: number; perPage: number }`.
- Accept `GET /producers?search=<value>&page=<page>&perPage=<perPage>`.

- [ ] **Step 1: Write failing contract tests**

Change use-case test inputs from `{ name: ... }` / `{ document: ... }` to `{ search: ... }`, and add assertions that the use case forwards the single field. Change controller e2e requests to `.query({ search: producer.name })`; add a request using a formatted document and assert that it returns the matching producer.

- [ ] **Step 2: Run the focused backend tests and verify failure**

Run:

```bash
bun test apps/server/src/modules/producers/application/use-cases/list-producers.use-case.spec.ts apps/server/src/infra/http/controllers/list-producers.controller.e2e-spec.ts
```

Expected: TypeScript/test failures because the old repository and controller contracts still require `name` and `document`.

- [ ] **Step 3: Implement the contract change**

Replace the two optional fields with `search?: string` in the repository and use-case parameter types. Replace the controller schema with:

```ts
const QuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().optional().default(1),
  perPage: z.coerce.number().optional().default(10),
});
```

Do not normalize the search in the controller; the repository owns matching rules so both Drizzle and in-memory implementations behave consistently.

- [ ] **Step 4: Run the focused tests and verify they pass**

Run the command from Step 2. Expected: all focused tests pass once the repository implementations are updated in Tasks 2 and 3; if the contract-only step is run before those tasks, the expected intermediate failures are limited to repository implementation signatures.

---

### Task 2: Implement unified matching in the Drizzle repository

**Files:**

- Modify: `apps/server/src/infra/database/drizzle/repositories/drizzle-producers.repository.ts`
- Test: `apps/server/src/infra/database/drizzle/repositories/drizzle-producers.repository.e2e-spec.ts`

**Interfaces:**

- Consume `findMany({ search?: string; page: number; perPage: number })`.
- Return the existing `FindManyProducersResult`, including `farmsCount`.

- [ ] **Step 1: Add failing repository scenarios**

Replace old `name` and combined-filter calls with `search`. Add separate cases proving that one search finds by name and another finds by a document fragment. Add a case where the same search could be evaluated against both columns and assert the result is returned once. Keep the pagination/order assertions.

- [ ] **Step 2: Run the Drizzle repository e2e test and verify failure**

Run:

```bash
bun run test:e2e -- --runInBand src/infra/database/drizzle/repositories/drizzle-producers.repository.e2e-spec.ts
```

Expected: failure because the repository still reads `params.name` and `params.document`.

- [ ] **Step 3: Implement OR matching and document normalization**

Import `or` from Drizzle and use one condition when `params.search` is present:

```ts
const search = params.search?.trim();
const normalizedDocumentSearch = search ? Document.strip(search) : undefined;
const where = search
  ? or(
      ilike(schema.producers.name, `%${search}%`),
      ilike(schema.producers.document, `%${normalizedDocumentSearch}%`),
    )
  : undefined;
```

Use the same `where` for both the paginated query and the total count. Preserve the existing joins, grouping, ordering, limit, and offset.

- [ ] **Step 4: Run the repository e2e test and verify it passes**

Run the command from Step 2. Expected: all name, document, pagination, ordering, and empty-result scenarios pass.

---

### Task 3: Keep the in-memory repository behavior equivalent

**Files:**

- Modify: `apps/server/test/repositories/in-memory-producers.repository.ts`
- Test: `apps/server/test/repositories/in-memory-producer-repository.spec.ts`
- Test: `apps/server/src/modules/producers/application/use-cases/list-producers.use-case.spec.ts`

**Interfaces:**

- Consume the same `search?: string` parameter as `ProducersRepository`.
- Match `producer.name` or `producer.document.value`, returning each producer once.

- [ ] **Step 1: Add failing in-memory cases**

Update existing calls to `search`. Add tests for partial name matching, formatted/partially formatted document matching, and a value that matches the name or document without requiring two filters.

- [ ] **Step 2: Run the focused in-memory tests and verify failure**

Run:

```bash
bun test apps/server/test/repositories/in-memory-producer-repository.spec.ts apps/server/src/modules/producers/application/use-cases/list-producers.use-case.spec.ts
```

Expected: failure or type errors until the repository uses the new field.

- [ ] **Step 3: Implement the same OR semantics**

Normalize once before filtering:

```ts
const search = params.search?.trim().toLocaleLowerCase();
const normalizedDocumentSearch = search ? Document.strip(search) : undefined;
const filtered = this.items.filter(
  (item) =>
    !search ||
    item.name.toLocaleLowerCase().includes(search) ||
    item.document.value.includes(normalizedDocumentSearch!),
);
```

Keep the existing stable sort, pagination, farms count, save, and delete behavior.

- [ ] **Step 4: Run the focused tests and verify they pass**

Run the command from Step 2. Expected: all tests pass.

---

### Task 4: Regenerate and consume the updated frontend API contract

**Files:**

- Regenerate: `apps/server/openapi.json`
- Regenerate: `apps/web/src/store/api/api.generated.ts`
- Modify: `apps/web/src/components/producer-async-select.tsx`
- Modify: `apps/web/src/pages/producers/list-producers.page.tsx`
- Test: `apps/web/src/store/api/api.test.ts`
- Test: `apps/web/src/pages/producers/list-producers.page.test.tsx`

**Interfaces:**

- RTK Query endpoint becomes `listProducers({ search?: string; page?: number; perPage?: number })`.
- `ProducerAsyncSelect.fetcherOptions(query)` passes `{ search: query, page: 1, perPage: 10 }` without `isDocumentSearch`.
- Producer list page keeps one URL/form field: `search`.

- [ ] **Step 1: Update frontend tests to describe the new behavior**

Replace API endpoint calls using `name` or `document` with `search`. Replace the producer list page’s two-input tests with one input labeled `Buscar produtor`, and keep two behavior tests: entering a producer name finds it, entering a formatted CPF/CNPJ finds it. Update MSW request assertions to read `search`.

- [ ] **Step 2: Regenerate the OpenAPI client and verify type failures identify remaining old usages**

After the backend contract and OpenAPI document are updated, run:

```bash
bun run generate:api
```

Expected: `ListProducersApiArg` has `search?: string` and no longer has `name`/`document`; remaining old frontend usages fail typecheck or focused tests.

- [ ] **Step 3: Simplify the producer async select**

Delete `isDocumentSearch`. The fetcher should call:

```ts
api.endpoints.listProducers.initiate(
  { search: query.trim(), page: 1, perPage: 10 },
  { subscribe: false },
)
```

Keep `fetcherOption` by ID unchanged.

- [ ] **Step 4: Simplify the producer listing page**

Replace the `name` and `document` query-state entries with `search`. Render one input with a producer-search label and placeholder. Submit `search` and use `key={searchParams.search}` so the form reflects URL changes. Continue resetting to page 1 on search and preserving pagination behavior.

- [ ] **Step 5: Run frontend tests and build**

Run:

```bash
bun run test
bun run build
```

Expected: all frontend tests pass and the generated client compiles.

---

### Task 5: Update MSW behavior and complete regression verification

**Files:**

- Modify: `apps/web/tests/mocks/handlers.ts`
- Modify: `apps/web/tests/mocks/data.ts` only if a document-search fixture is missing
- Test: `apps/web/src/store/api/api.test.ts`
- Test: `apps/web/src/pages/producers/list-producers.page.test.tsx`

**Interfaces:**

- Mock `GET /producers` reads only `search`, applies name-or-normalized-document matching, and returns the existing paginated response shape.

- [ ] **Step 1: Implement the MSW query contract**

Replace the two independent filters with:

```ts
const search = url.searchParams.get('search')?.trim().toLowerCase();
const normalizedDocumentSearch = search?.replace(/\D/g, '');
const filtered = mockData.producers.filter(
  (item) =>
    !search ||
    item.name.toLowerCase().includes(search) ||
    item.document.value.includes(normalizedDocumentSearch ?? ''),
);
```

Ensure an empty search does not accidentally match every document through an empty substring; guard the document branch with `!search || ...` as shown by the overall condition.

- [ ] **Step 2: Run all backend and frontend verification**

Run:

```bash
cd apps/server && bun test && bun run test:e2e && bun run lint
cd ../web && bun run test && bun run build && bun run lint
```

Expected: unit tests, repository/controller e2e tests, frontend tests, build, and lint complete successfully. Existing unrelated warnings may remain, but no new errors should be introduced.

- [ ] **Step 3: Review the generated contract and diff**

Run:

```bash
git diff --check
rg -n "listProducers|search|name\?: string|document\?: string" apps/server/src/modules/producers apps/server/src/infra/http/controllers/list-producers.controller.ts apps/web/src/components/producer-async-select.tsx apps/web/src/pages/producers/list-producers.page.tsx apps/web/src/store/api/api.generated.ts apps/web/tests/mocks/handlers.ts
```

Confirm that `name` and `document` remain only in create/update producer contracts and domain entity data, not in the producer listing query path.

---

## Self-review

- The plan covers the single-field contract from HTTP through use case, repository, generated client, page, async select, mocks, and tests.
- OR semantics are explicit in both database and in-memory implementations.
- Formatted document input is preserved by normalizing only for the document comparison, while the original search remains available for name matching.
- Pagination, farms count, stable ordering, producer creation/update payloads, and ID lookup are unchanged.
- No task depends on a placeholder or an undefined interface.
