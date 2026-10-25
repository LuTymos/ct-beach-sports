#!/usr/bin/env node
// PostToolUse (Edit|Write): confere o arquivo recém-editado.
// Exit 2 devolve o stderr ao Claude para corrigir; a edição já aconteceu.
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { relative, resolve } from "node:path";

const input = JSON.parse(await new Response(process.stdin).text());
const file = input.tool_input?.file_path;
if (!file) process.exit(0);

const root = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();
const abs = resolve(root, file);
const rel = relative(root, abs);
if (rel.startsWith("..") || !existsSync(abs)) process.exit(0);

const problems = [];

// `npm test` usa uma lista fixa de arquivos: teste novo fora dela nunca roda.
if (/\.test\.tsx?$/.test(rel)) {
  const scripts = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8")).scripts ?? {};
  if (!scripts.test?.includes(rel)) {
    problems.push(`${rel} não está no script "test" do package.json, então \`npm test\` não o executa. Adicione o caminho.`);
  }
}

// Sem node_modules (ambiente sem install) o lint é pulado, não falha.
// --quiet: só erros; avisos antigos não devem interromper uma edição.
const eslint = resolve(root, "node_modules/.bin/eslint");
if (/\.(ts|tsx|mjs)$/.test(rel) && existsSync(eslint)) {
  const lint = spawnSync(eslint, ["--quiet", rel], { cwd: root, encoding: "utf8" });
  if (lint.status !== 0) {
    problems.push(`ESLint em ${rel}:\n${(lint.stdout + lint.stderr).trim()}`);
  }
}

if (problems.length > 0) {
  console.error(problems.join("\n\n"));
  process.exit(2);
}
