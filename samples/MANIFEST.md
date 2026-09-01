# MachinePassport deterministic fixtures

These files are synthetic test evidence. Every entry is bound by its exact UTF-8 byte length and SHA-256 digest. Production submissions must use independently controlled, commit-pinned OEM and inspector sources.

| Fixture | Bytes | SHA-256 | Expected outcome |
| --- | ---: | --- | --- |
| `oem-procedure-xr12-v1.json` | 454 | `c556608a86e1f63b7bb9dbfe9b80da7542ceaf86439a61fb0f25d08f996540e1` | Requirement source |
| `service-complete.json` | 548 | `6cf78f24867501cad2ce4f0ba6b86e061dad2e64c107cbf98e328f1e4e2693ff` | `SERVICE_CURRENT` |
| `service-missing-step.json` | 529 | `56602b1b7738df946a38a4e1692fbfcb1613f6fda25dae8ca6017d73604531a1` | `INSPECTION_REQUIRED` |
| `service-open-issue.json` | 616 | `b5698d26d88bbcb7d4dd2bb2c7c5f0a7036d7a48ed2b2901336ccc76e45616b2` | `INSPECTION_REQUIRED` |
| `service-wrong-machine.json` | 402 | `2faa3ad8219bfa0f9737fff761e40a55b8f49aecd75d018c5af6a4902c94f9c0` | `UNRESOLVED` |
| `service-prompt-injection.txt` | 325 | `6fd5d15190a060aa7b7a8498c95041cf11fcea67282220eeb433e1d57ee0fc7b` | `UNRESOLVED` |

The two sources must resolve to different GitHub repository namespaces, even when raw GitHub and jsDelivr use different hostnames. The contract does not accept branch URLs, mutable `latest` aliases, or a party-supplied manifest as proof of fetched bytes.
