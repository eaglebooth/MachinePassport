# MachinePassport implementation plan

Status: IN PROGRESS

1. [Proof model and originality](phase-01-proof-model.md)
2. Contract, fixtures, and adversarial tests
3. Industrial control-room frontend
4. GenVM, test, build, and browser verification
5. Deployment handoff and release-evidence template

## Fixed scope

- One fictional machine model: `XR-12`.
- One procedure family: annual servo and emergency-stop inspection.
- Dual authority-bound evidence: OEM procedure plus inspector-issued service record.
- States: `UNRESOLVED`, `SERVICE_CURRENT`, `SERVICE_DUE`, `INSPECTION_REQUIRED`.
- No escrow, warranty payout, autonomous scheduler, legal safety certification, or marketplace transfer.

## Definition of done before deployment

- Contract lints and validates with GenVM.
- Runtime and adversarial tests pass.
- Public fixtures have commit-ready SHA-256 and byte-length manifest.
- Frontend uses real `genlayer-js`, supports receipt-derived IDs, and shows active address/network.
- Original UI visually verified at desktop and mobile widths.

