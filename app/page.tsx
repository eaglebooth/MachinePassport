import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, BadgeCheck, Binary, FileSearch, ShieldCheck } from "lucide-react";

const states = [
  ["01", "Bind", "Owner locks machine identity and the exact OEM procedure bytes."],
  ["02", "Attest", "A named inspector publishes a single-use service record from an independent origin."],
  ["03", "Falsify", "Validators actively look for identity mismatch, missing steps and material issues."],
  ["04", "Persist", "The passport stores current, due, inspection-required or unresolved standing."],
];

export default function Home() {
  return <main className="landing">
    <nav className="nav shell">
      <Link href="/" className="brand"><Image src="/machinepassport-logo.png" alt="MachinePassport" width={42} height={42} priority /><span>MachinePassport</span></Link>
      <div className="nav-links"><a href="#mechanism">Mechanism</a><a href="#scope">Scope</a><Link className="nav-cta" href="/passport">Open console <ArrowUpRight size={16} /></Link></div>
    </nav>

    <section className="hero shell">
      <div className="hero-copy">
        <p className="eyebrow"><span /> GENLAYER MACHINE ASSURANCE</p>
        <h1>Service history<br />that has to <em>prove itself.</em></h1>
        <p className="hero-lead">A living equipment passport that reconciles inspector evidence against an exact OEM procedure—and fails closed when the proof does not hold.</p>
        <div className="hero-actions"><Link href="/passport" className="primary">Launch passport console <ArrowUpRight size={18} /></Link><a href="#mechanism" className="text-link">Trace the decision path ↓</a></div>
        <div className="trust-row"><span><ShieldCheck /> No custody</span><span><Binary /> Exact bytes</span><span><FileSearch /> Active falsifier</span></div>
      </div>
      <div className="hero-art">
        <div className="orbit orbit-a" /><div className="orbit orbit-b" />
        <div className="image-frame"><Image src="/machinepassport-logo.png" alt="Robot arm and digital machine passport" width={640} height={640} priority /></div>
        <div className="signal-card signal-top"><span>STANDING</span><strong>SERVICE_CURRENT</strong></div>
        <div className="signal-card signal-bottom"><BadgeCheck /><span>DUAL SOURCE<br /><strong>BOUND</strong></span></div>
      </div>
    </section>

    <section id="mechanism" className="mechanism shell">
      <div className="section-head"><p className="eyebrow"><span /> PROOF, NOT CLAIMS</p><h2>Four gates. One bounded conclusion.</h2><p>The AI answers only the semantic comparison. Identity, authority, commitments, replay and time remain deterministic contract rules.</p></div>
      <div className="rail">{states.map(([n, title, body]) => <article key={n}><span className="rail-num">{n}</span><div className="rail-line" /><h3>{title}</h3><p>{body}</p></article>)}</div>
    </section>

    <section id="scope" className="scope shell">
      <div><p className="eyebrow"><span /> INTENTIONAL SCOPE</p><h2>A passport state,<br />not a safety certificate.</h2></div>
      <div className="scope-grid"><article><strong>Contract decides</strong><p>Who may submit, which sources are authorized, whether exact bytes match, whether a record is replayed and when service becomes due.</p></article><article><strong>Validators decide</strong><p>Whether the named machine matches, every mandatory OEM step is supported, and a material unresolved issue remains.</p></article><article><strong>It never decides</strong><p>Physical safety, legal warranty, insurance eligibility or ownership transfer. Those claims stay outside this primitive.</p></article></div>
    </section>
  </main>;
}
