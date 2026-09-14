# Context Map

## Contexts

- [Shared Agricultural Domain](./CONTEXT.md): canonical glossary and cross-package domain rules.
- [Server](./apps/server/CONTEXT.md): backend context for the application's server-side capabilities.
- [Web](./apps/web/CONTEXT.md): frontend context for presenting the shared domain and dashboard concepts.

## Relationships

- **Server → Shared Agricultural Domain**: The server implements the shared producer, farm, harvest, planted-crop, and area vocabulary.
- **Web → Shared Agricultural Domain**: The web presents the shared domain through dashboard and list concepts.
- **Web → Server**: The web consumes server data for the shared domain and presents it to an internal user.
