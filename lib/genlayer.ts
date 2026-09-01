import { createClient } from "genlayer-js";
import { localnet, studionet, testnetBradbury } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";
import { transactionResultNumberToName } from "genlayer-js/types";

type NetworkName = "localnet" | "studionet" | "testnetBradbury";
declare global { interface Window { ethereum?: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> } } }
const network = (process.env.NEXT_PUBLIC_NETWORK as NetworkName) || "studionet";
const chains = { localnet, studionet, testnetBradbury };
const readClient = createClient({ chain: chains[network] ?? studionet });

type RuntimeClient = {
  connect?: (name: NetworkName) => Promise<unknown>;
  readContract: (args: { address: string; functionName: string; args: unknown[] }) => Promise<unknown>;
  writeContract: (args: { address: string; functionName: string; args: unknown[]; value: bigint }) => Promise<string | { txId: string }>;
  waitForTransactionReceipt: (args: { hash: `0x${string}`; status: string; interval?: number; retries?: number }) => Promise<Record<string, unknown>>;
  getTransaction: (args: { hash: `0x${string}` }) => Promise<Record<string, unknown>>;
};

export type Result = { success: boolean; data?: unknown; hash?: string; error?: string; receipt?: Record<string, unknown>; transaction?: Record<string, unknown> };
export const activeNetwork = () => network;
const ACTIVE_STUDIONET_CONTRACT = "0x56010DE036b4FDec95Bf0F1641605938D9CC7d60";
export const contractAddress = () => process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || (network === "studionet" ? ACTIVE_STUDIONET_CONTRACT : "");
export const explorerUrl = () => `${process.env.NEXT_PUBLIC_EXPLORER_BASE || "https://explorer-studio.genlayer.com/address/"}${contractAddress()}`;
export const transactionExplorerUrl = (hash: string) => {
  const configured = process.env.NEXT_PUBLIC_TX_EXPLORER_BASE;
  const base = configured || (network === "studionet" ? "https://explorer-studio.genlayer.com/tx/" : "");
  return base && hash ? `${base}${hash}` : "";
};

export async function connectWallet(): Promise<Result> {
  if (!window.ethereum) return { success: false, error: "Install or unlock an EVM wallet." };
  try {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" }) as string[];
    return accounts[0] ? { success: true, data: accounts[0] } : { success: false, error: "No account selected." };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Wallet connection failed." };
  }
}

export async function readContract(functionName: string, args: unknown[] = []): Promise<Result> {
  if (!/^0x[0-9a-f]{40}$/i.test(contractAddress())) return { success: false, error: "Deploy and configure the contract first." };
  try {
    return { success: true, data: await (readClient as unknown as RuntimeClient).readContract({ address: contractAddress(), functionName, args }) };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Contract read failed." };
  }
}

function transactionFailure(transaction: Record<string, unknown>, receipt: Record<string, unknown>): string {
  const consensus = transaction.consensus_data as Record<string, unknown> | undefined;
  const leaders = consensus?.leader_receipt;
  const leader = Array.isArray(leaders) ? leaders[0] as Record<string, unknown> | undefined : undefined;
  const leaderResult = leader?.result as Record<string, unknown> | undefined;
  const leaderPayload = leaderResult?.payload as Record<string, unknown> | undefined;
  const execution = String(leader?.execution_result ?? "").toUpperCase();
  const resultStatus = String(leaderResult?.status ?? "").toUpperCase();
  const finalized = String(transaction.statusName ?? receipt.statusName ?? "").toUpperCase();
  const resultNames = transactionResultNumberToName as unknown as Record<string, string>;
  const consensusName = String(transaction.resultName ?? resultNames[String(transaction.result)] ?? "").toUpperCase();
  if (finalized !== "FINALIZED") return finalized ? `Unexpected transaction status ${finalized}.` : "Missing FINALIZED transaction status.";
  if (!leader) return "Missing authoritative leader receipt.";
  if (execution !== "SUCCESS") return String(leaderPayload?.readable ?? leader?.error_description ?? (execution || "Missing successful execution result."));
  if (resultStatus !== "RETURN") return String(leaderPayload?.readable ?? leader?.error_description ?? (resultStatus || "Missing RETURN result."));
  if (consensusName && !["AGREE", "MAJORITY_AGREE"].includes(consensusName)) return `Consensus result ${consensusName}.`;
  return "";
}

export async function writeContract(functionName: string, args: unknown[] = []): Promise<Result> {
  if (!window.ethereum) return { success: false, error: "Connect a wallet before writing." };
  if (!/^0x[0-9a-f]{40}$/i.test(contractAddress())) return { success: false, error: "Deploy and configure the contract first." };
  let hash = "";
  try {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" }) as string[];
    const client = createClient({ chain: chains[network] ?? studionet, provider: window.ethereum, account: accounts[0] as `0x${string}` }) as unknown as RuntimeClient;
    if (client.connect) await client.connect(network);
    const raw = await client.writeContract({ address: contractAddress(), functionName, args, value: BigInt(0) });
    hash = typeof raw === "string" ? raw : raw.txId;
    const receipt = await client.waitForTransactionReceipt({ hash: hash as `0x${string}`, status: TransactionStatus.FINALIZED, interval: 2000, retries: 300 });
    let transaction = receipt;
    try { transaction = await client.getTransaction({ hash: hash as `0x${string}` }); } catch { /* receipt still contains the final result */ }
    const failure = transactionFailure(transaction, receipt);
    if (failure) return { success: false, hash, error: `Contract rejected this action: ${failure}`, receipt, transaction };
    return { success: true, hash, data: receipt, receipt, transaction };
  } catch (error) {
    return { success: false, hash, error: error instanceof Error ? error.message : "Contract write failed." };
  }
}

export function unwrap<T>(value: unknown): T | null {
  try {
    if (typeof value === "string") return JSON.parse(value) as T;
    if (value && typeof value === "object" && "result" in value) return unwrap<T>((value as { result: unknown }).result);
    return value as T;
  } catch { return null; }
}
