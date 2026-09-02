# MachinePassport StudioNet release evidence

Status: **V2 DEPLOYED — HAPPY PATH AND SEMANTIC FAILURE PATH VERIFIED LIVE**

## Release identity

- V2 repository commit: [`d67b9aeff2f012963013f78960dc744238e5aff5`](https://github.com/eaglebooth/MachinePassport/commit/d67b9aeff2f012963013f78960dc744238e5aff5)
- V2 contract address: [`0x2Fa5A212b1ECF57D3D8c0590902319b3E5972ccc`](https://explorer-studio.genlayer.com/address/0x2Fa5A212b1ECF57D3D8c0590902319b3E5972ccc)
- V2 deploy transaction: [`0x095d295f…f7c24`](https://explorer-studio.genlayer.com/tx/0x095d295f1a51a78f69826dfcac8c2b747b6196b5a064c2cb0cf48e925bdf7c24) — finalized, accepted
- Deployed source verification: StudioNet Explorer source matches V2 normalized signature, exact identifier and independent validator mechanisms
- Inspector happy-path evidence commit: [`a9fe8b939866edeb064d1892c9a302dc2ff5db3e`](https://github.com/eaglebooth/MachinePassportInspectorEvidence/commit/a9fe8b939866edeb064d1892c9a302dc2ff5db3e)
- Inspector final failure-path evidence commit: [`262d46c0cbd1f17369ef16c58bb7ac7e1143fa38`](https://github.com/eaglebooth/MachinePassportInspectorEvidence/commit/262d46c0cbd1f17369ef16c58bb7ac7e1143fa38)
- Production frontend: pending

## V1 live lifecycle (retained truthfully)

V1 contract: [`0x56010DE036b4FDec95Bf0F1641605938D9CC7d60`](https://explorer-studio.genlayer.com/address/0x56010DE036b4FDec95Bf0F1641605938D9CC7d60), deployed from commit [`9bed7d8a34303a9e814e7516400b449982f2fecb`](https://github.com/eaglebooth/MachinePassport/commit/9bed7d8a34303a9e814e7516400b449982f2fecb).

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

## V2 live happy path

V2 retains independent adversarial recomputation but compares a normalized
consequential assessment signature. Validator prose and rationale no longer affect
consensus. Identity, procedure, event, coverage, open issue, derived state and missing
mandatory steps must still match exactly; digest, byte-length, authority, replay and
staleness gates remain unchanged.

| Action | Transaction | Final result / authoritative readback |
| --- | --- | --- |
| Register machine | [`0x7adb7f01…adc40`](https://explorer-studio.genlayer.com/tx/0x7adb7f01ba4a6d2206d1e5991900498ec084edff18a0ff73f0de4e70081adc40) | Machine ID `0`; exact OEM URL, SHA-256 and 454-byte commitment |
| Accept machine | [`0x30e165a0…db289`](https://explorer-studio.genlayer.com/tx/0x30e165a06369f04ef8633b7932e87853ecac2664e57883f9ac82d441e83db289) | Finalized; `accepted: true`, `active: true` |
| Submit complete service | [`0xef40861f…b7f19`](https://explorer-studio.genlayer.com/tx/0xef40861ff7df002a12da95643a25e5f1875bff31925dba65a6acfcfec75b7f19) | Service ID `0`; exact commit-pinned URL, SHA-256 and 548 bytes |
| Open happy checkpoint | [`0x66ccfd3c…3939a`](https://explorer-studio.genlayer.com/tx/0x66ccfd3c933c39c44c7799f900240d7167f9bc88fbafeffbd84c102150a3939a) | Checkpoint ID `0`; service consumed and replay-locked |
| Assess happy checkpoint | [`0x503e275e…ea3e`](https://explorer-studio.genlayer.com/tx/0x503e275eeac3cf81b29fcaf24159b65e52b04649fd3a82874e70c9c70f44ea3e) | Finalized / majority agree; `SERVICE_CURRENT` |

Checkpoint `0` readback is `ASSESSED`: identity, procedure and event are `MATCH`,
coverage is `COMPLETE`, open issue is `NONE`, missing steps are empty, and both
procedure and service snapshot digests match their pinned bytes.

## V2 live semantic failure path

The first missing-step fixture was intentionally retained as truthful evidence of an
ambiguous observation: its `open_issues` array was empty while its result stated that
calibration evidence was absent. The leader returned `INSPECTION_REQUIRED`, but three
validators disagreed with its consequential classification. The transaction finalized
as `MAJORITY_DISAGREE`, so checkpoint `1` correctly remained `OPEN` and no assessment
state was applied.

| Action | Transaction | Final result / authoritative readback |
| --- | --- | --- |
| Submit ambiguous missing-step record | [`0x6951c6f8…b7f68`](https://explorer-studio.genlayer.com/tx/0x6951c6f8358bef2e768d38f8e08c7dacf4553ec5223bb060627663e382fb7f68) | Service ID `1`; pinned evidence commit `0b563c2`; exact 547-byte digest |
| Open ambiguous checkpoint | [`0x47e239ea…0a4e2`](https://explorer-studio.genlayer.com/tx/0x47e239ea4d5740a6fe23b188f6bb7b91926643fee265befb00246c01c840a4e2) | Checkpoint ID `1`; service consumed |
| Assess ambiguous checkpoint | [`0x6c7d2b38…b39bd`](https://explorer-studio.genlayer.com/tx/0x6c7d2b38e8f89a8bd3d791a5e4e6204d626585a0002c05df8f427ccec7cb39bd) | Finalized / `MAJORITY_DISAGREE`; leader returned `INSPECTION_REQUIRED`; state unchanged |
| Submit explicit material missing-step record | [`0x9828646e…e77ff`](https://explorer-studio.genlayer.com/tx/0x9828646eea33fc3331e5b824c31d55a9f15ece8b2531169ee16459acc61e77ff) | Service ID `2`; pinned commit `262d46c`; SHA-256 `881e29ef…6846`; 632 bytes |
| Open explicit failure checkpoint | [`0xe69cca7f…65bbd`](https://explorer-studio.genlayer.com/tx/0xe69cca7ffae741833a424c20b364056cc1495f69e6245b62cd082a5645565bbd) | Checkpoint ID `2`; service consumed and replay-locked |
| Assess explicit failure checkpoint | [`0x9c59a713…e8f0a`](https://explorer-studio.genlayer.com/tx/0x9c59a7134a769511c637eb8d690147e2d0182fb8a10a663dcd619f0511ae8f0a) | Finalized / `MAJORITY_AGREE`; 3 agree, 2 idle after quorum; `INSPECTION_REQUIRED` |

Checkpoint `2` readback is `ASSESSED`: identity, procedure and event are `MATCH`,
coverage is `PARTIAL`, open issue is `MATERIAL`, and the sole missing step is exactly
`axis calibration confirmation`. Its procedure and service snapshot digests match the
bound sources. Final machine readback has `latest_checkpoint_id: "2"`, three services,
and standing `INSPECTION_REQUIRED`. Totals are one machine, three services and three
checkpoints.

## Verification matrix

| Path | Expected | Transaction | Readback |
| --- | --- | --- | --- |
| Complete service (V1) | `SERVICE_CURRENT` | assessment links above | **not passed** — final readback `UNRESOLVED` |
| Complete service (V2) | `SERVICE_CURRENT` | [`0x503e275e…ea3e`](https://explorer-studio.genlayer.com/tx/0x503e275eeac3cf81b29fcaf24159b65e52b04649fd3a82874e70c9c70f44ea3e) | **passed** — checkpoint `0` `ASSESSED`, complete, no missing steps |
| Missing mandatory step | `INSPECTION_REQUIRED` | [`0x9c59a713…e8f0a`](https://explorer-studio.genlayer.com/tx/0x9c59a7134a769511c637eb8d690147e2d0182fb8a10a663dcd619f0511ae8f0a) | **passed** — checkpoint `2` `ASSESSED`, partial, exact missing step |
| Prompt injection/wrong machine | `UNRESOLVED` | pending | pending |
| Unauthorized inspector | rollback | pending | pending |
| Digest/length mismatch | fail closed | pending | pending |
| Same digest under a new service reference | rollback | pending | pending |
| Older checkpoint after a newer service event | rollback | pending | pending |
| Delayed assessment after interval | `SERVICE_DUE` | pending | pending |
| Procedure/event identity mismatch | `UNRESOLVED` | pending | pending |

The minimum live-evidence gate is satisfied on one V2 deployment: one happy path, one
semantic failure path, and authoritative post-state readbacks are recorded. Remaining
matrix rows are additional hardening evidence and are not claimed as executed.
