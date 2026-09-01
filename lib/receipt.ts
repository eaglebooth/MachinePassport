type RecordValue = Record<string, unknown>;

function candidates(source: unknown): unknown[] {
  if (!source || typeof source !== "object") return [source];
  const record = source as RecordValue;
  const consensus = record.consensus_data as RecordValue | undefined;
  const leaders = consensus?.leader_receipt;
  const result = record.result as RecordValue | undefined;
  const payload = result?.payload as RecordValue | undefined;
  const validLeaders = Array.isArray(leaders) ? leaders.filter((value) => {
    if (!value || typeof value !== "object") return false;
    const leader = value as RecordValue;
    const leaderResult = leader.result as RecordValue | undefined;
    return String(leader.execution_result ?? "").toUpperCase() === "SUCCESS"
      && String(leaderResult?.status ?? "").toUpperCase() === "RETURN";
  }) : [];
  return [
    ...validLeaders.flatMap((leader) => candidates(leader)),
    payload?.readable,
    typeof result?.payload === "string" || typeof result?.payload === "number" || typeof result?.payload === "bigint" ? result.payload : undefined,
    result?.readable,
    record.returnValue,
    record.return_value,
    record.output,
    record.readable,
    typeof result === "string" ? result : undefined,
  ];
}

export function decodeReturnedId(...sources: unknown[]): string {
  for (const source of sources) {
    for (const candidate of candidates(source)) {
      if (typeof candidate === "number" && Number.isSafeInteger(candidate) && candidate >= 0) return String(candidate);
      if (typeof candidate === "bigint" && candidate >= BigInt(0)) return candidate.toString();
      if (typeof candidate !== "string") continue;
      const clean = candidate.trim().replace(/^"|"$/g, "");
      if (/^\d+$/.test(clean)) return String(BigInt(clean));
      if (/^0x[0-9a-f]+$/i.test(clean)) return BigInt(clean).toString();
      try {
        const parsed = JSON.parse(candidate) as unknown;
        const nested = decodeReturnedId(parsed);
        if (nested) return nested;
      } catch { /* non-JSON candidate */ }
    }
  }
  throw new Error("FINALIZED_RETURN_ID_NOT_FOUND");
}
