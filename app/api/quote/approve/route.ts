import { NextRequest, NextResponse } from "next/server";
import { approveQuote, getQuoteByToken } from "@/lib/db";
import { updateOpportunityStage, addContactNote } from "@/lib/ghl";
import { ApproveQuoteSchema } from "@/lib/validators";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const parsed = ApproveQuoteSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { token, signature, selectedAddons } = parsed.data;
    const existing = getQuoteByToken(token);
    if (!existing) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }
    if (existing.status === "approved") {
      return NextResponse.json({ error: "Quote already approved" }, { status: 409 });
    }
    if (existing.status === "expired") {
      return NextResponse.json({ error: "Quote has expired" }, { status: 410 });
    }

    const quote = approveQuote(token, signature, selectedAddons);
    if (!quote) {
      return NextResponse.json({ error: "Approval failed" }, { status: 500 });
    }

    const noteBody = `Quote approved via portal on ${new Date().toLocaleString()}.\nSelected add-ons: ${selectedAddons.length > 0 ? selectedAddons.join(", ") : "None"}.`;

    if (quote.opportunityId) {
      try {
        await updateOpportunityStage(quote.opportunityId, "approved");
      } catch (e: any) {
        console.error("GHL stage update failed:", e.message);
      }
    }

    try {
      await addContactNote(quote.contactId, noteBody);
    } catch (e: any) {
      console.error("GHL note creation failed:", e.message);
    }

    return NextResponse.json({ success: true, quote });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
