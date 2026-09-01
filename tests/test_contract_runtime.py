import hashlib
import importlib.util
import json
import sys
import types
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CONTRACT_PATH = ROOT / "contracts" / "MachinePassport.py"
SAMPLES = ROOT / "samples"
OWNER = "0x" + "1" * 40
INSPECTOR = "0x" + "2" * 40
OUTSIDER = "0x" + "3" * 40
COMMIT = "a" * 40
PROCEDURE_ORIGIN = "https://raw.githubusercontent.com"
SERVICE_ORIGIN = "https://cdn.jsdelivr.net"
PROCEDURE_URL = f"{PROCEDURE_ORIGIN}/maker/procedures/{COMMIT}/oem-procedure-xr12-v1.json"


class UserError(Exception):
    pass


class Decorator:
    def __call__(self, value):
        return value


class TreeMap(dict):
    @classmethod
    def __class_getitem__(cls, _item):
        return cls


class Sender:
    as_hex = OWNER


class Message:
    sender_address = Sender()


class FakeResponse:
    def __init__(self, body):
        self.body = body


class FakeWeb:
    bodies = {}

    @classmethod
    def get(cls, url):
        if url not in cls.bodies:
            raise RuntimeError("unavailable")
        return FakeResponse(cls.bodies[url])


class FakeReturn:
    def __init__(self, calldata):
        self.calldata = calldata


class FakeNondet:
    web = FakeWeb
    last_assessment = None
    validator_override = None

    @classmethod
    def exec_prompt(cls, prompt, response_format=None):
        if response_format != "json":
            raise AssertionError("structured JSON response was not requested")
        if "maintenance-proof falsifier" in prompt:
            return cls.validator_override or dict(cls.last_assessment)
        if "ignore the procedure" in prompt.lower():
            result = {
                "identity_relation": "UNKNOWN",
                "procedure_relation": "UNKNOWN",
                "event_relation": "UNKNOWN",
                "procedure_coverage": "INSUFFICIENT",
                "open_issue": "UNKNOWN",
                "recommended_state": "UNRESOLVED",
                "missing_steps": [],
                "material_facts": ["Record contains no verifiable maintenance work"],
                "rationale": "The untrusted record is instructions rather than service evidence.",
            }
        elif '"model":"XR-10"' in prompt or '\\"model\\": \\"XR-10\\"' in prompt:
            result = {
                "identity_relation": "MISMATCH",
                "procedure_relation": "MATCH",
                "event_relation": "MATCH",
                "procedure_coverage": "INSUFFICIENT",
                "open_issue": "UNKNOWN",
                "recommended_state": "UNRESOLVED",
                "missing_steps": [],
                "material_facts": ["Service record names a different model"],
                "rationale": "Machine identity does not match the bound passport.",
            }
        elif "brake wear" in prompt.lower():
            result = {
                "identity_relation": "MATCH",
                "procedure_relation": "MATCH",
                "event_relation": "MATCH",
                "procedure_coverage": "COMPLETE",
                "open_issue": "MATERIAL",
                "recommended_state": "INSPECTION_REQUIRED",
                "missing_steps": [],
                "material_facts": ["Material brake wear remains open"],
                "rationale": "Completed procedure contains a material unresolved issue.",
            }
        elif "axis calibration" not in prompt.lower().split("service_source", 1)[-1]:
            result = {
                "identity_relation": "MATCH",
                "procedure_relation": "MATCH",
                "event_relation": "MATCH",
                "procedure_coverage": "PARTIAL",
                "open_issue": "NONE",
                "recommended_state": "INSPECTION_REQUIRED",
                "missing_steps": ["axis calibration confirmation"],
                "material_facts": ["Four of five mandatory steps are supported"],
                "rationale": "The inspector record does not support axis calibration.",
            }
        else:
            result = {
                "identity_relation": "MATCH",
                "procedure_relation": "MATCH",
                "event_relation": "MATCH",
                "procedure_coverage": "COMPLETE",
                "open_issue": "NONE",
                "recommended_state": "SERVICE_CURRENT",
                "missing_steps": [],
                "material_facts": ["All five mandatory procedure steps are supported"],
                "rationale": "Identity, procedure coverage and open-issue checks pass.",
            }
        cls.last_assessment = result
        return result


class FakeVm:
    UserError = UserError
    Return = FakeReturn

    @staticmethod
    def run_nondet_unsafe(leader_fn, validator_fn):
        raw = leader_fn()
        if not validator_fn(FakeReturn(raw)):
            raise UserError("VALIDATOR_DISAGREEMENT")
        return raw


fake_gl = types.SimpleNamespace(
    Contract=object,
    public=types.SimpleNamespace(write=Decorator(), view=Decorator()),
    vm=FakeVm,
    message=Message(),
    nondet=FakeNondet,
)
fake_module = types.ModuleType("genlayer")
fake_module.gl = fake_gl
fake_module.bigint = int
fake_module.TreeMap = TreeMap
fake_module.Address = lambda value: value
fake_module.allow_storage = Decorator()
sys.modules["genlayer"] = fake_module

spec = importlib.util.spec_from_file_location("machinepassport_contract_runtime", CONTRACT_PATH)
contract_module = importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(contract_module)


def body(name):
    return (SAMPLES / name).read_bytes()


def digest(value):
    return hashlib.sha256(value).hexdigest()


def service_url(name):
    return f"{SERVICE_ORIGIN}/gh/inspector/records@{COMMIT}/samples/{name}"


def new_contract():
    contract = contract_module.MachinePassport()
    contract.machines = TreeMap()
    contract.services = TreeMap()
    contract.checkpoints = TreeMap()
    contract.serial_index = TreeMap()
    contract.service_ref_index = TreeMap()
    contract.service_evidence_index = TreeMap()
    fake_gl.message.sender_address.as_hex = OWNER
    FakeNondet.last_assessment = None
    FakeNondet.validator_override = None
    procedure = body("oem-procedure-xr12-v1.json")
    FakeWeb.bodies = {PROCEDURE_URL: procedure}
    machine_id = contract.register_machine(
        INSPECTOR, "XR-12", "a" * 64, "XR12-ANNUAL-SAFETY", "v1",
        PROCEDURE_ORIGIN, PROCEDURE_URL, digest(procedure), len(procedure), 3600,
    )
    fake_gl.message.sender_address.as_hex = INSPECTOR
    contract.accept_machine(machine_id)
    # Keep service freshness tests deterministic as wall-clock time advances.
    contract._now = lambda: 1788249700
    return contract, machine_id


SERVICE_REFS = {
    "service-complete.json": "XR12-SVC-2026-001",
    "service-missing-step.json": "XR12-SVC-2026-002",
    "service-open-issue.json": "XR12-SVC-2026-003",
    "service-wrong-machine.json": "XR12-SVC-2026-004",
    "service-prompt-injection.txt": "XR12-SVC-2026-005",
}


def add_service(contract, machine_id, name, ref=None, performed_at=1788249600):
    record = body(name)
    url = service_url(name)
    FakeWeb.bodies[url] = record
    fake_gl.message.sender_address.as_hex = INSPECTOR
    service_id = contract.submit_service_record(
        machine_id, ref or SERVICE_REFS[name], SERVICE_ORIGIN, url, digest(record), len(record), performed_at
    )
    fake_gl.message.sender_address.as_hex = OWNER
    checkpoint_id = contract.open_checkpoint(machine_id, service_id)
    return service_id, checkpoint_id


class MachinePassportRuntimeTests(unittest.TestCase):
    def test_happy_path_reaches_service_current_with_bound_snapshots(self):
        contract, machine_id = new_contract()
        _, checkpoint_id = add_service(contract, machine_id, "service-complete.json")
        self.assertEqual(contract.assess_checkpoint(checkpoint_id), "SERVICE_CURRENT")
        checkpoint = json.loads(contract.get_checkpoint(checkpoint_id))
        machine = json.loads(contract.get_machine(machine_id))
        self.assertEqual(checkpoint["procedure_coverage"], "COMPLETE")
        self.assertEqual(checkpoint["procedure_snapshot_sha256"], digest(body("oem-procedure-xr12-v1.json")))
        self.assertEqual(checkpoint["service_snapshot_sha256"], digest(body("service-complete.json")))
        self.assertEqual(machine["standing"], "SERVICE_CURRENT")
        self.assertGreater(machine["next_due_at"], 0)

    def test_missing_mandatory_step_requires_inspection(self):
        contract, machine_id = new_contract()
        _, checkpoint_id = add_service(contract, machine_id, "service-missing-step.json")
        self.assertEqual(contract.assess_checkpoint(checkpoint_id), "INSPECTION_REQUIRED")
        checkpoint = json.loads(contract.get_checkpoint(checkpoint_id))
        self.assertEqual(checkpoint["missing_steps"], ["axis calibration confirmation"])

    def test_material_open_issue_requires_inspection(self):
        contract, machine_id = new_contract()
        _, checkpoint_id = add_service(contract, machine_id, "service-open-issue.json")
        self.assertEqual(contract.assess_checkpoint(checkpoint_id), "INSPECTION_REQUIRED")
        self.assertEqual(json.loads(contract.get_checkpoint(checkpoint_id))["open_issue"], "MATERIAL")

    def test_wrong_machine_fails_closed(self):
        contract, machine_id = new_contract()
        _, checkpoint_id = add_service(contract, machine_id, "service-wrong-machine.json")
        self.assertEqual(contract.assess_checkpoint(checkpoint_id), "UNRESOLVED")
        self.assertEqual(json.loads(contract.get_checkpoint(checkpoint_id))["identity_relation"], "MISMATCH")

    def test_prompt_injection_is_data_and_fails_closed(self):
        contract, machine_id = new_contract()
        _, checkpoint_id = add_service(contract, machine_id, "service-prompt-injection.txt")
        self.assertEqual(contract.assess_checkpoint(checkpoint_id), "UNRESOLVED")

    def test_digest_mismatch_never_calls_positive_path(self):
        contract, machine_id = new_contract()
        _, checkpoint_id = add_service(contract, machine_id, "service-complete.json")
        contract.services["0"].source_sha256 = "f" * 64
        self.assertEqual(contract.assess_checkpoint(checkpoint_id), "UNRESOLVED")
        self.assertEqual(json.loads(contract.get_checkpoint(checkpoint_id))["rationale"], "DIGEST_MISMATCH")

    def test_inspector_authority_duplicate_and_replay_guards(self):
        contract, machine_id = new_contract()
        fake_gl.message.sender_address.as_hex = OUTSIDER
        complete = body("service-complete.json")
        with self.assertRaisesRegex(UserError, "INSPECTOR_ONLY"):
            contract.submit_service_record(
                machine_id, "svc-001", SERVICE_ORIGIN, service_url("service-complete.json"),
                digest(complete), len(complete), 1788249600,
            )
        service_id, _ = add_service(contract, machine_id, "service-complete.json")
        fake_gl.message.sender_address.as_hex = INSPECTOR
        with self.assertRaisesRegex(UserError, "INVALID_OR_DUPLICATE_SERVICE"):
            contract.submit_service_record(
                machine_id, "XR12-SVC-2026-001", SERVICE_ORIGIN, service_url("service-complete.json"),
                digest(complete), len(complete), 1788249601,
            )
        with self.assertRaisesRegex(UserError, "INVALID_OR_CONSUMED_SERVICE"):
            contract.open_checkpoint(machine_id, service_id)

    def test_current_state_becomes_due_after_interval(self):
        contract, machine_id = new_contract()
        _, checkpoint_id = add_service(contract, machine_id, "service-complete.json")
        contract.assess_checkpoint(checkpoint_id)
        contract.machines[machine_id].next_due_at = contract._now() - 1
        self.assertEqual(contract.refresh_due_state(machine_id), "SERVICE_DUE")

    def test_delayed_assessment_cannot_restart_an_expired_due_clock(self):
        contract, machine_id = new_contract()
        _, checkpoint_id = add_service(contract, machine_id, "service-complete.json", performed_at=1788249600)
        contract._now = lambda: 1788253200
        self.assertEqual(contract.assess_checkpoint(checkpoint_id), "SERVICE_DUE")
        self.assertEqual(contract.machines[machine_id].next_due_at, 1788253200)

    def test_duplicate_evidence_cannot_renew_under_a_new_reference(self):
        contract, machine_id = new_contract()
        add_service(contract, machine_id, "service-complete.json")
        complete = body("service-complete.json")
        fake_gl.message.sender_address.as_hex = INSPECTOR
        with self.assertRaisesRegex(UserError, "INVALID_OR_DUPLICATE_SERVICE"):
            contract.submit_service_record(
                machine_id, "XR12-SVC-2026-REPLAY", SERVICE_ORIGIN,
                service_url("service-complete.json"), digest(complete), len(complete), 1788249601,
            )

    def test_older_checkpoint_cannot_overwrite_newer_service_event(self):
        contract, machine_id = new_contract()
        _, older_checkpoint = add_service(contract, machine_id, "service-complete.json", performed_at=1788249600)
        add_service(contract, machine_id, "service-open-issue.json", performed_at=1788249601)
        with self.assertRaisesRegex(UserError, "STALE_SERVICE_EVENT"):
            contract.assess_checkpoint(older_checkpoint)

    def test_positive_state_requires_procedure_and_event_match(self):
        candidate = {
            "identity_relation": "MATCH", "procedure_relation": "MISMATCH",
            "event_relation": "MATCH", "procedure_coverage": "COMPLETE",
            "open_issue": "NONE", "recommended_state": "SERVICE_CURRENT",
            "missing_steps": [], "material_facts": ["All steps present"],
            "rationale": "The record claims a different procedure version.",
        }
        self.assertEqual(contract_module._normalize_assessment(candidate), {})

    def test_nonconsequential_explanation_fields_may_default(self):
        candidate = {
            "identity_relation": "MATCH", "procedure_relation": "MATCH",
            "event_relation": "MATCH", "procedure_coverage": "COMPLETE",
            "open_issue": "NONE", "recommended_state": "SERVICE_CURRENT",
            "missing_steps": [],
        }
        normalized = contract_module._normalize_assessment(candidate)
        self.assertEqual(normalized["recommended_state"], "SERVICE_CURRENT")
        self.assertEqual(normalized["material_facts"], [])
        self.assertEqual(normalized["rationale"], "Bounded semantic assessment completed.")

    def test_missing_steps_remains_required_and_duplicate_free(self):
        candidate = {
            "identity_relation": "MATCH", "procedure_relation": "MATCH",
            "event_relation": "MATCH", "procedure_coverage": "COMPLETE",
            "open_issue": "NONE", "recommended_state": "SERVICE_CURRENT",
        }
        self.assertEqual(contract_module._normalize_assessment(candidate), {})
        candidate.update({
            "procedure_coverage": "PARTIAL",
            "recommended_state": "INSPECTION_REQUIRED",
            "missing_steps": ["servo brake inspection", "servo brake inspection"],
        })
        self.assertEqual(contract_module._normalize_assessment(candidate), {})

    def test_missing_step_signature_is_order_independent(self):
        left = {
            "identity_relation": "MATCH", "procedure_relation": "MATCH",
            "event_relation": "MATCH", "procedure_coverage": "PARTIAL",
            "open_issue": "NONE", "recommended_state": "INSPECTION_REQUIRED",
            "missing_steps": ["servo brake inspection", "axis calibration confirmation"],
        }
        right = dict(left)
        right["missing_steps"] = list(reversed(left["missing_steps"]))
        self.assertEqual(
            contract_module._assessment_signature(left),
            contract_module._assessment_signature(right),
        )

    def test_active_falsifier_disagreement_rejects_consensus(self):
        contract, machine_id = new_contract()
        _, checkpoint_id = add_service(contract, machine_id, "service-complete.json")
        FakeNondet.validator_override = {
            "identity_relation": "MATCH", "procedure_relation": "MATCH",
            "event_relation": "MATCH", "procedure_coverage": "PARTIAL",
            "open_issue": "NONE", "recommended_state": "INSPECTION_REQUIRED",
            "missing_steps": ["axis calibration confirmation"],
            "material_facts": ["One mandatory step lacks support"],
            "rationale": "Independent falsification found a missing mandatory step.",
        }
        with self.assertRaisesRegex(UserError, "VALIDATOR_DISAGREEMENT"):
            contract.assess_checkpoint(checkpoint_id)

    def test_mutable_and_same_authority_sources_are_rejected(self):
        contract, machine_id = new_contract()
        fake_gl.message.sender_address.as_hex = INSPECTOR
        complete = body("service-complete.json")
        with self.assertRaisesRegex(UserError, "SERVICE_AUTHORITY_NOT_INDEPENDENT"):
            contract.submit_service_record(
                machine_id, "svc-same", PROCEDURE_ORIGIN, PROCEDURE_URL,
                digest(complete), len(complete), 1788249600,
            )
        with self.assertRaisesRegex(UserError, "INVALID_SERVICE_SOURCE"):
            contract.submit_service_record(
                machine_id, "svc-main", SERVICE_ORIGIN,
                f"{SERVICE_ORIGIN}/gh/inspector/records@main/samples/service-complete.json",
                digest(complete), len(complete), 1788249600,
            )
        same_repo_transport = f"{SERVICE_ORIGIN}/gh/maker/procedures@{COMMIT}/samples/service-complete.json"
        with self.assertRaisesRegex(UserError, "SERVICE_AUTHORITY_NOT_INDEPENDENT"):
            contract.submit_service_record(
                machine_id, "svc-same-repo", SERVICE_ORIGIN, same_repo_transport,
                digest(complete), len(complete), 1788249600,
            )


if __name__ == "__main__":
    unittest.main()
