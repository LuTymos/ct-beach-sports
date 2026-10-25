# 0000. Registrar decisões em ADRs (MADR mínimo)

- Status: aceita
- Data: 2026-10-25

## Contexto

Decisões de arquitetura e de regra de negócio ficavam só na cabeça de quem as tomou, e um agente de IA não as enxerga no código.

## Decisão

Registrar cada decisão relevante em `knowledge_base/decisions/NNNN-titulo.md`, no formato MADR mínimo (contexto, decisão, consequências), versionado junto com o código e revisado na mesma PR.

## Consequências

- Quem questionar uma regra encontra o motivo antes de mudá-la.
- Cada decisão nova custa um arquivo curto. Decisões óbvias ou reversíveis em minutos não precisam de ADR.
