export const TICKET_REASONS = [
  "pontuacao_errada",
  "sugestao",
  "bug",
  "nome_errado",
  "resultado_faltando",
  "outro",
] as const;

export type TicketReason = (typeof TICKET_REASONS)[number];

export const TICKET_REASON_LABELS: Record<TicketReason, string> = {
  pontuacao_errada: "Pontuação errada",
  sugestao: "Sugestão",
  bug: "Bug",
  nome_errado: "Nome / atleta errado",
  resultado_faltando: "Resultado faltando",
  outro: "Outro",
};

export function isTicketReason(value: string): value is TicketReason {
  return (TICKET_REASONS as readonly string[]).includes(value);
}
