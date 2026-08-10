import { z } from "zod";
import {
  isResultCategory,
  isResultLevel,
  type ResultCategory,
  type ResultLevel,
} from "@/lib/categories";
import {
  calculatePoints,
  isParticipationOnly,
  type Placement,
  type Series,
} from "@/lib/scoring";

const SERIES = ["ouro", "prata", "bronze", "bronzinho", "participacao"] as const;

export type ImportCsvRow = {
  line: number;
  athlete: string;
  category: ResultCategory;
  level: ResultLevel;
  series: Series;
  placement: Placement | null;
  points: number;
};

export type ImportCsvParseSuccess = {
  ok: true;
  rows: ImportCsvRow[];
};

export type ImportCsvParseFailure = {
  ok: false;
  errors: string[];
};

const REQUIRED_HEADERS = ["atleta", "categoria", "nivel", "serie", "colocacao"] as const;

function detectDelimiter(headerLine: string): "," | ";" {
  const commas = (headerLine.match(/,/g) ?? []).length;
  const semis = (headerLine.match(/;/g) ?? []).length;
  return semis > commas ? ";" : ",";
}

function splitCsvLine(line: string, delimiter: "," | ";"): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === delimiter && !inQuotes) {
      cells.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  cells.push(current);
  return cells.map((cell) => cell.trim());
}

function normalizeHeader(value: string): string {
  return value
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

const rowSchema = z.object({
  atleta: z.string().trim().min(1, { error: "atleta vazio" }),
  categoria: z.string().trim().min(1, { error: "categoria vazia" }),
  nivel: z.string().trim().min(1, { error: "nivel vazio" }),
  serie: z.string().trim().min(1, { error: "serie vazia" }),
  colocacao: z.string().trim(),
});

function parsePlacement(raw: string, series: Series): Placement | null {
  if (isParticipationOnly(series)) {
    if (raw === "") return null;
    throw new Error("participacao nao aceita colocacao");
  }
  if (raw === "") {
    throw new Error("informe colocacao 1-4");
  }
  const n = Number(raw);
  if (![1, 2, 3, 4].includes(n)) {
    throw new Error("colocacao deve ser 1-4");
  }
  return n as Placement;
}

/**
 * Parse stage import CSV.
 * Headers: atleta,categoria,nivel,serie,colocacao (`,` or `;`).
 */
export function parseImportCsv(text: string): ImportCsvParseSuccess | ImportCsvParseFailure {
  const cleaned = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = cleaned.split("\n").filter((line) => line.trim().length > 0);

  if (lines.length < 2) {
    return { ok: false, errors: ["CSV vazio ou sem linhas de dados"] };
  }

  const delimiter = detectDelimiter(lines[0]);
  const headers = splitCsvLine(lines[0], delimiter).map(normalizeHeader);
  const index: Partial<Record<(typeof REQUIRED_HEADERS)[number], number>> = {};

  for (const required of REQUIRED_HEADERS) {
    const i = headers.indexOf(required);
    if (i < 0) {
      return {
        ok: false,
        errors: [`Cabecalho obrigatorio ausente: ${required}`],
      };
    }
    index[required] = i;
  }

  const rows: ImportCsvRow[] = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const lineNo = i + 1;
    const cells = splitCsvLine(lines[i], delimiter);
    const raw = {
      atleta: cells[index.atleta!] ?? "",
      categoria: cells[index.categoria!] ?? "",
      nivel: cells[index.nivel!] ?? "",
      serie: cells[index.serie!] ?? "",
      colocacao: cells[index.colocacao!] ?? "",
    };

    const parsed = rowSchema.safeParse(raw);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? "linha invalida";
      errors.push(`Linha ${lineNo}: ${msg}`);
      continue;
    }

    const { atleta, categoria, nivel, serie, colocacao } = parsed.data;

    if (!isResultCategory(categoria)) {
      errors.push(`Linha ${lineNo}: categoria invalida (${categoria})`);
      continue;
    }
    if (!isResultLevel(nivel)) {
      errors.push(`Linha ${lineNo}: nivel invalido (${nivel})`);
      continue;
    }
    if (!(SERIES as readonly string[]).includes(serie)) {
      errors.push(`Linha ${lineNo}: serie invalida (${serie})`);
      continue;
    }

    const seriesValue = serie as Series;
    let placement: Placement | null;
    try {
      placement = parsePlacement(colocacao, seriesValue);
    } catch (error) {
      const message = error instanceof Error ? error.message : "colocacao invalida";
      errors.push(`Linha ${lineNo}: ${message}`);
      continue;
    }

    let points: number;
    try {
      points = calculatePoints(seriesValue, placement);
    } catch (error) {
      const message = error instanceof Error ? error.message : "pontuacao invalida";
      errors.push(`Linha ${lineNo}: ${message}`);
      continue;
    }

    rows.push({
      line: lineNo,
      athlete: atleta,
      category: categoria,
      level: nivel,
      series: seriesValue,
      placement,
      points,
    });
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  if (rows.length === 0) {
    return { ok: false, errors: ["Nenhuma linha de dados no CSV"] };
  }

  return { ok: true, rows };
}
