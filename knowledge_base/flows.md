# Fluxos

Como as linhas de `results` nascem. Há **três origens**; o ranking não diferencia entre elas.

## 1. Lançamento manual (`/admin/resultados`)

Admin escolhe atleta, etapa, categoria, nível e série (+ colocação 1–4, exceto participação). `calculatePoints` define `points`. Um atleta pode ter vários resultados na mesma etapa.

## 2. Import CSV (`/admin/importacao`)

- Uma planilha por etapa. Colunas: `atleta,categoria,nivel,serie,colocacao`; aceita `,` ou `;`.
- Atleta por **nome exato** (com trim); se não existe, é criado.
- Duplicata na mesma etapa (atleta + categoria + nível + série + colocação) é ignorada.
- Limites: 512 KB e 400 linhas. Pontos sempre por `calculatePoints`.

## 3. Inscrição de duplas (`/admin/etapas/[id]/inscricoes`)

1. **Inscrever:** 2 atletas diferentes, mais categoria e nível. Cada atleta só entra uma vez por categoria na etapa.
2. **Pagamento:** o admin marca `paid` por atleta. Não aparece na página pública `/etapas/[id]`.
3. **Marcar pódio:** grava série e colocação na dupla e **gera um resultado por integrante** via `calculatePoints`. Desfazer o pódio apaga esses resultados gerados.
4. **Fechar etapa:** cria Participação (5 pts) para os inscritos sem pódio e muda `stages.status` para `completed`.

## Do resultado ao ranking

`getOverallRanking`, `getCategoryRanking` e `getStageRanking` (`src/features/ranking/queries.ts`) somam `results.points` na hora e numeram posições; mesma pontuação, mesma posição. Qualquer mutation que mude `results` precisa de `revalidatePath` em `/`, `/ranking` e nas páginas da etapa e do atleta.

## Contas e acesso

- **Admin:** login em `/admin/login`; promoção a admin é feita no SQL Editor (claim em `app_metadata`).
- **Atleta:** o admin convida; o atleta ativa em `/conta/ativar` e define a senha. Cadastro público fica desligado no Supabase Auth.
- **Rate limit:** login admin, login do atleta e contato.
