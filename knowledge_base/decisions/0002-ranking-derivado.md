# 0002. O ranking é calculado, não armazenado

- Status: aceita
- Data: 2026-10-25 (registra decisão anterior)

## Contexto

O ranking tem várias visões: geral, por categoria, por nível e por etapa.

## Decisão

Não existe tabela de ranking. `src/features/ranking/queries.ts` soma `results.points` e atribui posições a cada leitura; empate recebe a mesma posição.

## Consequências

- Corrigir um resultado corrige todas as visões, sem recalcular nada.
- O custo cresce com o número de resultados; hoje é pequeno. Se virar problema, o caminho é cache por `revalidatePath`, não uma tabela de totais.
- Paginação fatia a lista depois de calcular, para as posições continuarem corretas.
