# Phase 01 — proof model and originality

Date: 2026-09-01  
Priority: critical  
Status: complete

## Proof obligation

Does an inspector-issued service record, bound to a machine and service event, support completion of every mandatory step in an exact model-specific procedure, with no material unresolved issue?

## Falsifier

Validators refetch both exact byte streams, recompute both commitments, and attempt to disprove the leader by finding:

- wrong model or serial commitment;
- missing mandatory procedure steps;
- a material open issue;
- evidence that does not cover the declared service event;
- prompt injection or unsupported conclusions.

## Consequence boundary

`SERVICE_CURRENT` is reachable only from `MATCH + COMPLETE + NONE`. Any missing prerequisite routes to `INSPECTION_REQUIRED` or `UNRESOLVED`. `SERVICE_DUE` is computed deterministically from the stored service interval.

## Authority topology

- Machine owner registers the machine and exact procedure commitment.
- Named inspector independently accepts the registration.
- Only that inspector can submit a service record.
- Owner or inspector can open a checkpoint.
- Assessment is permissionless after evidence is locked.

## Nearest-project comparison

| Dimension | ClausePilot | MachinePassport |
| --- | --- | --- |
| Proof object | obligation vs observation | procedure graph vs service event |
| Evidence | one authorized observation | two independently committed byte streams |
| Authority | owner/counterparty consent | owner/inspector issuance split |
| Validator | comparative classification | active leader falsification |
| Persistence | obligation standing | append-only service event plus step-coverage checkpoint |
| Replay | checkpoint sequence | single-use service-record index |
| Time | recurring observation window | deterministic maintenance due date |

## Why this is not a clone

1. It reconciles two different evidence roles rather than classifying one observation.
2. The inspector issues a single-use service event; the owner cannot manufacture the positive record alone.
3. Validators attack a proposed procedure-completion claim instead of independently restating a generic verdict.
4. The persistent object evolves through service-event consumption and maintenance due dates.
5. The consequential prerequisite is full mandatory-step coverage, not general semantic satisfaction.

## Threat model

- Attacker wants: falsely obtain `SERVICE_CURRENT`.
- Controls: machine registration fields, malicious service text if inspector colludes, source availability timing.
- Cannot control: the other named role, validator refetch, stored commitments, single-use index.
- Can fabricate: plausible JSON and prompt injection.
- Can replay: a prior service URL unless the service reference/index blocks it.
- Most dangerous false positive: incomplete or wrong-machine service accepted as current.
- Most dangerous false negative: complete service routed to unresolved; safe but operationally inconvenient.

