import assert from "node:assert/strict";
import test from "node:test";
import { decodeReturnedId } from "./receipt.ts";

test("decodes a returned decimal identifier", () => {
  assert.equal(decodeReturnedId({ result: { readable: "\"17\"" } }), "17");
});

test("decodes a leader receipt identifier before unrelated values", () => {
  assert.equal(decodeReturnedId({ consensus_data: { leader_receipt: [{ execution_result: "SUCCESS", result: { status: "RETURN", payload: { readable: "0x0a" } } }] } }), "10");
});

test("does not silently default a missing identifier to zero", () => {
  assert.throws(() => decodeReturnedId({ status: "ACCEPTED" }), /FINALIZED_RETURN_ID_NOT_FOUND/);
});

test("ignores a numeric payload from a failed leader receipt", () => {
  assert.throws(() => decodeReturnedId({ consensus_data: { leader_receipt: [{ execution_result: "ERROR", result: { status: "ROLLBACK", payload: { readable: "7" } } }] } }), /FINALIZED_RETURN_ID_NOT_FOUND/);
});

test("decodes a direct primitive result payload", () => {
  assert.equal(decodeReturnedId({ result: { payload: "23" } }), "23");
});
