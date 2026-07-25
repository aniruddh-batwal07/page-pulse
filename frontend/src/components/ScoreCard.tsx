interface ScoreCardProps {
  label: string;
  score: number;
  /** Optional ring/accent color override. Defaults to derived from score. */
  colorOverride?: string;
}

type ScoreStatus = {
  label: string;
  ring: string;
  text: string;
  bg: string;
  numColor: string;
};

function getStatus(score: number): ScoreStatus {
  if (score >= 90) {
    return {
      label: 'Excellent',
      ring: 'ring-emerald-400',
      text: 'text-emerald-600',
      bg: 'bg-emerald-50',
      numColor: 'text-emerald-600',
    };
  }
  if (score >= 70) {
    return {
      label: 'Good',
      ring: 'ring-indigo-400',
      text: 'text-indigo-600',
      bg: 'bg-indigo-50',
      numColor: 'text-indigo-600',
    };
  }
  if (score >= 50) {
    return {
      label: 'Needs Improvement',
      ring: 'ring-amber-400',
      text: 'text-amber-600',
      bg: 'bg-amber-50',
      numColor: 'text-amber-600',
    };
  }
  return {
    label: 'Poor',
    ring: 'ring-red-400',
    text: 'text-red-600',
    bg: 'bg-red-50',
    numColor: 'text-red-600',
  };
}

/**
 * Displays a single numeric score (0–100) with a color-coded status label.
 * Purely presentational — receives all data as props.
 *
 * Props:
 *   label       — displayed beneath the score (e.g. "SEO Score")
 *   score       — integer 0–100
 *   colorOverride — optional Tailwind ring class to force a specific color
 */
export function ScoreCard({ label, score }: ScoreCardProps) {
  const status = getStatus(score);

  return (
    <div className="flex flex-col items-center rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-[0_10px_30px_-12px_rgba(15,23,42,0.16)] sm:p-7">
      <div
        className={`flex h-24 w-24 items-center justify-center rounded-full ring-4 ${status.ring} ${status.bg}`}
      >
        <span className={`text-3xl font-bold tabular-nums ${status.numColor}`}>
          {score}
        </span>
      </div>

      <p className="mt-4 text-sm font-semibold text-slate-700">{label}</p>
      <span className={`mt-1 text-xs font-semibold uppercase tracking-[0.16em] ${status.text}`}>
        {status.label}
      </span>
    </div>
  );
}
