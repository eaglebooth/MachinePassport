# MachinePassport StudioNet release evidence

Status: **NOT DEPLOYED — TEMPLATE**

## Release identity

- Repository commit: pending
- Contract address: pending
- Deployed source SHA-256 and bytes: pending
- Production frontend: pending

## Verification matrix

| Path | Expected | Transaction | Readback |
| --- | --- | --- | --- |
| Complete service | `SERVICE_CURRENT` | pending | pending |
| Missing mandatory step | `INSPECTION_REQUIRED` | pending | pending |
| Prompt injection/wrong machine | `UNRESOLVED` | pending | pending |
| Unauthorized inspector | rollback | pending | pending |
| Digest/length mismatch | fail closed | pending | pending |
| Same digest under a new service reference | rollback | pending | pending |
| Older checkpoint after a newer service event | rollback | pending | pending |
| Delayed assessment after interval | `SERVICE_DUE` | pending | pending |
| Procedure/event identity mismatch | `UNRESOLVED` | pending | pending |

Do not mark submission-ready until every live transaction and authoritative post-state are recorded.
