# MachinePassport bounded specification

## Proof obligation

For one registered machine and one service event, determine whether independently issued service evidence supports every mandatory step in the exact bound OEM procedure, matches the machine identity, and leaves no material issue unresolved.

## Deterministic contract decisions

- owner and named inspector roles;
- machine, model, serial commitment, procedure ID/version and service interval;
- exact source authority, immutable URL, SHA-256 and byte length;
- distinct contract-authorized OEM and inspector repository namespaces, jointly accepted by owner and inspector;
- unique service reference and single checkpoint consumption;
- unique service evidence digest, monotonically newer service time, and due-time calculation from that service time.

## Semantic validator decision

- `identity_relation`: `MATCH | MISMATCH | UNKNOWN`;
- `procedure_relation`: exact procedure ID/version `MATCH | MISMATCH | UNKNOWN`;
- `event_relation`: exact service reference/performed time `MATCH | MISMATCH | UNKNOWN`;
- `procedure_coverage`: `COMPLETE | PARTIAL | INSUFFICIENT`;
- `open_issue`: `NONE | MATERIAL | UNKNOWN`;
- bounded material facts and missing procedure steps.

The active validator falsifier attempts to disprove consequential fields. Only all three relations `MATCH` plus `COMPLETE + NONE` maps to `SERVICE_CURRENT`. If the bound service interval has already elapsed, the contract deterministically stores `SERVICE_DUE` instead.

## Out of scope

Physical safety certification, equipment ownership, legal warranty, insurance eligibility, payment, custody, automatic background scheduling, private OEM systems and arbitrary equipment models in the initial release.
