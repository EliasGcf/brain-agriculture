# Testing conventions

Write test descriptions as observable behavior using these forms:

- Positive cases: `should be able to ...`
- Negative cases: `should not be able to ...`

Use English, describe public behavior, and avoid implementation details. Apply
the convention to `describe`, `it`, and equivalent declarations in unit and
integration tests.

## Entity validation scope

Entity tests do not need to prove that the entity schema is executed. The base
`Entity` test suite already covers that mechanism. Entity-specific tests should
cover only the rules and behaviors introduced by that entity, such as positives values, sums of values, and other business rules.

```ts
it('should be able to create a producer with a valid document', () => {})
it('should not be able to create a producer with an empty name', () => {})
```
