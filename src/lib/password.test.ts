import assert from "node:assert/strict";
import test from "node:test";
import { validatePassword } from "./password";

test("validatePassword requires length and letter+digit", () => {
  assert.equal(validatePassword("short1"), "password_short");
  assert.equal(validatePassword("onlylettersxx"), "password_weak");
  assert.equal(validatePassword("1234567890"), "password_weak");
  assert.equal(validatePassword("SenhaForte1"), null);
});
