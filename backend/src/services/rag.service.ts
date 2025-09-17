import fs from "fs";
import path from "path";
import MiniSearch from "minisearch";
import { parse } from "csv-parse/sync";
import { env, isRagDebug } from "../utils/env";
import { logger } from "../utils/logger";

type Row = { id: number; question: string; answer: string };

const csvPath = path.resolve(process.cwd(), "data/owasp.csv");
let mini: MiniSearch<Row> | null = null;
let rows: Row[] = [];

export function initRag() {
  if (!fs.existsSync(csvPath)) {
    logger.warn({ csvPath }, "OWASP CSV not found, RAG disabled");
    return;
  }
  const raw = fs.readFileSync(csvPath, "utf8");
  const records = parse(raw, { columns: true, skip_empty_lines: true });
  rows = records
    .map((r: any, i: number) => ({
      id: i + 1,
      question: String(r.question || r.Question || "").trim(),
      answer: String(r.answer || r.Answer || "").trim(),
    }))
    .filter((r: any) => r.question && r.answer);

  mini = new MiniSearch<Row>({
    fields: ["question", "answer"],
    storeFields: ["question", "answer"],
    searchOptions: { boost: { question: 2 }, prefix: true, fuzzy: 0.2 },
  });
  mini.addAll(rows);
  logger.info({ count: rows.length }, "RAG index built");
}

initRag();

export function searchRag(query: string, k = 3) {
  if (!mini) return [];
  const res = mini.search(query, { filter: () => true }).slice(0, k);
  if (isRagDebug()) logger.debug({ query, res }, "RAG results");
  return res.map((r) => ({
    question: r.question!,
    answer: r.answer!,
    score: r.score,
  }));
}

export function augmentWithRag(query: string,  k = 3): string {
  if (!mini) return "";
  const hits = searchRag(query, k); // <— can pass 5 here for 5 hits
  if (!hits.length) return "";
  const context = hits
    .map((h, i) => `(${i + 1}) Q: ${h.question}\nA: ${h.answer}`)
    .join("\n");
  return `\n\n[OWASP Context]\n${context}\n[End Context]\n`;
}
