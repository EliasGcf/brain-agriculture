# Server

Backend context for the application's server-side capabilities and the agricultural domain exposed to clients.

## Language

**Internal user**:
A member of the internal team who accesses the system to register and view producers. This is distinct from a producer.
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
A named record belonging to a farm, used to group the crops planted in that context.
_Avoid_: Agricultural period, season

**Planted crop**:
A named crop record belonging to a harvest of a farm.
_Avoid_: Crop, plantation

Planted crop names are not required to be unique within a harvest; repeated registrations are allowed in this version.

**Arable area**:
The part of a farm's total area intended for cultivation.
_Avoid_: Cultivated area

**Vegetation area**:
The part of a farm's total area allocated to vegetation.
_Avoid_: Reserve, preserved area

**Other uses**:
The part of a farm's total area that is not classified as arable area or vegetation area.
_Avoid_: Unused area
