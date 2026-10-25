#!/usr/bin/env node
// PreToolUse (Edit|Write): bloqueia o que não deve ser alterado por um agente.
// Exit 2 nega a chamada e devolve o stderr ao Claude.
import { existsSync } from "node:fs";
import { basename, relative, resolve } from "node:path";

const input = JSON.parse(await new Response(process.stdin).text());
const file = input.tool_input?.file_path;
if (!file) process.exit(0);

const root = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();
const rel = relative(root, resolve(root, file));
const name = basename(rel);

const deny = (reason) => {
  console.error(`Bloqueado: ${reason}`);
  process.exit(2);
};

if (name.startsWith(".env") && name !== ".env.example") {
  deny(`${rel} guarda segredos. Edite à mão; não passe pelo agente.`);
}

// As migrations são aplicadas à mão no Supabase: alterar uma existente
// faz o repositório divergir do banco. Crie uma nova (011_...).
if (/^supabase\/migrations\/.+\.sql$/.test(rel) && existsSync(resolve(root, rel))) {
  deny(`${rel} já existe e pode estar aplicada. Crie uma migration nova em vez de editá-la.`);
}
