# MachinePassport

MachinePassport is a bounded GenLayer Intelligent Contract for evolving equipment service standing. It compares an inspector-issued service record against an exact OEM procedure and stores one of four states: `SERVICE_CURRENT`, `SERVICE_DUE`, `INSPECTION_REQUIRED`, or `UNRESOLVED`.

It is deliberately **not** a physical safety certificate, warranty oracle, ownership registry, or escrow product.

## Mechanism

1. The owner registers a model, serial commitment, inspector, service interval, and exact OEM procedure source.
2. The named inspector accepts the machine.
3. The inspector submits an exact, time-bound service record from a different contract-authorized repository namespace.
4. Owner or inspector consumes that record into a single-use checkpoint.
5. Validators fetch and hash both sources. A semantic evaluator compares mandatory steps; an active falsifier tries to disprove identity, coverage, and open-issue fields.
6. The contract persists the bounded standing and exact snapshot digests.

`SERVICE_CURRENT` requires machine identity, procedure ID/version, and service event to all `MATCH`, plus `coverage=COMPLETE` and `open_issue=NONE`. Duplicate evidence cannot be renewed under a different reference, and the due clock starts at the bound service-performance time. Everything uncertain fails closed.

## Local verification

```bash
python -m unittest discover -s tests -v
npm install
npm test
npm run lint
npm run build
npm run dev
```

Open [http://localhost:3200](http://localhost:3200).

## Configuration

Copy `.env.example` to `.env.local` and set the deployed contract:

```env
NEXT_PUBLIC_NETWORK=studionet
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
```

Do not enter branch URLs. Supported evidence forms are full-commit GitHub raw URLs and full-commit jsDelivr GitHub URLs. Record exact raw UTF-8 byte length and lowercase SHA-256 without the `sha256:` prefix in contract calls.

## Evidence

- Contract: `contracts/MachinePassport.py`
- Runtime and adversarial tests: `tests/`
- Synthetic fixtures and commitments: `samples/MANIFEST.md`
- Threat model: `docs/THREAT_MODEL.md`
- Release checklist: `docs/RELEASE_EVIDENCE_TEMPLATE.md`

No deployment or live transaction is claimed until Explorer links are added after StudioNet verification.
