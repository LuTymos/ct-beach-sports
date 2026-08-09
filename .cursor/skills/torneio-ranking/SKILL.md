---
name: torneio-ranking
description: Domínio do ranking CT Beach Sports — lançar resultados, calcular pontos, empates e múltiplos resultados por etapa. Use ao trabalhar com pontuação, admin de resultados ou ranking.
---

# Torneio Ranking — CT Beach Sports

## Quando usar

Ao criar/editar resultados, ranking, etapas ou qualquer lógica de pontos.

## Como lançar um resultado

1. Escolher atleta + etapa.
2. Escolher série (`ouro` / `prata` / `bronze`) + colocação 1–4 **ou** `participacao`.
3. Calcular com `calculatePoints(series, placement)` e gravar `points`.

## Casos

- Vários resultados na mesma etapa: permitido (ex.: 100 + 40 = 140).
- Empate no ranking: mesma pontuação → mesma posição.
- Participação não empilha com pódio.

## Referência

Ver `src/lib/scoring.ts` e `src/features/admin/actions.ts`.
