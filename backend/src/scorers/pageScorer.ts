import {
  AnalysisIssue,
  IssueCategory,
  PageAnalysis,
  PageScores,
  ScoreDeduction,
  ScoreDomain,
} from "../types/audit.types.js";

// ─── Deduction weights ────────────────────────────────────────────────────────
//
// Philosophy: errors represent critical failures that directly harm SEO ranking
// or break the user experience. Warnings are best-practice violations. Infos
// are optimisation opportunities with low impact.
//
// Error   = -15  A missing title or H1 can cost meaningful ranking positions.
// Warning =  -7  Issues like a short description reduce click-through rate.
// Info    =  -2  Missing OG image or favicon — low ranking impact but worth fixing.

const DEDUCTION_ERROR = 15;
const DEDUCTION_WARNING = 7;
const DEDUCTION_INFO = 2;

// ─── Score starting point ─────────────────────────────────────────────────────

const SCORE_START = 100;

// ─── Overall score weights ────────────────────────────────────────────────────
//
// SEO signals (title, description, headings, canonical, OG) are the primary
// driver of search-engine ranking, so they carry the majority weight.
// Accessibility (lang, viewport, alt text) matters for rankings via Core Web
// Vitals and inclusive design, but its direct SERP impact is somewhat lower.

const OVERALL_WEIGHT_SEO = 0.6;
const OVERALL_WEIGHT_ACCESSIBILITY = 0.4;

// ─── Category routing ─────────────────────────────────────────────────────────
//
// Each IssueCategory is assigned to exactly ONE scoring domain.
// Technical categories (charset, favicon) are deliberatley excluded from both
// SEO and accessibility domain scoring — they affect overallScore only via
// their category membership in any future dedicated "technical" domain.
// For now they are included in SEO as general hygiene signals.

const SEO_CATEGORIES = new Set<IssueCategory>([
  "title",
  "meta-description",
  "canonical",
  "headings",
  "open-graph",
  "twitter",
  "technical", // charset/favicon — technical hygiene, counted under SEO
]);

const ACCESSIBILITY_CATEGORIES = new Set<IssueCategory>([
  "language",
  "viewport",
  "images", // alt text is an accessibility + SEO signal; primary home is a11y
]);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function deductionPoints(issue: AnalysisIssue): number {
  switch (issue.severity) {
    case "error":
      return DEDUCTION_ERROR;
    case "warning":
      return DEDUCTION_WARNING;
    case "info":
      return DEDUCTION_INFO;
  }
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function buildDomain(
  issues: AnalysisIssue[],
  categories: Set<IssueCategory>
): ScoreDomain {
  const deductions: ScoreDeduction[] = [];

  for (const issue of issues) {
    if (!categories.has(issue.category)) continue;

    const points = deductionPoints(issue);
    deductions.push({
      issueId: issue.id,
      points,
      reason: issue.message,
    });
  }

  const totalDeducted = deductions.reduce((sum, d) => sum + d.points, 0);

  return {
    start: SCORE_START,
    deductions,
    final: clamp(SCORE_START - totalDeducted),
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Consumes a PageAnalysis and produces domain scores + a weighted overall score.
 * Pure function — no I/O, no side effects.
 */
export function scorePage(analysis: PageAnalysis): PageScores {
  const seo = buildDomain(analysis.issues, SEO_CATEGORIES);
  const accessibility = buildDomain(analysis.issues, ACCESSIBILITY_CATEGORIES);

  const overallScore = clamp(
    seo.final * OVERALL_WEIGHT_SEO +
      accessibility.final * OVERALL_WEIGHT_ACCESSIBILITY
  );

  return {
    overallScore,
    seoScore: seo.final,
    accessibilityScore: accessibility.final,
    breakdown: { seo, accessibility },
  };
}
