// ─── Fetch layer ─────────────────────────────────────────────────────────────

export interface AuditRequest {
  url: string;
}

// ─── Parser output ────────────────────────────────────────────────────────────

export interface ParsedGeneral {
  /** Contents of <title> */
  title: string | null;
  /** Value of <html lang="..."> */
  language: string | null;
  /** <link rel="canonical" href="..."> */
  canonicalUrl: string | null;
  /** Final URL after redirects (from the fetch layer) */
  pageUrl: string;
}

export interface ParsedMeta {
  /** <meta name="description"> */
  description: string | null;
  /** <meta name="robots"> */
  robots: string | null;
  /** <meta name="viewport"> */
  viewport: string | null;
}

export interface ParsedHeadings {
  h1Count: number;
  h2Count: number;
  h3Count: number;
  /** Text content of every <h1> on the page */
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
  /** Whether any <link rel="icon"> or <link rel="shortcut icon"> is present */
  hasFavicon: boolean;
  /** Value of <meta charset> or charset attribute on <?xml> declaration */
  charset: string | null;
  /** Whether a <meta name="viewport"> tag is present */
  hasViewport: boolean;
}

/** Full output of the HTML parser — returned by the service to the controller */
export interface ParsedPage {
  general: ParsedGeneral;
  meta: ParsedMeta;
  headings: ParsedHeadings;
  images: ParsedImages;
  links: ParsedLinks;
  openGraph: ParsedOpenGraph;
  twitter: ParsedTwitter;
  technical: ParsedTechnical;
  /** Approximate number of words from visible body text */
  wordCount: number;
  /** Raw fetch metadata */
  statusCode: number;
}

// ─── Analyzer output ──────────────────────────────────────────────────────────

export type IssueCategory =
  | "title"
  | "meta-description"
  | "language"
  | "canonical"
  | "viewport"
  | "headings"
  | "images"
  | "open-graph"
  | "twitter"
  | "technical";

export type IssueSeverity = "error" | "warning" | "info";

export interface AnalysisIssue {
  /** Machine-readable identifier — stable across runs */
  id: string;
  category: IssueCategory;
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

// ─── Scorer output ──────────────────────────────────────────────────────────

export interface ScoreDeduction {
  /** The issue id that caused this deduction */
  issueId: string;
  /** Points deducted (positive number) */
  points: number;
  /** Human-readable explanation */
  reason: string;
}

export interface ScoreDomain {
  /** Always 100 */
  start: number;
  deductions: ScoreDeduction[];
  /** Clamped 0–100 integer */
  final: number;
}

export interface PageScores {
  /** Weighted composite of seo and accessibility (integer 0–100) */
  overallScore: number;
  seoScore: number;
  accessibilityScore: number;
  breakdown: {
    seo: ScoreDomain;
    accessibility: ScoreDomain;
  };
}

// ─── Recommender output ───────────────────────────────────────────────────────

export type RecommendationPriority = "high" | "medium" | "low";

export interface Recommendation {
  /** Matches the issue id it was derived from */
  id: string;
  priority: RecommendationPriority;
  title: string;
  description: string;
  action: string;
}

// ─── API response wrapper ─────────────────────────────────────────────────────

export interface AuditResult {
  parsedData: ParsedPage;
  analysis: PageAnalysis;
  scores: PageScores;
  recommendations: Recommendation[];
}

export interface AuditResponse {
  success: boolean;
  data: AuditResult;
}
