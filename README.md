# brain-agriculture

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.4.2. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.

## Frontend tests

Run the frontend tests once, including in CI:

```bash
bun run --cwd apps/web test
```

For watch mode during development:

```bash
bun run --cwd apps/web test:watch
```
