# Constituição do projeto

Princípios que valem para qualquer mudança. Detalhes operacionais ficam nas regras (`.claude/rules/`), na skill `torneio-ranking` e nos outros arquivos desta pasta.

1. **Pontos têm uma fonte só.** Todo valor de pontuação vem de `src/lib/scoring.ts`. Nenhuma página, query ou texto copia números à mão.
2. **O público lê, só o admin escreve.** A barreira é o RLS mais `requireAdmin()` nas actions e páginas admin, não a UI nem o middleware.
3. **Pagamento nunca vai a público.** `stage_entry_members.paid` só aparece em queries admin.
4. **Toda Server Action é um endpoint público.** Autentica, autoriza e valida o input no servidor, nessa ordem.
5. **O ranking é derivado.** Pontos e posições são calculados a partir de `results`; não se grava total nem posição.
6. **Segredos e migrations aplicadas não se editam.** Mudança de banco é uma migration nova.
7. **Escopo é o pedido.** Não adicionar funcionalidades fora do que foi pedido; o backlog está no Trello.
8. **Erros ao usuário são códigos mapeados**, nunca a mensagem crua do Supabase ou do Zod.

Mudar um destes princípios exige um ADR em `decisions/`.
