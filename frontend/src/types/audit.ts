// ─── Parser output ────────────────────────────────────────────────────────────

export interface ParsedGeneral {
  title: string | null;
  language: string | null;
  canonicalUrl: string | null;
  pageUrl: string;
}

export interface ParsedMeta {
  description: string | null;
  robots: string | null;
  viewport: string | null;
}

export interface ParsedHeadings {
  h1Count: number;
  h2Count: number;
  h3Count: number;
  h1Texts: string[];
}

export interface ParsedImages {
  total: number;
  withAlt: number;
  missingAlt: number;
}

export interface ParsedLinks {
  total: number;
  internal: number;
  external: number;
}

export interface ParsedOpenGraph {
  title: string | null;
  description: string | null;
  image: string | null;
}

export interface ParsedTwitter {
  card: string | null;
  title: string | null;
  description: string | null;
}

export interface ParsedTechnical {
  hasFavicon: boolean;
  charset: string | null;
  hasViewport: boolean;
}

export interface ParsedPage {
  general: ParsedGeneral;
  meta: ParsedMeta;
  headings: ParsedHeadings;
  images: ParsedImages;
  links: ParsedLinks;
  openGraph: ParsedOpenGraph;
  twitter: ParsedTwitter;
  technical: ParsedTechnical;
  statusCode: number;
}

// ─── Analyzer output ──────────────────────────────────────────────────────────

export type IssueSeverity = 'error' | 'warning' | 'info';

export interface AnalysisIssue {
  id: string;
  category: string;
  severity: IssueSeverity;
  message: string;
  recommendation: string;
}

export interface AnalysisSummary {
  errors: number;
  warnings: number;
  infos: number;
}

export interface PageAnalysis {
  issues: AnalysisIssue[];
  summary: AnalysisSummary;
}

// ─── Scorer output ────────────────────────────────────────────────────────────

export interface ScoreDeduction {
  issueId: string;
  points: number;
  reason: string;
}

export interface ScoreDomain {
  start: number;
  deductions: ScoreDeduction[];
  final: number;
}

export interface PageScores {
  overallScore: number;
  seoScore: number;
  accessibilityScore: number;
  breakdown: {
    seo: ScoreDomain;
    accessibility: ScoreDomain;
  };
}

// ─── Recommender output ─────────────────────────────────────────────────

export type RecommendationPriority = 'high' | 'medium' | 'low';

export interface Recommendation {
  id: string;
  priority: RecommendationPriority;
  title: string;
  description: string;
  action: string;
}

// ─── API response ─────────────────────────────────────────────────────────────

export interface AuditData {
  parsedData: ParsedPage;
  analysis: PageAnalysis;
  scores: PageScores;
  recommendations: Recommendation[];
}

export interface AuditApiResponse {
  success: boolean;
  data: AuditData;
}
