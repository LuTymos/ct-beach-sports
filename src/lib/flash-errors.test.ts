import assert from "node:assert/strict";
import test from "node:test";
import { messageForErrorParam } from "./flash-errors";

test("messageForErrorParam maps codes and ignores raw payloads", () => {
  assert.equal(messageForErrorParam("login"), "E-mail ou senha inválidos.");
  assert.equal(messageForErrorParam("<script>alert(1)</script>"), "Não foi possível concluir. Tente de novo.");
  assert.equal(messageForErrorParam("javascript:alert(1)"), "Não foi possível concluir. Tente de novo.");
  assert.equal(messageForErrorParam(undefined), null);
});
