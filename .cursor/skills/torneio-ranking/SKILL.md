---
name: torneio-ranking
description: Domínio do ranking CT Beach Sports — lançar resultados, calcular pontos, empates e múltiplos resultados por etapa. Use ao trabalhar com pontuação, admin de resultados ou ranking.
---

# Torneio Ranking — CT Beach Sports

## Quando usar

Ao criar/editar resultados, ranking, etapas ou qualquer lógica de pontos.

## Como lançar um resultado

1. Escolher atleta + etapa.
2. Escolher **categoria** (`misto` / `masculino` / `feminino`) e **nível** (`iniciante` / `intermediario` / `avancado`).
3. Escolher série (`ouro` / `prata` / `bronze`) + colocação 1–4, **ou** `bronzinho` + colocação 1–4 (sempre 5 pts), **ou** `participacao` (5 pts, sem colocação).
4. Calcular com `calculatePoints(series, placement)` e gravar `points`.

## Ranking

- Colunas por categoria: posição no ranking da categoria + pontos na categoria.
- Abas por nível (`?nivel=`).
- Total = soma das categorias (mesma tabela de pontos).

## Casos

- Vários resultados na mesma etapa: permitido (ex.: 100 + 40 = 140).
- Empate no ranking: mesma pontuação → mesma posição.
- Participação: 5 pts sem pódio.
- Bronzinho: registra 1º–4º, mas vale sempre 5 pts.

## Referência

Ver `src/lib/scoring.ts`, `src/lib/categories.ts` e `src/features/admin/actions.ts`.
