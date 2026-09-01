# MachinePassport StudioNet release evidence

Status: **DEPLOYED — LIVE LIFECYCLE PENDING**

## Release identity

- Repository commit: [`9bed7d8a34303a9e814e7516400b449982f2fecb`](https://github.com/eaglebooth/MachinePassport/commit/9bed7d8a34303a9e814e7516400b449982f2fecb)
- Contract address: [`0x56010DE036b4FDec95Bf0F1641605938D9CC7d60`](https://explorer-studio.genlayer.com/address/0x56010DE036b4FDec95Bf0F1641605938D9CC7d60)
- Deployed source verification: retrieved from StudioNet with `genlayer code`; reviewed mechanisms present
- Inspector evidence commit: [`a9fe8b939866edeb064d1892c9a302dc2ff5db3e`](https://github.com/eaglebooth/MachinePassportInspectorEvidence/commit/a9fe8b939866edeb064d1892c9a302dc2ff5db3e)
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
