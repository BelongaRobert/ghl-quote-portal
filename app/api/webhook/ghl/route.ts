import { NextRequest, NextResponse } from "next/server";
import { createQuote } from "@/lib/db";
import { CreateQuoteSchema } from "@/lib/validators";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const parsed = CreateQuoteSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const quote = createQuote(parsed.data);
    const url = `${req.nextUrl.origin}/quote/${quote.token}`;

    return NextResponse.json({ success: true, quoteToken: quote.token, quoteUrl: url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
