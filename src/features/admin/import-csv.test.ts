import assert from "node:assert/strict";
import test from "node:test";
import { MAX_IMPORT_ROWS, parseImportCsv } from "./import-csv";

const header = "atleta,categoria,nivel,serie,colocacao";

test("parseImportCsv scores via calculatePoints", () => {
  const parsed = parseImportCsv(
    `${header}\nAna,misto,iniciante,ouro,1\n`
  );
  assert.equal(parsed.ok, true);
  if (parsed.ok) {
    assert.equal(parsed.rows[0]?.points, 100);
  }
});

test("parseImportCsv rejects too many data rows", () => {
  const rows = Array.from({ length: MAX_IMPORT_ROWS + 1 }, (_, i) =>
    `A${i},misto,iniciante,participacao,`
  );
  const parsed = parseImportCsv([header, ...rows].join("\n"));
  assert.equal(parsed.ok, false);
  if (!parsed.ok) {
    assert.match(parsed.errors[0] ?? "", /demasiadas linhas/);
  }
});

test("parseImportCsv rejects NUL bytes", () => {
  const parsed = parseImportCsv(`${header}\nAna,misto,iniciante,ouro,1\u0000`);
  assert.equal(parsed.ok, false);
});
