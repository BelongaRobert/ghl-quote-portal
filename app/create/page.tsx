import QuoteForm from "./QuoteForm";

export const metadata = {
  title: "Create Quote",
  description: "Build a new quote for your client",
};

export default function CreateQuotePage() {
  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Create Quote</h1>
            <p className="text-sm text-slate-500 mt-1">
              Fill out the details below to generate a client-ready quote.
            </p>
          </div>
          <a
            href="/"
            className="text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            &larr; Back home
          </a>
        </div>

        <QuoteForm />
      </div>
    </main>
  );
}
