import type { ReactNode } from 'react';

interface SectionCardProps {
  title: string;
  children: ReactNode;
}

/**
 * Generic card wrapper for any data section (General, Meta, Headings, etc.).
 * Handles consistent padding, border, shadow, and heading — children provide content.
 *
 * Props:
 *   title    — section heading rendered as an h2
 *   children — any ReactNode; typically a list of MetaRow items
 */
export function SectionCard({ title, children }: SectionCardProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_10px_30px_-12px_rgba(15,23,42,0.16)]">
      <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6">
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
          {title}
        </h2>
      </div>
      <div className="divide-y divide-slate-100">{children}</div>
    </div>
  );
}
