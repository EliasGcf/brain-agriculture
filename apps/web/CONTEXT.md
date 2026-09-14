# Web

Frontend context for presenting the shared agricultural domain to an internal user. Shared terms and business rules live in the root [CONTEXT.md](../../CONTEXT.md).

## Language

## Presentation architecture

The web context follows Atomic Design pragmatically for interface composition:

- **Atoms** are the smallest reusable interface controls and visual primitives.
- **Molecules** combine atoms into a focused interaction or display unit.
- **Organisms** compose molecules into a complete feature section such as a form, list, or chart group.
- **Templates** define page-level layout and composition without owning feature-specific data rules.
- **Pages** assemble templates and feature organisms for a route.

Components should live at the lowest level that accurately describes their responsibility. A page should compose reusable atoms, molecules, and organisms instead of defining several feature sections and their presentation logic inline. This structure is a presentation convention; domain vocabulary and business rules remain defined by the shared context.

**Farm count by crop**:
The number of distinct farms in which a named planted crop is registered. A farm counts at most once for a crop, even if the crop appears in multiple harvests or multiple planted-crop records in that farm.
_Avoid_: Crop hectares, number of planted-crop records

**Dashboard**:
A global view of the registered farms, total hectares, geographic distribution by total farm area, crop presence by distinct farm count, and farm land use.
_Avoid_: Producer-specific dashboard, filtered dashboard

**Farm summary**:
The compact presentation of a farm used in producer and global farm lists, including its name, producer, location, total area, arable area, and vegetation area.
_Avoid_: Farm detail
