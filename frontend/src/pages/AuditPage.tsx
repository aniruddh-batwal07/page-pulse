import { useState, type FormEvent } from 'react';
import { useAudit } from '../hooks/useAudit';
import { validateUrl } from '../utils/validation';
import { Spinner } from '../components/Spinner';
import { ErrorCard } from '../components/ErrorCard';
import { AuditDashboard } from '../components/AuditDashboard';

const cardSurface = 'rounded-3xl border border-slate-200 bg-white/95 shadow-[0_10px_30px_-12px_rgba(15,23,42,0.16)]';
const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50';

export function AuditPage() {
  const [url, setUrl] = useState('');
  const [submittedUrl, setSubmittedUrl] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const { data, isLoading, error: apiError, run } = useAudit();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const urlError = validateUrl(url);
    if (urlError) {
      setValidationError(urlError);
      return;
    }

    const trimmed = url.trim();
    setValidationError(null);
    setSubmittedUrl(trimmed);
    run(trimmed);
  }

  const displayError = validationError ?? apiError;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white/80 shadow-[0_1px_0_rgba(15,23,42,0.04)] backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-6 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:py-8">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-600/10 text-indigo-600">
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-semibold tracking-tight text-slate-900">Page Pulse</h1>
              <p className="mt-1 text-sm text-slate-500">Run a concise SEO audit for any public page.</p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="flex w-full max-w-xl flex-col gap-2 sm:flex-row"
          >
            <label htmlFor="audit-url" className="sr-only">
              Audit URL
            </label>
            <input
              id="audit-url"
              type="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (validationError) setValidationError(null);
              }}
              placeholder="https://example.com"
              disabled={isLoading}
              aria-describedby="audit-url-help"
              aria-invalid={Boolean(displayError)}
              className={`flex-1 rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-sm transition-all duration-200 ${focusRing} focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 disabled:shadow-none`}
            />
            <p id="audit-url-help" className="sr-only">
              Enter a web address beginning with http:// or https://.
            </p>
            <button
              id="audit-submit"
              type="submit"
              disabled={isLoading}
              className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-indigo-700 hover:shadow-md active:scale-[0.98] ${focusRing} disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none`}
            >
              {isLoading ? (
                <>
                  <Spinner size="sm" />
                  Analyzing…
                </>
              ) : (
                'Analyze'
              )}
            </button>
          </form>
        </div>

        {displayError && (
          <div className="mx-auto max-w-5xl px-4 pb-4 sm:px-6">
            <ErrorCard message={displayError} />
          </div>
        )}
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:py-12">
        {isLoading && (
          <div className={`${cardSurface} flex flex-col items-center justify-center gap-4 px-6 py-16 text-center sm:px-10`}>
            <Spinner size="lg" />
            <div>
              <p className="text-base font-semibold text-slate-800">Fetching and analyzing page…</p>
              <p className="mt-1 text-sm text-slate-500">This usually takes a few seconds.</p>
            </div>
          </div>
        )}

        {!isLoading && !data && !displayError && (
          <div className={`${cardSurface} flex flex-col items-center px-6 py-16 text-center sm:px-10`}>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <p className="text-base font-semibold text-slate-800">Enter a URL above to run an SEO audit.</p>
            <p className="mt-2 max-w-md text-sm text-slate-500">
              Review titles, meta tags, accessibility signals, and recommendations in one place.
            </p>
          </div>
        )}

        {!isLoading && data && (
          <div className="flex justify-center">
            <AuditDashboard data={data} auditedUrl={submittedUrl} />
          </div>
        )}
      </main>
    </div>
  );
}
