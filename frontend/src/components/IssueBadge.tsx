import type { IssueSeverity } from '../types/audit';

interface IssueBadgeProps {
  severity: IssueSeverity;
}

const BADGE_STYLES: Record<IssueSeverity, string> = {
  error: 'bg-red-100 text-red-700 ring-1 ring-red-200',
  warning: 'bg-amber-100 text-amber-700 ring-1 ring-amber-200',
  info: 'bg-blue-100 text-blue-700 ring-1 ring-blue-200',
};

/**
 * Color-coded severity pill badge.
 *
 * Props:
 *   severity — one of "error" | "warning" | "info"
 *             maps to red / amber / blue color scheme
 */
export function IssueBadge({ severity }: IssueBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${BADGE_STYLES[severity]}`}
    >
      {severity}
    </span>
  );
}
