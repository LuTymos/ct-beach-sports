# 0001. Pontuação tem uma fonte única

- Status: aceita
- Data: 2026-10-25 (registra decisão anterior)

## Contexto

Os pontos aparecem no admin, no import CSV, no fechamento de etapas e em páginas públicas.

## Decisão

Todo valor vem de `src/lib/scoring.ts` (`calculatePoints` e constantes exportadas). Nada copia os números à mão.

## Consequências

- Mudar uma regra é mudar um arquivo.
- Páginas que explicam a pontuação devem renderizar a partir desse módulo; a página `/pontuacao` ainda não faz isso (card "Como pontua?" no Trello).
- Pontuação configurável pelo professor (card F4) exigirá mover os valores para o banco; isso será um ADR novo.
