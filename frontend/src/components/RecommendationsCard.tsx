import type { Recommendation, RecommendationPriority } from '../types/audit';

interface RecommendationsCardProps {
  recommendations: Recommendation[];
}

// ─── Priority styling ─────────────────────────────────────────────────────────

const PRIORITY_STYLES: Record<
  RecommendationPriority,
  { badge: string; border: string; dot: string; label: string }
> = {
  high: {
    badge: 'bg-red-100 text-red-700 ring-1 ring-red-200',
    border: 'border-l-red-400',
    dot: 'bg-red-400',
    label: 'High',
  },
  medium: {
    badge: 'bg-amber-100 text-amber-700 ring-1 ring-amber-200',
    border: 'border-l-amber-400',
    dot: 'bg-amber-400',
    label: 'Medium',
  },
  low: {
    badge: 'bg-blue-100 text-blue-700 ring-1 ring-blue-200',
    border: 'border-l-blue-400',
    dot: 'bg-blue-400',
    label: 'Low',
  },
};

// ─── Priority order ───────────────────────────────────────────────────────────

const PRIORITY_ORDER: Record<RecommendationPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

/**
 * Renders the full recommendations section.
 * Recommendations are sorted high → medium → low before display.
 * Shows a "No recommendations" state when the array is empty.
 *
 * Props:
 *   recommendations — array of Recommendation from the backend
 */
export function RecommendationsCard({ recommendations }: RecommendationsCardProps) {
  const sorted = [...recommendations].sort(
    (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
  );

  return (
    <div className="space-y-3">
      {sorted.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-10 text-center">
          <p className="text-sm font-semibold text-slate-700">No recommendations.</p>
          <p className="mt-1 text-sm text-slate-500">This page is already in strong shape.</p>
        </div>
      ) : (
        sorted.map((rec) => {
          const styles = PRIORITY_STYLES[rec.priority];

          return (
            <div
              key={rec.id}
              className={`rounded-3xl border border-slate-200 border-l-4 bg-white shadow-[0_10px_30px_-12px_rgba(15,23,42,0.16)] transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_35px_-12px_rgba(15,23,42,0.22)] ${styles.border}`}
            >
              <div className="px-5 py-4 sm:px-6">
                {/* Header row */}
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold leading-6 text-slate-800">
                    {rec.title}
                  </h3>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${styles.badge}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${styles.dot}`}
                    />
                    {styles.label} Priority
                  </span>
                </div>

                {/* Description */}
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                  {rec.description}
                </p>

                <div className="mt-3 flex items-start gap-2 rounded-2xl bg-slate-50 px-3 py-2.5">
                  <svg
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-xs leading-6 text-slate-600">
                    <span className="font-semibold">Action: </span>
                    {rec.action}
                  </p>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
