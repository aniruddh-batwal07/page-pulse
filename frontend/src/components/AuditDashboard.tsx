import type { AuditData } from '../types/audit';
import { ScoreCard } from './ScoreCard';
import { SectionCard } from './SectionCard';
import { MetricRow } from './MetricRow';
import { IssueList } from './IssueList';
import { RecommendationsCard } from './RecommendationsCard';

interface AuditDashboardProps {
  data: AuditData;
  auditedUrl: string;
}

/**
 * Full results dashboard. Purely presentational — receives data as props,
 * renders all sections. No business logic or async state here.
 *
 * Props:
 *   data       — the full AuditData from the backend
 *   auditedUrl — the URL that was submitted (for display in the heading)
 */
export function AuditDashboard({ data, auditedUrl }: AuditDashboardProps) {
  const { parsedData, analysis, scores } = data;
  const { general, meta, headings, images, links, openGraph, twitter, technical } = parsedData;

  return (
    <section className="w-full max-w-5xl space-y-6 sm:space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-[0_10px_30px_-12px_rgba(15,23,42,0.16)] sm:px-6 sm:py-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
          Audited URL
        </p>
        <p className="mt-2 break-all font-mono text-sm font-medium text-slate-800">
          {auditedUrl}
        </p>
      </div>

      <div>
        <h2 className="mb-4 text-base font-semibold text-slate-700">Scores</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <ScoreCard label="Overall Score" score={scores.overallScore} />
          <ScoreCard label="SEO Score" score={scores.seoScore} />
          <ScoreCard label="Accessibility Score" score={scores.accessibilityScore} />
        </div>
      </div>

      {/* ── Issues ─────────────────────────────────────────────────── */}
      <div>
        <h2 className="mb-4 text-base font-semibold text-slate-700">Issues Found</h2>
        <IssueList issues={analysis.issues} summary={analysis.summary} />
      </div>

      {/* ── Recommendations ───────────────────────────────────────── */}
      <div>
        <h2 className="mb-4 text-base font-semibold text-slate-700">Recommendations</h2>
        <RecommendationsCard recommendations={data.recommendations} />
      </div>

      {/* ── Data Sections ──────────────────────────────────────── */}
      <div>
        <h2 className="mb-4 text-base font-semibold text-slate-700">Page Data</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

          {/* General */}
          <SectionCard title="General">
            <MetricRow label="Title" value={general.title} />
            <MetricRow label="Language" value={general.language} />
            <MetricRow label="Canonical URL" value={general.canonicalUrl} mono />
            <MetricRow label="Page URL" value={general.pageUrl} mono />
            <MetricRow label="HTTP Status" value={parsedData.statusCode} />
          </SectionCard>

          {/* Meta */}
          <SectionCard title="Meta Tags">
            <MetricRow label="Description" value={meta.description} />
            <MetricRow label="Robots" value={meta.robots} />
            <MetricRow label="Viewport" value={meta.viewport} />
          </SectionCard>

          {/* Headings */}
          <SectionCard title="Headings">
            <MetricRow label="H1 Count" value={headings.h1Count} />
            <MetricRow label="H2 Count" value={headings.h2Count} />
            <MetricRow label="H3 Count" value={headings.h3Count} />
            <MetricRow
              label="H1 Text(s)"
              value={
                headings.h1Texts.length > 0
                  ? headings.h1Texts.join(' / ')
                  : null
              }
            />
          </SectionCard>

          {/* Images */}
          <SectionCard title="Images">
            <MetricRow label="Total Images" value={images.total} />
            <MetricRow label="With Alt Text" value={images.withAlt} />
            <MetricRow label="Missing Alt Text" value={images.missingAlt} />
          </SectionCard>

          {/* Links */}
          <SectionCard title="Links">
            <MetricRow label="Total Links" value={links.total} />
            <MetricRow label="Internal Links" value={links.internal} />
            <MetricRow label="External Links" value={links.external} />
          </SectionCard>

          {/* Open Graph */}
          <SectionCard title="Open Graph">
            <MetricRow label="og:title" value={openGraph.title} />
            <MetricRow label="og:description" value={openGraph.description} />
            <MetricRow label="og:image" value={openGraph.image} mono />
          </SectionCard>

          {/* Twitter */}
          <SectionCard title="Twitter / X">
            <MetricRow label="twitter:card" value={twitter.card} />
            <MetricRow label="twitter:title" value={twitter.title} />
            <MetricRow label="twitter:description" value={twitter.description} />
          </SectionCard>

          {/* Technical */}
          <SectionCard title="Technical">
            <MetricRow label="Favicon" value={technical.hasFavicon ? 'Present' : 'Missing'} />
            <MetricRow label="Charset" value={technical.charset} />
            <MetricRow label="Viewport Tag" value={technical.hasViewport ? 'Present' : 'Missing'} />
          </SectionCard>

        </div>
      </div>
    </section>
  );
}
