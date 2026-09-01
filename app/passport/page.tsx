"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useState } from "react";
import { Activity, ArrowLeft, ArrowRight, Check, CircleAlert, ExternalLink, Fingerprint, LoaderCircle, Radio, RefreshCw, ShieldCheck, Wrench } from "lucide-react";
import { activeNetwork, connectWallet, contractAddress, explorerUrl, readContract, transactionExplorerUrl, unwrap, writeContract, type Result } from "@/lib/genlayer";
import { decodeReturnedId } from "@/lib/receipt";

type Machine = { machine_id: string; owner: string; inspector: string; model: string; serial_commitment: string; procedure_id: string; procedure_version: string; accepted: boolean; active: boolean; standing: string; next_due_at: number; service_count: number; latest_checkpoint_id: string };
type Service = { service_id: string; machine_id: string; service_ref: string; inspector: string; consumed: boolean; checkpoint_id: string };
type Checkpoint = { checkpoint_id: string; status: string; identity_relation: string; procedure_relation: string; event_relation: string; procedure_coverage: string; open_issue: string; semantic_state: string; missing_steps: string[]; material_facts: string[]; rationale: string; procedure_snapshot_sha256: string; service_snapshot_sha256: string };
type Totals = { machines: number; services: number; checkpoints: number };
type Status = { tone: "idle" | "busy" | "ok" | "error"; message: string; hash?: string };

const initialRegister = { inspector: "", model: "XR-12", serial: "", procedureId: "XR12-ANNUAL-SAFETY", version: "v1", origin: "https://raw.githubusercontent.com", url: "", digest: "", bytes: "", interval: "31536000" };
const initialService = { ref: "", origin: "https://cdn.jsdelivr.net", url: "", digest: "", bytes: "", performedAt: "" };
const steps = ["Register", "Accept", "Service record", "Checkpoint", "Assess"];

function short(value: string, size = 7) { return value ? `${value.slice(0, size)}…${value.slice(-5)}` : "—"; }
function idFrom(result: Result) { return decodeReturnedId(result.transaction, result.receipt, result.data); }

export default function PassportConsole() {
  const [wallet, setWallet] = useState("");
  const [machineId, setMachineId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [checkpointId, setCheckpointId] = useState("");
  const [register, setRegister] = useState(initialRegister);
  const [service, setService] = useState(initialService);
  const [machine, setMachine] = useState<Machine | null>(null);
  const [serviceRecord, setServiceRecord] = useState<Service | null>(null);
  const [checkpoint, setCheckpoint] = useState<Checkpoint | null>(null);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [status, setStatus] = useState<Status>({ tone: "idle", message: "Ready. Connect the wallet that owns or inspects the machine." });

  const sync = useCallback(async (requestedMachine = machineId, requestedService = serviceId, requestedCheckpoint = checkpointId) => {
    setStatus({ tone: "busy", message: "Reading finalized passport state…" });
    const errors: string[] = [];
    const totalResult = await readContract("get_totals");
    if (totalResult.success) setTotals(unwrap<Totals>(totalResult.data));
    else { setTotals(null); errors.push(totalResult.error || "Totals read failed."); }
    if (requestedMachine) {
      const result = await readContract("get_machine", [requestedMachine]);
      if (result.success) setMachine(unwrap<Machine>(result.data));
      else { setMachine(null); errors.push(`Machine ${requestedMachine}: ${result.error || "read failed"}`); }
    } else { setMachine(null); }
    if (requestedService) {
      const result = await readContract("get_service", [requestedService]);
      if (result.success) setServiceRecord(unwrap<Service>(result.data));
      else { setServiceRecord(null); errors.push(`Service ${requestedService}: ${result.error || "read failed"}`); }
    } else { setServiceRecord(null); }
    if (requestedCheckpoint) {
      const result = await readContract("get_checkpoint", [requestedCheckpoint]);
      if (result.success) setCheckpoint(unwrap<Checkpoint>(result.data));
      else { setCheckpoint(null); errors.push(`Checkpoint ${requestedCheckpoint}: ${result.error || "read failed"}`); }
    } else { setCheckpoint(null); }
    if (errors.length) setStatus({ tone: "error", message: errors.join(" | ") });
    else setStatus({ tone: "ok", message: "Finalized state synchronized from the active contract." });
  }, [machineId, serviceId, checkpointId]);

  async function connect() {
    const result = await connectWallet();
    if (result.success) { setWallet(String(result.data)); setStatus({ tone: "ok", message: "Wallet connected. Role checks still happen inside the contract." }); }
    else setStatus({ tone: "error", message: result.error || "Wallet connection failed." });
  }

  async function transact(label: string, method: string, args: unknown[], onId?: (id: string) => void) {
    setStatus({ tone: "busy", message: `${label}: waiting for GenLayer consensus and finality…` });
    const result = await writeContract(method, args);
    if (!result.success) { setStatus({ tone: "error", message: result.error || `${label} failed.`, hash: result.hash }); return; }
    try {
      const returnedId = onId ? idFrom(result) : "";
      if (onId) onId(returnedId);
      if (method === "register_machine") await sync(returnedId, "", "");
      else if (method === "submit_service_record") await sync(machineId, returnedId, "");
      else if (method === "open_checkpoint") await sync(machineId, serviceId, returnedId);
      else await sync();
      setStatus((current) => current.tone === "error" ? current : { tone: "ok", message: `${label} finalized and verified by authoritative readback.`, hash: result.hash });
    } catch (error) {
      setStatus({ tone: "error", message: error instanceof Error ? error.message : "Finalized return ID was not found.", hash: result.hash });
    }
  }

  const completed = [Boolean(machineId), Boolean(machine?.accepted), Boolean(serviceId), Boolean(checkpointId), checkpoint?.status === "ASSESSED"];
  const activeStep = Math.min(completed.findIndex((value) => !value) < 0 ? 4 : completed.findIndex((value) => !value), 4);
  const deployed = /^0x[0-9a-f]{40}$/i.test(contractAddress());

  return <main className="console-page">
    <header className="console-nav">
      <Link href="/" className="brand"><Image src="/machinepassport-logo.png" alt="MachinePassport" width={38} height={38} /><span>MachinePassport</span></Link>
      <div className="chain-pill"><Radio size={14} /> {activeNetwork().toUpperCase()}</div>
      <button className="wallet-button" onClick={connect}>{wallet ? short(wallet) : "Connect wallet"}</button>
    </header>

    <div className="console-shell">
      <aside className="sequence-panel">
        <Link href="/" className="back-link"><ArrowLeft size={15} /> Product</Link>
        <div className="sequence-title"><p>VERIFICATION RUN</p><h1>Issue a machine passport.</h1><span>Every positive state needs two exact sources and validator falsification.</span></div>
        <ol>{steps.map((step, index) => <li key={step} className={index === activeStep ? "active" : completed[index] ? "done" : ""}><i>{completed[index] ? <Check size={14} /> : String(index + 1).padStart(2, "0")}</i><span>{step}<small>{completed[index] ? "Finalized" : index === activeStep ? "In progress" : "Locked"}</small></span></li>)}</ol>
        <div className="sequence-foot"><ShieldCheck size={18} /><p><strong>Fail-closed mode</strong>Source errors, malformed output and identity uncertainty never become current service.</p></div>
      </aside>

      <section className="workbench">
        <div className="workbench-head"><div><p className="kicker">CONTROL PLANE / {String(activeStep + 1).padStart(2, "0")}</p><h2>{steps[activeStep]}</h2></div><button className="sync-button" onClick={() => sync()} disabled={!deployed || status.tone === "busy"}><RefreshCw size={16} /> Sync all</button></div>

        {!deployed && <div className="notice error"><CircleAlert /><div><strong>Contract not configured</strong><span>Deploy `contracts/MachinePassport.py`, then set `NEXT_PUBLIC_CONTRACT_ADDRESS`.</span></div></div>}

        <div className={`notice ${status.tone}`}><Activity /><div><strong>{status.tone === "busy" ? "Consensus running" : status.tone === "error" ? "Action stopped" : status.tone === "ok" ? "Readback available" : "Operator note"}</strong><span>{status.message}</span>{status.hash && transactionExplorerUrl(status.hash) && <a href={transactionExplorerUrl(status.hash)} target="_blank" rel="noreferrer">View transaction <ExternalLink size={12} /></a>}</div>{status.tone === "busy" && <LoaderCircle className="spin" />}</div>

        <section className="form-module">
          <div className="module-mark"><Fingerprint /><span>01</span></div>
          <div className="module-body"><div className="module-heading"><p>OWNER ACTION</p><h3>Bind machine identity + OEM procedure</h3><span>The serial is stored only as a 64-character commitment. The procedure URL must be pinned to a full Git commit.</span></div>
            <div className="form-grid three"><label>Inspector wallet<input value={register.inspector} onChange={(e) => setRegister({...register, inspector:e.target.value})} placeholder="0x… independent inspector" /></label><label>Machine model<input value={register.model} onChange={(e) => setRegister({...register, model:e.target.value})} /></label><label>Serial commitment<input value={register.serial} onChange={(e) => setRegister({...register, serial:e.target.value})} placeholder="64 lowercase hex characters" /></label></div>
            <div className="form-grid three"><label>Procedure ID<input value={register.procedureId} onChange={(e) => setRegister({...register, procedureId:e.target.value})} /></label><label>Version<input value={register.version} onChange={(e) => setRegister({...register, version:e.target.value})} /></label><label>Service interval (seconds)<input inputMode="numeric" value={register.interval} onChange={(e) => setRegister({...register, interval:e.target.value})} /></label></div>
            <div className="form-grid"><label>OEM authority origin<input value={register.origin} onChange={(e) => setRegister({...register, origin:e.target.value})} /></label><label>Commit-pinned procedure URL<input value={register.url} onChange={(e) => setRegister({...register, url:e.target.value})} placeholder="https://raw.githubusercontent.com/org/repo/{40-sha}/file.json" /></label></div>
            <div className="form-grid"><label>SHA-256 digest<input value={register.digest} onChange={(e) => setRegister({...register, digest:e.target.value.replace(/^sha256:/, "")})} placeholder="64 lowercase hex characters" /></label><label>Exact byte length<input inputMode="numeric" value={register.bytes} onChange={(e) => setRegister({...register, bytes:e.target.value})} /></label></div>
            <button className="action-button" disabled={!wallet || !deployed || status.tone === "busy"} onClick={() => transact("Register machine", "register_machine", [register.inspector, register.model, register.serial, register.procedureId, register.version, register.origin, register.url, register.digest, Number(register.bytes), Number(register.interval)], setMachineId)}>Register and capture machine ID <ArrowRight size={17} /></button>
          </div>
        </section>

        <section className="form-module compact"><div className="module-mark"><ShieldCheck /><span>02</span></div><div className="module-body"><div className="module-heading"><p>INSPECTOR ACTION</p><h3>Accept the assigned machine</h3><span>Connect the exact inspector wallet named at registration.</span></div><div className="inline-action"><label>Machine ID<input value={machineId} onChange={(e) => setMachineId(e.target.value)} placeholder="Returned ID" /></label><button onClick={() => transact("Accept assignment", "accept_machine", [machineId])} disabled={!wallet || !machineId || status.tone === "busy"}>Accept machine</button></div></div></section>

        <section className="form-module"><div className="module-mark"><Wrench /><span>03</span></div><div className="module-body"><div className="module-heading"><p>INSPECTOR ACTION</p><h3>Submit one exact service record</h3><span>The inspector source must use a different origin from the OEM procedure and is consumed by one checkpoint.</span></div>
          <div className="form-grid three"><label>Machine ID<input value={machineId} onChange={(e) => setMachineId(e.target.value)} /></label><label>Service reference<input value={service.ref} onChange={(e) => setService({...service, ref:e.target.value})} placeholder="XR12-SVC-2026-001" /></label><label>Performed at (Unix seconds)<input inputMode="numeric" value={service.performedAt} onChange={(e) => setService({...service, performedAt:e.target.value})} placeholder="Must match the service record" /></label></div>
          <label>Inspector source origin<input value={service.origin} onChange={(e) => setService({...service, origin:e.target.value})} /></label>
          <label>Commit-pinned service URL<input value={service.url} onChange={(e) => setService({...service, url:e.target.value})} placeholder="https://cdn.jsdelivr.net/gh/org/repo@{40-sha}/record.json" /></label>
          <div className="form-grid"><label>SHA-256 digest<input value={service.digest} onChange={(e) => setService({...service, digest:e.target.value.replace(/^sha256:/, "")})} /></label><label>Exact byte length<input inputMode="numeric" value={service.bytes} onChange={(e) => setService({...service, bytes:e.target.value})} /></label></div>
          <button className="action-button" onClick={() => transact("Submit service record", "submit_service_record", [machineId, service.ref, service.origin, service.url, service.digest, Number(service.bytes), Number(service.performedAt)], setServiceId)} disabled={!wallet || !machineId || !service.performedAt || status.tone === "busy"}>Submit and capture service ID <ArrowRight size={17} /></button>
        </div></section>

        <section className="form-module compact"><div className="module-mark"><Activity /><span>04</span></div><div className="module-body"><div className="module-heading"><p>PARTICIPANT ACTION</p><h3>Consume record into a checkpoint</h3><span>Owner or inspector may open it; the service record cannot be reused.</span></div><div className="inline-action two-ids"><label>Machine ID<input value={machineId} onChange={(e) => setMachineId(e.target.value)} /></label><label>Service ID<input value={serviceId} onChange={(e) => setServiceId(e.target.value)} /></label><button onClick={() => transact("Open checkpoint", "open_checkpoint", [machineId, serviceId], setCheckpointId)} disabled={!wallet || !machineId || !serviceId || status.tone === "busy"}>Open checkpoint</button></div></div></section>

        <section className="form-module verdict-module"><div className="module-mark"><Radio /><span>05</span></div><div className="module-body"><div className="module-heading"><p>ANY CALLER / VALIDATOR CONSENSUS</p><h3>Run semantic assessment + falsifier</h3><span>The leader compares evidence; validators independently attempt to disprove consequential fields.</span></div><div className="inline-action"><label>Checkpoint ID<input value={checkpointId} onChange={(e) => setCheckpointId(e.target.value)} /></label><button onClick={() => transact("Assess checkpoint", "assess_checkpoint", [checkpointId])} disabled={!wallet || !checkpointId || status.tone === "busy"}>Run assessment</button></div></div></section>
      </section>

      <aside className="passport-panel">
        <div className="passport-top"><Image src="/machinepassport-logo.png" alt="" width={72} height={72} /><div><p>DIGITAL SERVICE PASSPORT</p><strong>{machine?.model || "NO MACHINE"}</strong><span>ID / {machineId || "—"}</span></div></div>
        <div className={`standing ${machine?.standing?.toLowerCase().replaceAll("_", "-") || "unresolved"}`}><span>FINALIZED STANDING</span><strong>{machine?.standing || "UNRESOLVED"}</strong><small>{machine?.accepted ? "Inspector accepted" : "Awaiting inspector acceptance"}</small></div>
        <dl><div><dt>Owner</dt><dd>{short(machine?.owner || "")}</dd></div><div><dt>Inspector</dt><dd>{short(machine?.inspector || "")}</dd></div><div><dt>Procedure</dt><dd>{machine ? `${machine.procedure_id} / v${machine.procedure_version}` : "—"}</dd></div><div><dt>Service records</dt><dd>{machine?.service_count ?? "—"}</dd></div><div><dt>Next due (unix)</dt><dd>{machine?.next_due_at || "—"}</dd></div></dl>
        <div className="evidence-readback"><p>LAST CHECKPOINT</p><div className="mini-grid"><span>Machine identity<strong>{checkpoint?.identity_relation || "—"}</strong></span><span>Procedure ID/version<strong>{checkpoint?.procedure_relation || "—"}</strong></span><span>Service event<strong>{checkpoint?.event_relation || "—"}</strong></span><span>Step coverage<strong>{checkpoint?.procedure_coverage || "—"}</strong></span><span>Open issue<strong>{checkpoint?.open_issue || "—"}</strong></span><span>Status<strong>{checkpoint?.status || "—"}</strong></span></div>{checkpoint?.missing_steps?.length ? <div className="finding"><CircleAlert /> Missing: {checkpoint.missing_steps.join(", ")}</div> : null}{checkpoint?.material_facts?.map((fact) => <div className="fact" key={fact}><Check />{fact}</div>)}</div>
        <div className="source-digests"><p>VERIFIED SNAPSHOTS</p><span>OEM <code>{short(checkpoint?.procedure_snapshot_sha256 || "", 10)}</code></span><span>SERVICE <code>{short(checkpoint?.service_snapshot_sha256 || "", 10)}</code></span></div>
        <div className="panel-actions"><button onClick={() => sync()} disabled={!deployed}><RefreshCw /> Authoritative readback</button>{deployed && <a href={explorerUrl()} target="_blank" rel="noreferrer">Explorer <ExternalLink /></a>}</div>
        <div className="ledger"><span>CONTRACT</span><code>{deployed ? short(contractAddress(), 9) : "NOT DEPLOYED"}</code><span>TOTALS</span><code>{totals ? `${totals.machines}M / ${totals.services}S / ${totals.checkpoints}C` : "—"}</code><span>SERVICE RECORD</span><code>{serviceRecord ? `${serviceRecord.service_ref} / ${serviceRecord.consumed ? "USED" : "READY"}` : "—"}</code></div>
      </aside>
    </div>
  </main>;
}
