# Glossário

| Termo | Significado no projeto |
| --- | --- |
| **Etapa** (`stages`) | Um dia de torneio. Status `scheduled` ou `completed`. |
| **Série** | Divisão da disputa: `ouro`, `prata`, `bronze`. Tem pódio de 1º a 4º com tabela de pontos própria. |
| **Bronzinho** | Disputa à parte com colocação de 1º a 4º, mas **sempre 5 pontos**. Não usa a tabela das séries. |
| **Participação** | 5 pontos, sem colocação. Dada a quem jogou e não pontuou no pódio. |
| **Categoria** | `masculino`, `misto` ou `feminino`. Fica no resultado, não no atleta. |
| **Nível** | `iniciante`, `intermediario` ou `avancado`. Fica no resultado, não no atleta. |
| **Resultado** (`results`) | Linha de pontos de um atleta numa etapa (série, colocação, categoria, nível). Um atleta pode ter vários na mesma etapa. |
| **Dupla / inscrição** (`stage_entries`) | Par de atletas inscrito numa etapa, em uma categoria e nível. Tem 2 `stage_entry_members`. |
| **Pódio da inscrição** | Série e colocação marcadas na dupla; gera um resultado para cada integrante. |
| **Fechar etapa** | Cria Participação para quem não pontuou e marca a etapa como `completed`. |
| **Ranking geral** | Soma de `results.points` por atleta, com abas por categoria (incluindo "Todos") e por nível. Empate recebe a mesma posição. |
| **Link de auditoria** (`audit_url`) | URL pública da etapa para conferência dos resultados; passa por validação de URL. |
| **Ticket** (`contact_tickets`) | Mensagem do formulário `/contato`, tratada pelo admin em `/admin/tickets`. |
