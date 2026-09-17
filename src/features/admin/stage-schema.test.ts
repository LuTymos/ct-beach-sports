import assert from "node:assert/strict";
import test from "node:test";
import { stageFormSchema } from "./stage-schema";

test("audit_url accepts https only", () => {
  const base = {
    title: "Etapa",
    date: "2026-03-01",
    location: "",
    status: "scheduled",
    sort_order: 0,
  };
  assert.equal(
    stageFormSchema.parse({ ...base, audit_url: "https://copafacil.com/x" }).audit_url,
    "https://copafacil.com/x"
  );
  assert.equal(stageFormSchema.parse({ ...base, audit_url: "" }).audit_url, null);
  assert.equal(stageFormSchema.safeParse({ ...base, audit_url: "http://copafacil.com/x" }).success, false);
  assert.equal(stageFormSchema.safeParse({ ...base, audit_url: "javascript:alert(1)" }).success, false);
});
