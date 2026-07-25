import type { AnalysisIssue, AnalysisSummary } from '../types/audit';
import { IssueBadge } from './IssueBadge';

interface IssueListProps {
  issues: AnalysisIssue[];
  summary: AnalysisSummary;
}

const SUMMARY_STYLES = {
  errors: 'border-red-200 bg-red-50 text-red-700',
  warnings: 'border-amber-200 bg-amber-50 text-amber-700',
  infos: 'border-blue-200 bg-blue-50 text-blue-700',
};

/**
 * Renders the full issues section: a summary bar + list of issue rows.
 *
 * Props:
 *   issues  — array of AnalysisIssue from the backend
 *   summary — { errors, warnings, infos } counts
 */
export function IssueList({ issues, summary }: IssueListProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {(
          [
            { key: 'errors', label: 'Errors', count: summary.errors },
            { key: 'warnings', label: 'Warnings', count: summary.warnings },
            { key: 'infos', label: 'Info', count: summary.infos },
          ] as const
        ).map(({ key, label, count }) => (
          <div
            key={key}
            className={`flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-medium shadow-sm ${SUMMARY_STYLES[key]}`}
          >
            <span className="text-lg font-bold tabular-nums">{count}</span>
            <span>{label}</span>
          </div>
        ))}
      </div>

      {/* Issue rows */}
      {issues.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-10 text-center">
          <p className="text-sm font-semibold text-slate-700">No issues found.</p>
          <p className="mt-1 text-sm text-slate-500">This page looks solid from an SEO perspective.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_10px_30px_-12px_rgba(15,23,42,0.16)]">
          {issues.map((issue) => (
            <div
              key={issue.id}
              className="flex items-start gap-4 px-5 py-4 transition-colors duration-200 hover:bg-slate-50 sm:px-6"
            >
              {/* Badge */}
              <div className="mt-0.5 shrink-0">
                <IssueBadge severity={issue.severity} />
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-6 text-slate-800">
                  {issue.message}
                </p>
                <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                  {issue.category.replace(/-/g, ' ')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
