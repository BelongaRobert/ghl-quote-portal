"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

interface OptionalAddon {
  id: string;
  description: string;
  unitPrice: number;
}

function genId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function fmtCurrency(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n);
}

export default function QuoteForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{ token: string; url: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [businessName, setBusinessName] = useState("");
  const [businessLogo, setBusinessLogo] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [contactId, setContactId] = useState("");
  const [opportunityId, setOpportunityId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [quoteTitle, setQuoteTitle] = useState("");
  const [quoteDate, setQuoteDate] = useState(new Date().toISOString().split("T")[0]);
  const [expiryDate, setExpiryDate] = useState("");
  const [taxRate, setTaxRate] = useState(0);
  const [depositPercent, setDepositPercent] = useState(0);
  const [terms, setTerms] = useState(
    "By approving this quote, the client agrees to the scope of work, pricing, and terms outlined above. A deposit may be required before work begins."
  );

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: genId(), description: "", quantity: 1, unitPrice: 0 },
  ]);

  const [optionalAddons, setOptionalAddons] = useState<OptionalAddon[]>([]);

  const subtotal = lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );
  const addonsTotal = optionalAddons.reduce((sum, a) => sum + a.unitPrice, 0);
  const tax = (subtotal + addonsTotal) * (taxRate / 100);
  const total = subtotal + addonsTotal + tax;
  const deposit = total * (depositPercent / 100);

  function addLineItem() {
    setLineItems((prev) => [
      ...prev,
      { id: genId(), description: "", quantity: 1, unitPrice: 0 },
    ]);
  }

  function updateLineItem(id: string, patch: Partial<LineItem>) {
    setLineItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  }

  function removeLineItem(id: string) {
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  }

  function addAddon() {
    setOptionalAddons((prev) => [
      ...prev,
      { id: genId(), description: "", unitPrice: 0 },
    ]);
  }

  function updateAddon(id: string, patch: Partial<OptionalAddon>) {
    setOptionalAddons((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...patch } : a))
    );
  }

  function removeAddon(id: string) {
    setOptionalAddons((prev) => prev.filter((a) => a.id !== id));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const payload = {
      contactId,
      opportunityId: opportunityId || undefined,
      locationId,
      businessName,
      businessLogo: businessLogo || undefined,
      clientName,
      clientEmail,
      clientPhone: clientPhone || undefined,
      quoteTitle,
      quoteDate,
      expiryDate,
      lineItems: lineItems.filter((i) => i.description.trim()),
      optionalAddons: optionalAddons.filter((a) => a.description.trim()),
      taxRate,
      depositPercent,
      terms,
    };

    try {
      const res = await fetch("/api/quote/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || data.error || "Failed to create quote");
      }

      setSuccess({ token: data.quoteToken, url: data.quoteUrl });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
          <h3 className="text-sm font-semibold text-emerald-800 mb-1">Quote Created</h3>
          <p className="text-sm text-emerald-700 mb-3">
            Share this link with your client:
          </p>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={success.url}
              className="flex-1 text-sm bg-white border border-emerald-200 rounded-lg px-3 py-2 text-emerald-900"
            />
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(success.url)}
              className="text-sm font-medium bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Copy
            </button>
          </div>
          <div className="mt-3 flex gap-3">
            <a
              href={success.url}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-emerald-700 hover:underline"
            >
              Preview Quote &rarr;
            </a>
            <button
              type="button"
              onClick={() => {
                setSuccess(null);
                router.refresh();
              }}
              className="text-sm font-medium text-emerald-700 hover:underline"
            >
              Create Another
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Client Info */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
        <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
          Client &amp; Quote Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Client Name
            </label>
            <input
              required
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              placeholder="John Smith"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Client Email
            </label>
            <input
              required
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              placeholder="john@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Client Phone
            </label>
            <input
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              placeholder="(555) 123-4567"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Quote Title
            </label>
            <input
              required
              value={quoteTitle}
              onChange={(e) => setQuoteTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              placeholder="Website Redesign Quote"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Quote Date
            </label>
            <input
              required
              type="date"
              value={quoteDate}
              onChange={(e) => setQuoteDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Expiry Date
            </label>
            <input
              required
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
        </div>
      </section>

      {/* GHL Integration */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
        <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
          GHL Integration
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Contact ID <span className="text-slate-400">(GHL)</span>
            </label>
            <input
              required
              value={contactId}
              onChange={(e) => setContactId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              placeholder="abc123"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Location ID <span className="text-slate-400">(GHL)</span>
            </label>
            <input
              required
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              placeholder="xyz789"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Opportunity ID <span className="text-slate-400">(optional)</span>
            </label>
            <input
              value={opportunityId}
              onChange={(e) => setOpportunityId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              placeholder="opp456"
            />
          </div>
        </div>
      </section>

      {/* Branding */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
        <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
          Branding
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Business Name
            </label>
            <input
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              placeholder="Acme Corp"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Logo URL <span className="text-slate-400">(optional)</span>
            </label>
            <input
              value={businessLogo}
              onChange={(e) => setBusinessLogo(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              placeholder="https://example.com/logo.png"
            />
          </div>
        </div>
      </section>

      {/* Line Items */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
            Line Items
          </h2>
          <button
            type="button"
            onClick={addLineItem}
            className="text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            + Add Item
          </button>
        </div>

        <div className="space-y-3">
          {lineItems.map((item, idx) => (
            <div
              key={item.id}
              className="grid grid-cols-12 gap-3 items-end bg-slate-50 rounded-xl p-3"
            >
              <div className="col-span-12 md:col-span-5">
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Description
                </label>
                <input
                  required
                  value={item.description}
                  onChange={(e) =>
                    updateLineItem(item.id, { description: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="Service description"
                />
              </div>
              <div className="col-span-4 md:col-span-2">
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Qty
                </label>
                <input
                  required
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) =>
                    updateLineItem(item.id, {
                      quantity: Number(e.target.value),
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>
              <div className="col-span-4 md:col-span-2">
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Unit Price
                </label>
                <input
                  required
                  type="number"
                  min={0}
                  step="0.01"
                  value={item.unitPrice}
                  onChange={(e) =>
                    updateLineItem(item.id, {
                      unitPrice: Number(e.target.value),
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>
              <div className="col-span-3 md:col-span-2">
                <div className="text-sm font-medium text-slate-700">
                  {fmtCurrency(item.quantity * item.unitPrice)}
                </div>
              </div>
              <div className="col-span-1">
                {lineItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLineItem(item.id)}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                    aria-label="Remove item"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Optional Add-ons */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
            Optional Add-ons
          </h2>
          <button
            type="button"
            onClick={addAddon}
            className="text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            + Add Add-on
          </button>
        </div>

        {optionalAddons.length === 0 && (
          <p className="text-sm text-slate-400">No optional add-ons. Click above to add one.</p>
        )}

        <div className="space-y-3">
          {optionalAddons.map((addon) => (
            <div
              key={addon.id}
              className="grid grid-cols-12 gap-3 items-end bg-slate-50 rounded-xl p-3"
            >
              <div className="col-span-12 md:col-span-7">
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Description
                </label>
                <input
                  required
                  value={addon.description}
                  onChange={(e) =>
                    updateAddon(addon.id, { description: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="Premium support package"
                />
              </div>
              <div className="col-span-4 md:col-span-2">
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Price
                </label>
                <input
                  required
                  type="number"
                  min={0}
                  step="0.01"
                  value={addon.unitPrice}
                  onChange={(e) =>
                    updateAddon(addon.id, {
                      unitPrice: Number(e.target.value),
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>
              <div className="col-span-3 md:col-span-2">
                <div className="text-sm font-medium text-slate-700">
                  {fmtCurrency(addon.unitPrice)}
                </div>
              </div>
              <div className="col-span-1">
                <button
                  type="button"
                  onClick={() => removeAddon(addon.id)}
                  className="text-slate-400 hover:text-red-500 transition-colors"
                  aria-label="Remove add-on"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing & Terms */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
        <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
          Pricing &amp; Terms
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Tax Rate (%)
            </label>
            <input
              type="number"
              min={0}
              max={100}
              step="0.01"
              value={taxRate}
              onChange={(e) => setTaxRate(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Deposit (%)
            </label>
            <input
              type="number"
              min={0}
              max={100}
              step="0.01"
              value={depositPercent}
              onChange={(e) => setDepositPercent(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="rounded-xl bg-slate-50 p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Subtotal</span>
            <span className="font-medium text-slate-900">{fmtCurrency(subtotal)}</span>
          </div>
          {optionalAddons.length > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Add-ons (optional)</span>
              <span className="font-medium text-slate-900">{fmtCurrency(addonsTotal)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Tax ({taxRate}%)</span>
            <span className="font-medium text-slate-900">{fmtCurrency(tax)}</span>
          </div>
          <div className="border-t border-slate-200 pt-2 flex justify-between text-base">
            <span className="font-semibold text-slate-900">Total</span>
            <span className="font-bold text-slate-900">{fmtCurrency(total)}</span>
          </div>
          {depositPercent > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Deposit ({depositPercent}%)</span>
              <span className="font-medium text-brand-600">{fmtCurrency(deposit)}</span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Terms &amp; Conditions
          </label>
          <textarea
            rows={4}
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>
      </section>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Creating..." : "Create Quote"}
        </button>
        <a
          href="/"
          className="text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
