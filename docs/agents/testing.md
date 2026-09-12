# Testing conventions

Write test descriptions as observable behavior using these forms:

- Positive cases: `should be able to ...`
- Negative cases: `should not be able to ...`

Use English, describe public behavior, and avoid implementation details. Apply
the convention to `describe`, `it`, and equivalent declarations in unit and
integration tests.

## Test organization

- Use-cases that depend on an in-memory repository must instantiate the repository and use-case in `beforeEach`, so each example starts with isolated state.
- Test factories belong in `test/factories` and use the `.factory.ts` suffix.
- In-memory repositories belong in `test/repositories` and must have their own unit tests.
- Factories should use Faker (and domain libraries when they generate valid domain values) for defaults and accept overrides only for values relevant to the scenario.

## Behavioral assertions

Tests must validate the observable consequences and business outcome of the behavior under test. Assertions should prove what the feature is expected to accomplish, including returned values, persisted state, emitted effects, or rejected operations when applicable. A test is valuable only if it would fail when the tested functionality stops producing its intended result. Do not assert incidental implementation details.

## Entity validation scope

Entity tests do not need to prove that the entity schema is executed. The base
`Entity` test suite already covers that mechanism. Entity-specific tests should
cover only the rules and behaviors introduced by that entity, such as positives values, sums of values, and other business rules.

```ts
it('should be able to create a producer with a valid document', () => {})
it('should not be able to create a producer with an empty name', () => {})
```
