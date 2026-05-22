"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { QuoteData } from "@/types/quote";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function daysUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function QuoteClient({ quote }: { quote: QuoteData }) {
  const [selectedAddons, setSelectedAddons] = useState<Set<string>>(
    () => new Set(quote.selectedAddons)
  );
  const [agreed, setAgreed] = useState(false);
  const [signature, setSignature] = useState(quote.signature || "");
  const [submitting, setSubmitting] = useState(false);
  const [approved, setApproved] = useState(quote.status === "approved");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);

  const subtotal = quote.lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const addonsTotal = quote.optionalAddons
    .filter((a) => selectedAddons.has(a.id))
    .reduce((sum, a) => sum + a.unitPrice, 0);
  const taxable = subtotal + addonsTotal;
  const tax = taxable * (quote.taxRate / 100);
  const total = taxable + tax;
  const deposit = total * (quote.depositPercent / 100);

  const toggleAddon = useCallback((id: string) => {
    setSelectedAddons((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const startDrawing = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      drawingRef.current = true;
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;
      ctx.beginPath();
      const { x, y } = getPos(e, canvas);
      ctx.moveTo(x, y);
    },
    []
  );

  const draw = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!drawingRef.current) return;
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;
      const { x, y } = getPos(e, canvas);
      ctx.lineTo(x, y);
      ctx.stroke();
    },
    []
  );

  const stopDrawing = useCallback(() => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    const canvas = canvasRef.current!;
    setSignature(canvas.toDataURL("image/png"));
  }, []);

  const clearSignature = useCallback(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignature("");
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#0f172a";
  }, []);

  const handleApprove = async () => {
    if (!signature) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/quote/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: quote.token,
          signature,
          selectedAddons: Array.from(selectedAddons),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setApproved(true);
      } else {
        alert(data.error || "Approval failed");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (approved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Quote Approved</h2>
          <p className="text-slate-600 mb-6">Thank you, {quote.clientName}. Your approval has been received and we will be in touch shortly.</p>
          {deposit > 0 && (
            <div className="bg-brand-50 rounded-xl p-4 mb-4">
              <p className="text-sm text-brand-700 font-medium mb-1">Deposit Due</p>
              <p className="text-2xl font-bold text-brand-900">{formatCurrency(deposit)}</p>
              <p className="text-xs text-brand-600 mt-1">A payment link will be sent separately.</p>
            </div>
          )}
          <p className="text-xs text-slate-400">Quote #{quote.token.slice(0, 8)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {quote.businessLogo ? (
                <img src={quote.businessLogo} alt="" className="w-10 h-10 rounded-lg object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-lg">
                  {quote.businessName.charAt(0)}
                </div>
              )}
              <div>
                <p className="font-semibold text-slate-900">{quote.businessName}</p>
                <p className="text-xs text-slate-500">Quote Portal</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Expires in {daysUntil(quote.expiryDate)} days</p>
              <p className="text-xs text-slate-400">{formatDate(quote.quoteDate)}</p>
            </div>
          </div>
          <h1 className="text-xl font-bold text-slate-900">{quote.quoteTitle}</h1>
          <p className="text-sm text-slate-600 mt-1">Prepared for {quote.clientName}</p>
        </div>

        {/* Line Items */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-4">
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Line Items</h2>
          <div className="space-y-3">
            {quote.lineItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">{item.description}</p>
                  <p className="text-xs text-slate-500">{item.quantity} × {formatCurrency(item.unitPrice)}</p>
                </div>
                <p className="text-sm font-semibold text-slate-900">{formatCurrency(item.quantity * item.unitPrice)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Optional Add-ons */}
        {quote.optionalAddons.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-4">
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Optional Add-ons</h2>
            <div className="space-y-3">
              {quote.optionalAddons.map((addon) => (
                <label
                  key={addon.id}
                  className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedAddons.has(addon.id)}
                      onChange={() => toggleAddon(addon.id)}
                      className="w-5 h-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span className="text-sm text-slate-900">{addon.description}</span>
                  </div>
                  <span className="text-sm font-medium text-slate-900">+{formatCurrency(addon.unitPrice)}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Total */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Subtotal</span>
              <span className="font-medium text-slate-900">{formatCurrency(taxable)}</span>
            </div>
            {quote.taxRate > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Tax ({quote.taxRate}%)</span>
                <span className="font-medium text-slate-900">{formatCurrency(tax)}</span>
              </div>
            )}
            <div className="border-t border-slate-200 pt-2 flex justify-between">
              <span className="text-base font-semibold text-slate-900">Total</span>
              <span className="text-xl font-bold text-brand-700">{formatCurrency(total)}</span>
            </div>
            {quote.depositPercent > 0 && (
              <div className="flex justify-between text-sm mt-1">
                <span className="text-slate-600">Deposit Due ({quote.depositPercent}%)</span>
                <span className="font-semibold text-brand-700">{formatCurrency(deposit)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Terms */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-4">
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">Terms &amp; Conditions</h2>
          <div className="text-sm text-slate-600 max-h-40 overflow-y-auto pr-2 space-y-2">
            {quote.terms.split("\n").map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
          <label className="flex items-center gap-3 mt-4 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="w-5 h-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm text-slate-700">I have read and agree to the terms and conditions.</span>
          </label>
        </div>

        {/* Signature */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-4">
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">Signature</h2>
          <p className="text-xs text-slate-500 mb-3">Please sign below using your finger or mouse.</p>
          <div className="border-2 border-dashed border-slate-300 rounded-xl overflow-hidden bg-slate-50">
            <canvas
              ref={canvasRef}
              width={600}
              height={160}
              className="w-full touch-none cursor-crosshair"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
          </div>
          <button
            onClick={clearSignature}
            className="mt-3 text-sm text-slate-500 hover:text-slate-700 underline"
            type="button"
          >
            Clear signature
          </button>
        </div>

        {/* Approve Button */}
        <button
          onClick={handleApprove}
          disabled={!agreed || !signature || submitting}
          className={`w-full py-4 rounded-xl font-semibold text-white text-lg transition-all ${
            agreed && signature && !submitting
              ? "bg-brand-600 hover:bg-brand-700 shadow-lg hover:shadow-xl"
              : "bg-slate-300 cursor-not-allowed"
          }`}
        >
          {submitting ? "Processing..." : "Approve Quote & Sign"}
        </button>

        {!agreed && <
          p className="text-center text-xs text-amber-600 mt-2">Please agree to the terms to continue.</p
        >}
        {!signature && agreed && <
          p className="text-center text-xs text-amber-600 mt-2">Please add your signature to continue.</p
        >}
      </div>
    </div>
  );
}

function getPos(e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) {
  const rect = canvas.getBoundingClientRect();
  const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
  const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
}
