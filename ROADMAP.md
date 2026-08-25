# Roadmap — Ranking CT Beach Sports

Visão de produto em fases. Regras de negócio, escopo fino e critérios de aceite serão definidos ao refinar cada etapa.

**Contínuo (entre todas as fases):** melhorias de UI/UX conforme tarefas no Gira.

```
MVP (hoje)
  │  ranking geral · por etapa · ficha · admin CRUD · import CSV
  ▼
┌─ 1  Páginas institucionais
├─ 2  Inscrições em etapas
├─ 3  Perfil do atleta mais completo
├─ 4  Otimização de configurações
├─ 5  Chaveamento, placar e registro no app
└─ 6  Anúncios / patrocínios
         │
         └── UI/UX contínua (Gira) ──→ em paralelo a cada fase
```

---

## 1. Páginas institucionais

Criar páginas de conteúdo do CT Beach Sports: como funciona o ranking, professores, horários, arena e correlatos.

- Público entende o torneio e o CT sem depender só do ranking.
- Base de conteúdo para o site institucional + produto.

---

## 2. Inscrições em etapas

Inscrição de atletas nas etapas.

| Momento | Quem inscreve |
| ------- | ------------- |
| Agora (nesta fase) | Professor (admin) |
| Depois | Conta do atleta (depende de custo/limites do Supabase) — candidato à fase seguinte ou extensão desta |

- Reduz retrabalho de lista manual.
- Conta do atleta fica condicionada a avaliação de custo (Auth / MAU no free tier).

---

## 3. Perfil do atleta mais completo

Ficha rica com histórico e estatísticas.

Exemplos (a refinar): etapas participadas, vezes em 1º / 2º / 3º, evolução por etapa, taxa de vitórias, etc.

- Mais engajamento e motivo para o aluno voltar ao site.
- Reaproveita dados já lançados no MVP.

---

## 4. Otimização de configurações

Ferramentas e flexibilidade para o professor operar o torneio.

Exemplos (a refinar): regras de pontuação customizadas, lançamento rápido por etapa, etc.

- Menos tempo no admin, menos erro no dia da etapa.
- Pontuação continua com fonte única de verdade (hoje: `scoring.ts`); customização entra com cuidado na fase de refino.

---

## 5. Chaveamento, pontuação e registro direto pelo app

Fluxo de chaveamento estilo Copa Fácil dentro do app, com placar marcado na hora.

- Do bracket ao resultado sem planilha paralela.
- Maior mudança de produto: do “ranking pós-etapa” para “operação ao vivo”.

---

## 6. Anúncios customizados

Inserir propaganda de patrocinadores entre telas e gerar receita.

- Monetização alinhada ao público do torneio.
- Contato comercial / inventário de slots a definir no refino.

---

## Notas

- Ordem acima é a direção preferida; fases podem ser reordenadas ou fatiadas ao priorizar no Gira.
- UI/UX não é uma fase isolada: entra como tarefas contínuas entre (e dentro de) cada etapa.
- Este arquivo é o mapa; specs e regras de negócio vêm depois, por tarefa.
