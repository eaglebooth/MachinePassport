# StudioNet lifecycle inputs

Active contract: [`0x56010DE036b4FDec95Bf0F1641605938D9CC7d60`](https://explorer-studio.genlayer.com/address/0x56010DE036b4FDec95Bf0F1641605938D9CC7d60)

These are synthetic testing inputs. They do not certify a physical machine or authorize its operation.

## Register machine — owner wallet

| Field | Value |
| --- | --- |
| Model | `XR-12` |
| Serial commitment | `aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa` |
| Procedure ID | `XR12-ANNUAL-SAFETY` |
| Procedure version | `v1` |
| Procedure origin | `https://raw.githubusercontent.com` |
| Procedure URL | `https://raw.githubusercontent.com/eaglebooth/MachinePassport/9bed7d8a34303a9e814e7516400b449982f2fecb/samples/oem-procedure-xr12-v1.json` |
| Procedure SHA-256 | `c556608a86e1f63b7bb9dbfe9b80da7542ceaf86439a61fb0f25d08f996540e1` |
| Exact bytes | `454` |
| Interval seconds | `31536000` |

The inspector wallet must be a different address and must execute `accept_machine` after the returned machine ID is finalized.

## Happy-path service — inspector wallet

| Field | Value |
| --- | --- |
| Service reference | `XR12-SVC-2026-001` |
| Performed at | `1788249600` |
| Source origin | `https://raw.githubusercontent.com` |
| Source URL | `https://raw.githubusercontent.com/eaglebooth/MachinePassportInspectorEvidence/a9fe8b939866edeb064d1892c9a302dc2ff5db3e/service-complete.json` |
| Source SHA-256 | `6cf78f24867501cad2ce4f0ba6b86e061dad2e64c107cbf98e328f1e4e2693ff` |
| Exact bytes | `548` |

Expected sequence: `register_machine → accept_machine → submit_service_record → open_checkpoint → assess_checkpoint`. Capture every finalized returned ID; never default to `0` unless the finalized receipt actually returns `0`.

## Failure/adversarial records

All files use origin `https://raw.githubusercontent.com` and commit `a9fe8b939866edeb064d1892c9a302dc2ff5db3e`.

| File | Reference | Bytes | SHA-256 | Expected |
| --- | --- | ---: | --- | --- |
| `service-missing-step.json` | `XR12-SVC-2026-002` | 529 | `56602b1b7738df946a38a4e1692fbfcb1613f6fda25dae8ca6017d73604531a1` | `INSPECTION_REQUIRED` |
| `service-open-issue.json` | `XR12-SVC-2026-003` | 616 | `b5698d26d88bbcb7d4dd2bb2c7c5f0a7036d7a48ed2b2901336ccc76e45616b2` | `INSPECTION_REQUIRED` |
| `service-wrong-machine.json` | `XR12-SVC-2026-004` | 402 | `2faa3ad8219bfa0f9737fff761e40a55b8f49aecd75d018c5af6a4902c94f9c0` | `UNRESOLVED` |
| `service-prompt-injection.txt` | `XR12-SVC-2026-005` | 325 | `6fd5d15190a060aa7b7a8498c95041cf11fcea67282220eeb433e1d57ee0fc7b` | `UNRESOLVED` |

Each record is single-use and time-ordered. A later failure-path run should use a fresh machine registration or a strictly newer `performed_at` embedded identically in a newly committed evidence file.
