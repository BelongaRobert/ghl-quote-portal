import { notFound } from "next/navigation";
import { getQuoteByToken, expireOldQuotes } from "@/lib/db";
import QuoteClient from "./QuoteClient";

export default async function QuotePage({ params }: { params: { token: string } }) {
  expireOldQuotes();
  const quote = getQuoteByToken(params.token);
  if (!quote) return notFound();

  return <QuoteClient quote={quote} />;
}
