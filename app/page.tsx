export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
      <div className="max-w-lg w-full text-center">
        <div className="w-16 h-16 bg-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.801 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V19.5a2.25 2.25 0 002.25 2.25h.75" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Quote Portal</h1>
        <p className="text-slate-600 mb-8">
          A branded client experience for GoHighLevel. Create, send, and approve quotes with signatures, optional add-ons, and live pricing.
        </p>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-left space-y-4">
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">How it works</h2>
          <ol className="list-decimal list-inside text-sm text-slate-600 space-y-2">
            <li>GHL workflow triggers a webhook to this portal with contact and quote data.</li>
            <li>The portal generates a unique, secure quote URL (magic-link style).</li>
            <li>Client opens the link on any device — no password needed.</li>
            <li>Client reviews line items, toggles optional add-ons, and sees the total update live.</li>
            <li>Client signs electronically and clicks approve.</li>
            <li>Portal updates the GHL opportunity stage and adds a note automatically.</li>
          </ol>
        </div>

        <div className="mt-8 flex items-center justify-center gap-4">
          <a
            href="/create"
            className="inline-flex items-center rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors"
          >
            Create Quote
          </a>
        </div>

        <p className="text-xs text-slate-400 mt-8">
          API endpoints: <code className="bg-slate-200 px-1 py-0.5 rounded">/api/webhook/ghl</code> · <code className="bg-slate-200 px-1 py-0.5 rounded">/api/quote/create</code> · <code className="bg-slate-200 px-1 py-0.5 rounded">/api/quote/approve</code>
        </p>
      </div>
    </div>
  );
}
