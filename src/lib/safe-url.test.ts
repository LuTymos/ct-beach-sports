import assert from "node:assert/strict";
import test from "node:test";
import { safeHttpsHref, safeInternalPath } from "./safe-url";

test("safeInternalPath keeps in-app paths", () => {
  assert.equal(safeInternalPath("/conta/definir-senha", "/x"), "/conta/definir-senha");
  assert.equal(safeInternalPath("/admin?ok=1", "/x"), "/admin?ok=1");
});

test("safeInternalPath rejects open redirects", () => {
  assert.equal(safeInternalPath("//evil.example", "/safe"), "/safe");
  assert.equal(safeInternalPath("/\\evil.example", "/safe"), "/safe");
  assert.equal(safeInternalPath("https://evil.example", "/safe"), "/safe");
  assert.equal(safeInternalPath("/https://evil.example", "/safe"), "/safe");
  assert.equal(safeInternalPath("/@evil.example", "/safe"), "/safe");
});

test("safeHttpsHref allows only https", () => {
  assert.equal(safeHttpsHref("https://copafacil.com/x"), "https://copafacil.com/x");
  assert.equal(safeHttpsHref("http://copafacil.com/x"), null);
  assert.equal(safeHttpsHref("javascript:alert(1)"), null);
  assert.equal(safeHttpsHref("https://user:pass@evil.example"), null);
});
