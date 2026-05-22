import fs from "fs";
import path from "path";
import { nanoid } from "nanoid";
import type { QuoteData } from "@/types/quote";

const DATA_DIR = path.join(process.cwd(), "data");
const QUOTES_FILE = path.join(DATA_DIR, "quotes.json");

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(QUOTES_FILE)) fs.writeFileSync(QUOTES_FILE, "[]");

function readQuotes(): QuoteData[] {
  try {
    return JSON.parse(fs.readFileSync(QUOTES_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function writeQuotes(quotes: QuoteData[]) {
  fs.writeFileSync(QUOTES_FILE, JSON.stringify(quotes, null, 2));
}

export function createQuote(data: Omit<QuoteData, "token" | "createdAt" | "status">): QuoteData {
  const token = nanoid(16);
  const quote: QuoteData = {
    ...data,
    token,
    status: "sent",
    selectedAddons: data.selectedAddons || [],
    createdAt: new Date().toISOString(),
  };
  const quotes = readQuotes();
  quotes.push(quote);
  writeQuotes(quotes);
  return quote;
}

export function getQuoteByToken(token: string): QuoteData | undefined {
  return readQuotes().find((q) => q.token === token);
}

export function approveQuote(token: string, signature: string, selectedAddons: string[]): QuoteData | undefined {
  const quotes = readQuotes();
  const idx = quotes.findIndex((q) => q.token === token);
  if (idx === -1) return undefined;
  quotes[idx] = {
    ...quotes[idx],
    status: "approved",
    signature,
    selectedAddons,
    approvedAt: new Date().toISOString(),
  };
  writeQuotes(quotes);
  return quotes[idx];
}

export function expireOldQuotes(): void {
  const now = new Date().toISOString();
  const quotes = readQuotes().map((q) => {
    if (q.status === "sent" && q.expiryDate < now) {
      return { ...q, status: "expired" as const };
    }
    return q;
  });
  writeQuotes(quotes);
}
