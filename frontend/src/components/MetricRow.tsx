interface MetricRowProps {
  label: string;
  /** The value to display. Pass null/undefined to show a "Not found" placeholder. */
  value: string | number | boolean | null | undefined;
  /** When true, renders value in a monospace code style */
  mono?: boolean;
}

/**
 * A single key-value row inside a SectionCard.
 * Handles null/undefined gracefully by showing a muted "Not found" placeholder.
 *
 * Props:
 *   label  — left-side field name
 *   value  — right-side display value; null/undefined → "Not found"
 *   mono   — render value in font-mono (useful for URLs, charsets, etc.)
 */
export function MetricRow({ label, value, mono = false }: MetricRowProps) {
  const isEmpty = value === null || value === undefined || value === '';

  const displayValue = isEmpty ? null : String(value);

  return (
    <div className="flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:px-6">
      <span className="text-sm font-medium text-slate-500">
        {label}
      </span>
      {isEmpty ? (
        <span className="text-sm italic text-slate-400">Not found</span>
      ) : (
        <span
          className={`max-w-full break-words text-sm font-medium text-slate-800 sm:text-right ${
            mono ? 'font-mono text-xs sm:text-sm' : ''
          }`}
        >
          {displayValue}
        </span>
      )}
    </div>
  );
}
