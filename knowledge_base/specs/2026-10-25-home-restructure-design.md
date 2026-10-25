# Reestruturação da home (`/`)

Design curto. Mudança pequena: só a camada de UI da home, sem banco, sem regra de negócio.

## Intenção

A home atende dois públicos: o **aluno**, que volta para ver o ranking e a próxima etapa, e o **visitante novo**, que quer conhecer o CT. Hoje ela é quatro blocos centralizados (hero, etapa em destaque, Top 3, "Como pontua?") sem nenhum elemento visual do CT.

## Direção escolhida: "Ranking primeiro" (opção A do mockup)

Ordem da página, de cima para baixo:

1. **Pódio do ranking**: 2º, 1º, 3º lado a lado, com o 1º em destaque (âmbar). Cada posição leva a `/atletas/[id]`. Acima do pódio, 4 chips de filtro: **Geral** (padrão), Masculino, Misto e Feminino. Botões "Ver ranking completo" (`/ranking`) e "Como pontua" (`/pontuacao`).
   - Filtro por link, sem JavaScript: cada chip é um `<Link>` com `?podio=<categoria>`; Geral é a URL sem parâmetro. Mesmo padrão do `CategoryTabs` do `/ranking`.
   - O parâmetro é `podio`, e não `categoria`, para não cair no redirect de links antigos (`rankingRedirectFromHomeSearch`). Valor inválido cai em Geral.
   - Uma única chamada a `getCategoryRanking()`: `totalPoints` é o Geral e `toSingleCategoryRanking()` gera cada categoria. Substitui `getOverallRanking()` na home. Sem query nova.
   - Categoria sem resultado: "Nenhum resultado em <categoria> ainda."
2. **Etapa em destaque**: próxima etapa agendada, ou a última realizada (já resolvido por `getHomeFeaturedStage`). Data, local e selo de status; o card inteiro leva a `/etapas/[id]`.
3. **Conheça o CT**: texto curto sobre o CT, um placeholder de foto da quadra e o botão "Fale com a gente" (`/contato`), mais link para `/sobre`.

O bloco "Como pontua?" atual sai da home; o botão "Como pontua" do pódio cobre o caso.

## Objetivos

- O aluno vê pódio e próxima etapa sem rolar muito.
- O visitante novo entende o que é o CT e como falar com ele.
- Visual coerente com o que o projeto já usa: tokens do `globals.css`, Geist, âmbar como destaque do 1º lugar.
- Funciona bem sem fotos hoje e aceita fotos reais depois trocando um único componente.

## Não objetivos

- Horários, endereço e níveis editáveis pelo admin (backlog "configs" do Trello).
- Mudar `/sobre`, `/ranking`, o header ou o rodapé.
- Animações, carrossel ou qualquer interação client-side.

## Anti-objetivos

- A home não pode parecer inacabada. Por isso o bloco "Horários / Níveis / Local" do mockup **não entra** até existir dado real.
- Nenhum nome ou número inventado aparece em produção; tudo vem de `getOverallRanking` e `getHomeFeaturedStage`.
- Não quebrar o redirect de links antigos com filtros (`rankingRedirectFromHomeSearch`).

## Restrições

- Server Components, sem `"use client"`. Dados via `queries.ts` da feature.
- Tailwind 4 + componentes shadcn já existentes (`Card`, `Button`, `Badge`); classes com `cn()`.
- Sem domínio externo (imagem, fonte, script), para não mexer na CSP de `next.config.ts`.
- Sem Supabase configurado a página continua renderizando (`isSupabaseConfigured`), com estados vazios.
- Funciona em celular e nos temas claro e escuro. O `h1` atual usa `text-black` fixo e não respeita o tema escuro; corrigir.

## Abordagens consideradas

1. **Seções separadas em `src/features/home/` (escolhida).** Um Server Component por bloco; `page.tsx` só compõe. Combina com a regra do projeto de UI da feature perto do domínio (já é assim em `features/ranking`). Custo: mais arquivos.
2. **Tudo em `page.tsx`.** Menor diff, mas o arquivo cresce e a troca futura das fotos fica espalhada. Descartada.
3. **Conteúdo do CT editável pelo admin.** Funcionalidade nova, fora do escopo. Descartada.

## Estrutura de arquivos

```
src/app/page.tsx                          composição + redirect (sem lógica de layout)
src/features/home/home-podium.tsx         pódio + chips de filtro (recebe categoria ativa e as 3 primeiras linhas)
src/features/home/home-podium-filter.ts   interpreta `?podio=` e escolhe as 3 primeiras linhas (função pura, com teste)
src/features/home/home-featured-stage.tsx etapa em destaque (recebe Stage)
src/features/home/home-ct-intro.tsx       apresentação do CT + CTA de contato
src/features/home/ct-photo.tsx            placeholder de foto; ponto único para trocar por imagem real
```

Os componentes recebem dados por props (serializáveis) e não fazem fetch; `page.tsx` continua chamando as queries.

## Decisões minhas (podem ser corrigidas)

- Copy dos textos (título, chamada e parágrafo do CT) em português, curto, a partir do que `/sobre` já diz. Você revisa na hora de ver a página.
- Quatro chips (Geral padrão), por decisão sua: sem o Geral a home abriria mostrando só uma categoria. Um atleta que pontuou em mais de uma categoria aparece no pódio de cada uma.
- Se houver menos de 3 atletas no filtro, mostra só os existentes; se não houver nenhum no Geral, mostra o estado vazio atual ("Nenhum resultado lançado ainda.").
- Copy básica gerada por mim; você troca depois.
- `CtPhoto` desenha uma faixa listrada com os tokens do tema e um rótulo discreto, sem texto de "placeholder" visível ao público: só a faixa.
- O botão "Como pontua" aponta para `/pontuacao`, página que já existe.

## Fica para quem constrói

- Espaçamentos, tamanhos de tipo e responsividade dentro do que o mockup mostrou.
- Acessibilidade: ordem de foco, `aria-label` no pódio, contraste do âmbar nos dois temas.
- Testes: a função pura de `home-podium-filter.ts` (valor inválido cai em Geral, menos de 3 atletas, empate com mesma posição) ganha `home-podium-filter.test.ts`, **adicionado ao script `test` do `package.json`** (o `npm test` não descobre testes sozinho). Validação também por `npm run lint`, `npm run build` e conferência visual da página.
- Atualizar `knowledge_base/flows.md` se descrever a home.
