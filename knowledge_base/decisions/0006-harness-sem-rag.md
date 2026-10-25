# 0006. Contexto do agente em arquivos, sem RAG

- Status: aceita
- Data: 2026-10-25

## Contexto

Foi avaliado um RAG para dar contexto ao agente. O repositório é pequeno (cerca de 2.800 linhas em `features/`, 10 migrations, regras curtas), e o agente já acha o que precisa com busca por texto.

## Decisão

Usar um harness de arquivos: `CLAUDE.md` enxuto, regras por caminho em `.claude/rules/`, skills, esta `knowledge_base/` e hooks em `.claude/hooks/` para o que precisa valer sempre. Sem embeddings nem banco vetorial.

## Consequências

- Custo e manutenção quase nulos; tudo versionado no git.
- Reavaliar RAG se houver muito texto livre (regulamentos de várias temporadas, histórico de comunicados) que não caiba no contexto.
- Um assistente público para os alunos seria um produto novo, com decisão e card próprios, e deveria responder com dados do banco, não por similaridade.
