# Threat model

The protected consequence is the machine standing, especially `SERVICE_CURRENT`.

## Mandatory gates

- Distinct owner and inspector wallets.
- Inspector acceptance before service intake.
- Exact HTTPS origin and URL binding for both sources.
- Fetched bytes must match stored SHA-256 and byte length.
- Procedure and service sources must resolve to different GitHub repository namespaces. This is contract-authorized provenance, not cryptographic proof of OEM identity.
- Service record is inspector-issued, digest-unique, time-bound, and single use.
- Older service events and checkpoints cannot overwrite a newer service event.
- Machine, exact procedure ID/version, exact service reference/performed time, and checkpoint are semantic relations in the falsified verdict.
- Positive standing requires all three relations `MATCH`, `COMPLETE`, and `NONE`.
- Unknown, malformed, unavailable, or falsified claims cannot cross the positive-state boundary.

## Non-claims

MachinePassport does not prove physical work occurred, certify legal safety, price insurance, pay warranties, or wake itself on a schedule. It determines whether authority-bound public evidence supports a bounded maintenance procedure.
