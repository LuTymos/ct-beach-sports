# Reestruturação da home Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trocar a home `/` por três blocos (pódio com 4 chips de filtro, etapa em destaque, apresentação do CT) feitos de Server Components em `src/features/home/`.

**Architecture:** `page.tsx` só lê `searchParams`, chama `getHomeFeaturedStage()` e `getCategoryRanking()` (uma vez) e compõe os componentes. A escolha do filtro e do pódio é lógica pura em `home-podium-filter.ts`, testada. O filtro é um `<Link>` com `?podio=`, sem JavaScript de cliente.

**Tech Stack:** Next.js 16 (App Router, RSC), React 19, Tailwind 4, shadcn (`Card`, `Button`, `Badge`), `date-fns` (ptBR), `tsx --test`.

**Spec:** `knowledge_base/specs/2026-10-25-home-restructure-design.md`

## Global Constraints

- Server Components apenas; nenhum `"use client"`.
- Sem domínio externo (imagem, fonte, script): a CSP de `next.config.ts` não muda.
- Parâmetro do filtro é `podio` (nunca `categoria`, que redireciona para `/ranking`). Valor inválido ou repetido cai em Geral.
- Chips, nesta ordem: Geral (padrão, URL `/` sem query), Masculino, Misto, Feminino (ordem de `RESULT_CATEGORIES`).
- Pontos só via dados do banco; nenhum nome ou número inventado na UI.
- Cores só por tokens do tema (`bg-card`, `text-muted-foreground`, `border-border`, `primary`...); âmbar só no 1º lugar. Funcionar em tema claro e escuro e em ~400px.
- Novo `*.test.ts` entra no script `test` do `package.json`.
- Commits e push só quando o usuário pedir (regra do projeto): sem commit por tarefa; um passo final pergunta.
- Antes de usar API do Next que não conheça, ler `node_modules/next/dist/docs/`.

## Review Focus

1. `?podio=` inválido, vazio ou repetido (`string[]`) → Geral, sem erro. (Task 1)
2. `?podio=misto` não pode disparar o redirect de links antigos para `/ranking`. (Task 1)
3. Menos de 3 atletas no filtro, ou nenhum: pódio com os existentes e estado vazio com o nome da categoria; sem Supabase configurado a página renderiza. (Tasks 1, 3, 4)
4. Empate no 1º lugar: os dois mostram "1º" e o destaque âmbar segue a posição, não o índice. (Tasks 1, 3)
5. Nome longo de atleta ou de equipe não pode estourar o pódio no celular. (Task 3)

---

### Task 1: Lógica do filtro do pódio

**Files:**
- Create: `src/features/home/home-podium-filter.ts`
- Test: `src/features/home/home-podium-filter.test.ts`
- Modify: `package.json` (script `test`: acrescentar `src/features/home/home-podium-filter.test.ts` ao final da lista)

**Interfaces:**
- Consumes: `CategoryRankingRow`, `RankingRow` de `@/types`; `ResultCategory`, `RESULT_CATEGORIES`, `isResultCategory` de `@/lib/categories`; `toSingleCategoryRanking(rows, category): RankingRow[]` de `@/features/ranking/to-single-category-ranking`; `rankingRedirectFromHomeSearch` de `@/features/ranking/ranking-href` (só no teste).
- Produces:
  - `type PodiumFilter = ResultCategory | "geral"`
  - `const PODIUM_QUERY_KEY = "podio"`
  - `parsePodiumFilter(value: string | string[] | undefined): PodiumFilter`
  - `buildPodiumHref(filter: PodiumFilter): string` (Geral → `"/"`, senão `"/?podio=<categoria>"`)
  - `pickPodium(rows: CategoryRankingRow[], filter: PodiumFilter): RankingRow[]` (no máximo 3, em ordem de ranking, `position` preservada)
  - `arrangePodium(top: RankingRow[]): [RankingRow | null, RankingRow | null, RankingRow | null]` (ordem visual: 2º, 1º, 3º; `null` onde falta atleta)

- [ ] **Step 1: Write the failing test** em `home-podium-filter.test.ts`, com um helper `row(id, name, total, byCategory?)` que monta `CategoryRankingRow` (`byCategory` com `null` nas três categorias por padrão, `position` calculada pelo teste):

```ts
test("parsePodiumFilter falls back to geral", () => {
  assert.equal(parsePodiumFilter(undefined), "geral");
  assert.equal(parsePodiumFilter(""), "geral");
  assert.equal(parsePodiumFilter("xyz"), "geral");
  assert.equal(parsePodiumFilter(["misto", "feminino"]), "geral");
  assert.equal(parsePodiumFilter("misto"), "misto");
});

test("buildPodiumHref omits the query for geral", () => {
  assert.equal(buildPodiumHref("geral"), "/");
  assert.equal(buildPodiumHref("feminino"), "/?podio=feminino");
});

test("podio param does not trigger the legacy ranking redirect", () => {
  assert.equal(rankingRedirectFromHomeSearch({ podio: "misto" } as never), null);
});

test("pickPodium geral returns the top 3 by total, keeping tied positions", () => {
  // 4 atletas: A=100, B=80, C=80, D=10 (posições 1, 2, 2, 4)
  const top = pickPodium(rows, "geral");
  assert.deepEqual(top.map((r) => r.name), ["A", "B", "C"]);
  assert.deepEqual(top.map((r) => r.position), [1, 2, 2]);
});

test("pickPodium by category uses that category's points and ignores athletes without it", () => {
  // só 2 atletas têm pontos em "feminino": esperado 2 linhas, totalPoints = pontos da categoria
});

test("pickPodium returns [] for empty input", () => {
  assert.deepEqual(pickPodium([], "geral"), []);
  assert.deepEqual(pickPodium([], "misto"), []);
});

test("arrangePodium orders 2nd, 1st, 3rd and pads with null", () => {
  // 3 linhas [a,b,c] → [b,a,c]; 1 linha [a] → [null,a,null]; [] → [null,null,null]
});
```

- [ ] **Step 2: Run test to verify it fails.** Run: `npx tsx --test src/features/home/home-podium-filter.test.ts`. Expected: FAIL com "Cannot find module './home-podium-filter'".
- [ ] **Step 3: Implement** as cinco exports acima em `home-podium-filter.ts`. `pickPodium` para Geral mapeia `CategoryRankingRow` → `RankingRow` (`athleteId, name, team, totalPoints, position`) e faz `slice(0, 3)`; para categoria usa `toSingleCategoryRanking(rows, filter).slice(0, 3)`. `parsePodiumFilter` aceita só `string` não vazio que passe em `isResultCategory`.
- [ ] **Step 4: Run test to verify it passes.** Run: `npx tsx --test src/features/home/home-podium-filter.test.ts`. Expected: todos os testes PASS.
- [ ] **Step 5: Add the test to `package.json`** e rodar `npm test`. Expected: suíte inteira PASS, incluindo o arquivo novo.

---

### Task 2: `CtPhoto` e `HomeCtIntro`

**Files:**
- Create: `src/features/home/ct-photo.tsx`
- Create: `src/features/home/home-ct-intro.tsx`

**Interfaces:**
- Consumes: `Button` de `@/components/ui/button`; `cn` de `@/lib/utils`.
- Produces:
  - `CtPhoto({ className }: { className?: string }): JSX.Element` — faixa listrada decorativa (`aria-hidden`), listras em diagonal com `--muted` e `--accent` do tema, proporção ~16/7, `rounded-xl`, sem texto. É o único ponto a trocar quando houver foto real.
  - `HomeCtIntro(): JSX.Element` — `<section>` com `<h2>Conheça o CT</h2>`, `CtPhoto`, o parágrafo abaixo, botão "Fale com a gente" (`/contato`, `Button asChild`) e link "Saiba mais sobre o CT" (`/sobre`).

- [ ] **Step 1: Implement `CtPhoto`** em `ct-photo.tsx` (Server Component, sem props além de `className`).
- [ ] **Step 2: Implement `HomeCtIntro`** em `home-ct-intro.tsx` com esta copy básica (o usuário troca depois): "O CT Beach Sports é um centro de treinamento de vôlei de praia para todos os níveis, do primeiro contato com a areia ao jogo competitivo. Durante a temporada, os alunos disputam um circuito próprio de etapas e acompanham o ranking aqui."
- [ ] **Step 3: Verify.** Run: `npx tsc --noEmit && npm run lint -- src/features/home`. Expected: sem erros.

---

### Task 3: `HomePodium` e `HomeFeaturedStage`

**Files:**
- Create: `src/features/home/home-podium.tsx`
- Create: `src/features/home/home-featured-stage.tsx`

**Interfaces:**
- Consumes (Task 1): `PodiumFilter`, `buildPodiumHref`, `arrangePodium`. Além disso: `RANKING_PATH` de `@/features/ranking/ranking-href`; `CATEGORY_LABELS`, `RESULT_CATEGORIES` de `@/lib/categories`; `RankingRow`, `Stage` de `@/types`; `Card`, `Badge`, `Button`.
- Produces:
  - `HomePodium({ active, top }: { active: PodiumFilter; top: RankingRow[] }): JSX.Element` — `top` já vem de `pickPodium`.
  - `HomeFeaturedStage({ stage }: { stage: Stage }): JSX.Element`

- [ ] **Step 1: Implement `HomePodium`.**
  - Chips em `<nav aria-label="Filtrar pódio">`: Geral, depois `RESULT_CATEGORIES` com `CATEGORY_LABELS`; cada um é `Link` para `buildPodiumHref`, com as mesmas classes dos chips de `src/features/ranking/category-tabs.tsx` (ativo: `border-primary bg-primary text-primary-foreground`; `aria-current="page"` no ativo).
  - Pódio: `<ol>` em grid de 3 colunas com `arrangePodium(top)`; célula `null` fica vazia (`<li aria-hidden>` ou omitida mantendo o grid). Cada célula é `Link` para `/atletas/${athleteId}` com posição (`{position}º`), nome, equipe (`team ?? "—"`) e `{totalPoints} pts`. Destaque âmbar e maior altura quando `row.position === 1` (não pelo índice). Textos com `min-w-0` e `truncate` (nome e equipe).
  - Vazio (`top.length === 0`): Geral → "Nenhum resultado lançado ainda."; categoria → `Nenhum resultado em ${CATEGORY_LABELS[active]} ainda.` (mesmo estilo tracejado da home atual).
  - Rodapé: `Button` "Ver ranking completo" → `RANKING_PATH` e `Button variant="outline"` "Como pontua" → `/pontuacao`.
- [ ] **Step 2: Implement `HomeFeaturedStage`** portando o card atual de `src/app/page.tsx` (título "Próxima etapa" quando `status === "scheduled"`, senão "Destaque da última etapa"; data com `format(parseISO(date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })`; local opcional; `Badge` Agendada/Realizada; card inteiro é `Link` para `/etapas/${stage.id}`), trocando os gradientes e cores fixas por tokens do tema.
- [ ] **Step 3: Verify.** Run: `npx tsc --noEmit && npm run lint -- src/features/home`. Expected: sem erros.

---

### Task 4: Compor `page.tsx`

**Files:**
- Modify: `src/app/page.tsx` (reescrever o corpo; manter `metadata`, o `redirect` de links antigos e `isSupabaseConfigured`)

**Interfaces:**
- Consumes: tudo de Tasks 1–3; `getHomeFeaturedStage`, `getCategoryRanking` de `@/features/ranking/queries`.
- Produces: rota `/` com `searchParams: Promise<{ nivel?: string; categoria?: string; q?: string; page?: string; podio?: string | string[] }>`.

- [ ] **Step 1: Reescrever `HomePage`:** `await searchParams`; se `rankingRedirectFromHomeSearch(params)` devolver destino, `redirect` (como hoje); `const filter = parsePodiumFilter(params.podio)`; quando configurado, `Promise.all([getHomeFeaturedStage(), getCategoryRanking()])`, senão `[null, []]`; `top = pickPodium(categoryRows, filter)`.
- [ ] **Step 2: Layout.** Container `space-y-12 py-4`: `<h1>` "Ranking 2026" (tamanho moderado, `text-foreground`, nunca `text-black`), `HomePodium`, `HomeFeaturedStage` (só se houver etapa), `HomeCtIntro`. Remover hero, bloco "Como pontua?" e imports que ficarem sem uso (`SERIES_LABELS`, `PARTICIPATION_POINTS`, `getOverallRanking`).
- [ ] **Step 3: Verify.** Run: `npx tsc --noEmit && npm run lint`. Expected: sem erros nem warnings novos.

---

### Task 5: Verificação, docs e fechamento

**Files:**
- Modify: `knowledge_base/flows.md` (somente se descrever a home; conferir com `grep -n -i "home\|vitrine" knowledge_base/flows.md`)

- [ ] **Step 1: Suíte e build.** Run: `npm test && npm run lint && npm run build`. Expected: tudo PASS e build concluído.
- [ ] **Step 2: Conferência visual** com `npm run dev` e Playwright (já instalado): capturar `/` e `/?podio=feminino` em 390px e 1280px, tema claro e escuro; ler as imagens. Confirmar: chip ativo correto, sem rolagem horizontal, pódio legível, âmbar só no 1º, sem texto cortado. Confirmar por requisição que `/?categoria=misto` redireciona para `/ranking?categoria=misto` e que `/?podio=xyz` mostra Geral. Se o Supabase não estiver configurado no ambiente, validar os estados vazios e dizer que o pódio com dados reais não foi visto.
- [ ] **Step 3: Docs.** Atualizar `knowledge_base/flows.md` se a home aparecer lá; senão registrar que não havia o que mudar.
- [ ] **Step 4: Fechar.** Usar `superpowers:verification-before-completion` e, depois, `superpowers:finishing-a-development-branch`. Perguntar ao usuário se pode commitar e dar push na branch `ccr-e011f75e-7gnz3q` (regra do projeto: não commitar sem pedido).
