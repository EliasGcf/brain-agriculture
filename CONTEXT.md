# Agricultural Domain

Shared vocabulary and domain rules for the agricultural producer-management system. Package contexts should define only concepts local to their boundary and use this glossary for shared language.

## Language

**Internal user**:
A member of the internal team who registers and views producers and farms. This is distinct from a producer.
_Avoid_: Producer, producer user

**Producer**:
A rural person or organization registered in the system, identified by a unique document and able to own one or more farms.
_Avoid_: User, owner, customer

**Document**:
The producer's registration identifier, containing a CPF or CNPJ and stored without punctuation.
_Avoid_: Treating CPF and CNPJ as separate concepts in this version

**Farm**:
A rural area belonging to exactly one producer, with total, arable, and vegetation areas. A farm may exist without harvests or planted crops and may be transferred to another existing producer.
_Avoid_: Rural property, real estate property

**Harvest**:
A named record belonging to a farm, used to group the planted crops registered in that context.
_Avoid_: Agricultural period, season

**Planted crop**:
A named crop record belonging to a harvest of a farm. Planted crop names are not required to be unique within a harvest.
_Avoid_: Crop, plantation

**Arable area**:
The part of a farm's total area intended for cultivation.
_Avoid_: Cultivated area

**Vegetation area**:
The part of a farm's total area allocated to vegetation.
_Avoid_: Reserve, preserved area

**Other uses**:
The part of a farm's total area that is not classified as arable area or vegetation area.
_Avoid_: Unused area

## Resolved domain decisions

- Internal identifiers are UUIDs.
- A producer may own zero, one, or more farms; a farm belongs to exactly one producer.
- A farm may have zero, one, or more harvests; a harvest may have zero, one, or more planted crops.
- A producer cannot be deleted while it owns farms.
- Deleting a farm deletes its harvests and planted crops transactionally.
- Harvest names are unique within a farm using the domain-normalized name.
- Planted crop names may repeat within a harvest.
- Farm total area must be positive, and arable area plus vegetation area cannot exceed total area.
- Farm areas are measured in hectares and may use fractional values with up to two decimal places.
- Harvests and planted crops do not receive hectares in the current product scope. Area allocation and availability calculations for these records are deferred to a future evolution.
- The dashboard has no filters in the initial product scope and represents the complete registered base by default.
- The state dashboard groups total farm hectares by state; the crop dashboard groups distinct farm counts by planted crop; the land-use dashboard uses farm arable, vegetation, and other-use areas.
- A farm without harvests or planted crops still contributes to farm, hectare, state, and land-use totals, but not to crop counts.
- Deletion is physical in this version; a future historical/audit requirement should favor soft-delete.
- Internal user accounts belong to the system's access-control boundary and are distinct from producers. Accounts are created by infrastructure seed, authenticate with email and password, and receive a 24-hour JWT; role and permission management are outside the current scope.
- Main domain records keep creation and last-update timestamps; historical auditing is outside this version.
