# MachinePassport StudioNet release evidence

Status: **V1 DEPLOYED — V2 CONSENSUS FIX READY FOR OWNER DEPLOYMENT**

## Release identity

- Repository commit: [`9bed7d8a34303a9e814e7516400b449982f2fecb`](https://github.com/eaglebooth/MachinePassport/commit/9bed7d8a34303a9e814e7516400b449982f2fecb)
- Contract address: [`0x56010DE036b4FDec95Bf0F1641605938D9CC7d60`](https://explorer-studio.genlayer.com/address/0x56010DE036b4FDec95Bf0F1641605938D9CC7d60)
- Deployed source verification: retrieved from StudioNet with `genlayer code`; reviewed mechanisms present
- Inspector evidence commit: [`a9fe8b939866edeb064d1892c9a302dc2ff5db3e`](https://github.com/eaglebooth/MachinePassportInspectorEvidence/commit/a9fe8b939866edeb064d1892c9a302dc2ff5db3e)
- Production frontend: pending

## V1 live lifecycle (retained truthfully)

The deterministic lifecycle succeeded through checkpoint creation. The first assessment
failed closed on malformed model output. A retry produced a valid `SERVICE_CURRENT`
leader result, but only two validators agreed and three disagreed, so consensus was
undetermined and the contract correctly retained `UNRESOLVED`. These transactions are
evidence of fail-closed behavior, **not** a successful happy path.

| Action | Transaction | Final result / authoritative readback |
| --- | --- | --- |
| Deploy V1 | [`0x35390809…6149b`](https://explorer-studio.genlayer.com/tx/0x35390809d35dd3619d9437ed95c249791fc42d1dbda91defdab6c0b79916149b) | Finalized, accepted |
| Register machine | [`0x3d579427…ed264`](https://explorer-studio.genlayer.com/tx/0x3d57942712731df2d51fc87ca5df73a8e83eeedf74f5f3e86db3ebede04ed264) | Machine ID `0`, active |
| Accept machine | [`0x49a7b80b…7d960`](https://explorer-studio.genlayer.com/tx/0x49a7b80b5bd17404c1bf9eb57304027a149aed569c58f8a4cd5db2c0f377d960) | `accepted: true` |
| Submit service | [`0x73082d35…4c658`](https://explorer-studio.genlayer.com/tx/0x73082d351d27ec78edfd995e291bb42f236bc008b29b56dbd2c7d2898794c658) | Service ID `0`; exact URL, digest and 548-byte commitment read back |
| Open checkpoint | [`0x29c58937…72f02`](https://explorer-studio.genlayer.com/tx/0x29c58937ef940f0845e181d89023d61cc8680228a8576c0e85ba41d4f2372f02) | Checkpoint ID `0`; service consumed and replay-locked |
| Assess attempt 1 | [`0xa31ac1cc…a7f4a`](https://explorer-studio.genlayer.com/tx/0xa31ac1cc668626949a84e7acee14fe63ab171cf5478ac7b6dd431c129c8a7f4a) | Finalized / majority agree; `UNRESOLVED`, `INVALID_MODEL_OUTPUT` |
| Assess retry | [`0xb8963c80…74a70`](https://explorer-studio.genlayer.com/tx/0xb8963c80db8e7485d4f0bf69afdcc0af2ee7d020a723ad1327e552e086074a70) | Finalized / undetermined; leader returned `SERVICE_CURRENT`, validator vote 2 agree / 3 disagree; state unchanged |

V1 final readback: machine `0` is active and accepted with one service and one
checkpoint; checkpoint `0` is `UNRESOLVED`, both pinned snapshot digests match, and
the machine standing remains `UNRESOLVED`.

## V2 consensus correction

V2 retains independent adversarial recomputation but compares a normalized
consequential assessment signature. Validator prose and rationale no longer affect
consensus. Identity, procedure, event, coverage, open issue, derived state and missing
mandatory steps must still match exactly; digest, byte-length, authority, replay and
staleness gates remain unchanged. V2 must be deployed and exercised from a fresh
contract before this document can mark the happy path as passed.

## Verification matrix

| Path | Expected | Transaction | Readback |
| --- | --- | --- | --- |
| Complete service (V1) | `SERVICE_CURRENT` | assessment links above | **not passed** — final readback `UNRESOLVED` |
| Complete service (V2) | `SERVICE_CURRENT` | pending fresh deployment | pending |
| Missing mandatory step | `INSPECTION_REQUIRED` | pending | pending |
| Prompt injection/wrong machine | `UNRESOLVED` | pending | pending |
| Unauthorized inspector | rollback | pending | pending |
| Digest/length mismatch | fail closed | pending | pending |
| Same digest under a new service reference | rollback | pending | pending |
| Older checkpoint after a newer service event | rollback | pending | pending |
| Delayed assessment after interval | `SERVICE_DUE` | pending | pending |
| Procedure/event identity mismatch | `UNRESOLVED` | pending | pending |

Do not mark submission-ready until the V2 happy path, at least one semantic failure
path, and authoritative post-state are recorded on the same deployed V2 address.
