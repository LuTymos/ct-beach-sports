export const ERROR_MESSAGES = {
  default: "Não foi possível concluir. Tente de novo.",
  invalid: "Dados inválidos. Confira os campos e tente de novo.",
  failed: "Não foi possível salvar agora. Tente de novo.",
  rate: "Muitas tentativas. Espere alguns minutos e tente de novo.",
  login: "E-mail ou senha inválidos.",
  locked: "Muitas tentativas. Espere alguns minutos e tente de novo.",
  link: "Link inválido ou expirado. Peça um novo convite ao professor.",
  session: "Abra o link novo do convite para definir a senha.",
  password_short: "Senha precisa ter ao menos 10 caracteres.",
  password_weak: "Senha precisa ter letras e números.",
  mismatch: "As senhas não coincidem.",
  name: "Nome obrigatório.",
  forbidden: "Sem permissão para esta ação.",
  not_found: "Registro não encontrado.",
  duplicate: "Este atleta já está inscrito nesta categoria nesta etapa.",
  pair: "A dupla precisa ter exatamente 2 atletas diferentes.",
  csv: "Arquivo CSV inválido.",
  csv_type: "Envie um arquivo CSV de texto (.csv).",
  csv_size: "CSV muito grande (máx. 512 KB).",
  csv_rows: "CSV com demasiadas linhas (máx. 400).",
  stage: "Selecione a etapa.",
  file: "Envie um arquivo CSV.",
  placement: "Informe a colocação 1–4.",
  category: "Categoria ou nível inválido.",
  points: "Pontuação inválida.",
  import: "Importação bloqueada. Confira o arquivo.",
} as const;

export type ErrorCode = keyof typeof ERROR_MESSAGES;

export function isErrorCode(value: string): value is ErrorCode {
  return Object.prototype.hasOwnProperty.call(ERROR_MESSAGES, value);
}

export function messageForErrorParam(raw: string | undefined | null): string | null {
  if (!raw) return null;
  if (!/^[a-z0-9_-]{1,64}$/i.test(raw)) {
    return ERROR_MESSAGES.default;
  }
  if (isErrorCode(raw)) return ERROR_MESSAGES[raw];
  return ERROR_MESSAGES.default;
}

export function errorQuery(code: ErrorCode): string {
  return `error=${encodeURIComponent(code)}`;
}
