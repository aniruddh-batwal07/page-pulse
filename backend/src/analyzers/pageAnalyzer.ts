import {
  AnalysisIssue,
  AnalysisSummary,
  IssueCategory,
  IssueSeverity,
  PageAnalysis,
  ParsedPage,
} from "../types/audit.types.js";

// ─── Thresholds ────────────────────────────────────────────────────────────────

const TITLE_MIN_LENGTH = 30;
const TITLE_MAX_LENGTH = 60;

const META_DESCRIPTION_MIN_LENGTH = 120;
const META_DESCRIPTION_MAX_LENGTH = 160;

// ─── Issue builder ─────────────────────────────────────────────────────────────

function issue(
  id: string,
  category: IssueCategory,
  severity: IssueSeverity,
  message: string,
  recommendation: string
): AnalysisIssue {
  return { id, category, severity, message, recommendation };
}

// ─── Rule groups ───────────────────────────────────────────────────────────────

function analyzeTitle(parsed: ParsedPage): AnalysisIssue[] {
  const issues: AnalysisIssue[] = [];
  const { title } = parsed.general;

  if (!title) {
    issues.push(
      issue(
        "title:missing",
        "title",
        "error",
        "Page is missing a <title> tag.",
        "Add a descriptive <title> tag between 30 and 60 characters."
      )
    );
    // Cannot check length if title is absent
    return issues;
  }

  if (title.length < TITLE_MIN_LENGTH) {
    issues.push(
      issue(
        "title:too-short",
        "title",
        "warning",
        `Title is too short (${title.length} chars). Minimum is ${TITLE_MIN_LENGTH}.`,
        `Expand the title to at least ${TITLE_MIN_LENGTH} characters to improve search result visibility.`
      )
    );
  }

  if (title.length > TITLE_MAX_LENGTH) {
    issues.push(
      issue(
        "title:too-long",
        "title",
        "warning",
        `Title is too long (${title.length} chars). Maximum is ${TITLE_MAX_LENGTH}.`,
        `Shorten the title to ${TITLE_MAX_LENGTH} characters or fewer to prevent truncation in search results.`
      )
    );
  }

  return issues;
}

function analyzeMetaDescription(parsed: ParsedPage): AnalysisIssue[] {
  const issues: AnalysisIssue[] = [];
  const { description } = parsed.meta;

  if (!description) {
    issues.push(
      issue(
        "meta-description:missing",
        "meta-description",
        "error",
        "Page is missing a meta description.",
        `Add a <meta name="description"> tag between ${META_DESCRIPTION_MIN_LENGTH} and ${META_DESCRIPTION_MAX_LENGTH} characters.`
      )
    );
    return issues;
  }

  if (description.length < META_DESCRIPTION_MIN_LENGTH) {
    issues.push(
      issue(
        "meta-description:too-short",
        "meta-description",
        "warning",
        `Meta description is too short (${description.length} chars). Minimum is ${META_DESCRIPTION_MIN_LENGTH}.`,
        `Expand the meta description to at least ${META_DESCRIPTION_MIN_LENGTH} characters for better search snippet quality.`
      )
    );
  }

  if (description.length > META_DESCRIPTION_MAX_LENGTH) {
    issues.push(
      issue(
        "meta-description:too-long",
        "meta-description",
        "warning",
        `Meta description is too long (${description.length} chars). Maximum is ${META_DESCRIPTION_MAX_LENGTH}.`,
        `Trim the meta description to ${META_DESCRIPTION_MAX_LENGTH} characters or fewer to prevent truncation in SERPs.`
      )
    );
  }

  return issues;
}

function analyzeLanguage(parsed: ParsedPage): AnalysisIssue[] {
  if (!parsed.general.language) {
    return [
      issue(
        "language:missing",
        "language",
        "warning",
        'Page is missing a lang attribute on the <html> element.',
        'Add lang="en" (or the appropriate BCP-47 language tag) to the <html> element for accessibility and SEO.'
      ),
    ];
  }
  return [];
}

function analyzeCanonical(parsed: ParsedPage): AnalysisIssue[] {
  if (!parsed.general.canonicalUrl) {
    return [
      issue(
        "canonical:missing",
        "canonical",
        "warning",
        "Page is missing a canonical URL tag.",
        'Add <link rel="canonical" href="..."> to prevent duplicate content issues.'
      ),
    ];
  }
  return [];
}

function analyzeViewport(parsed: ParsedPage): AnalysisIssue[] {
  if (!parsed.technical.hasViewport) {
    return [
      issue(
        "viewport:missing",
        "viewport",
        "error",
        "Page is missing a viewport meta tag.",
        'Add <meta name="viewport" content="width=device-width, initial-scale=1"> for proper mobile rendering.'
      ),
    ];
  }
  return [];
}

function analyzeHeadings(parsed: ParsedPage): AnalysisIssue[] {
  const issues: AnalysisIssue[] = [];
  const { h1Count } = parsed.headings;

  if (h1Count === 0) {
    issues.push(
      issue(
        "headings:no-h1",
        "headings",
        "error",
        "Page has no <h1> heading.",
        "Add a single <h1> that clearly describes the main topic of the page."
      )
    );
  }

  if (h1Count > 1) {
    issues.push(
      issue(
        "headings:multiple-h1",
        "headings",
        "warning",
        `Page has ${h1Count} <h1> headings. Only one is recommended.`,
        "Consolidate your headings so only one <h1> exists per page."
      )
    );
  }

  return issues;
}

function analyzeImages(parsed: ParsedPage): AnalysisIssue[] {
  const { missingAlt } = parsed.images;

  if (missingAlt > 0) {
    return [
      issue(
        "images:missing-alt",
        "images",
        "warning",
        `${missingAlt} image${missingAlt > 1 ? "s are" : " is"} missing an alt attribute.`,
        "Add descriptive alt text to all informational images. Use alt=\"\" for purely decorative ones."
      ),
    ];
  }

  return [];
}

function analyzeOpenGraph(parsed: ParsedPage): AnalysisIssue[] {
  const issues: AnalysisIssue[] = [];
  const { title, description, image } = parsed.openGraph;

  if (!title) {
    issues.push(
      issue(
        "open-graph:missing-title",
        "open-graph",
        "warning",
        "Open Graph title (og:title) is missing.",
        'Add <meta property="og:title" content="..."> so your page previews correctly when shared on social media.'
      )
    );
  }

  if (!description) {
    issues.push(
      issue(
        "open-graph:missing-description",
        "open-graph",
        "warning",
        "Open Graph description (og:description) is missing.",
        'Add <meta property="og:description" content="..."> to improve social media preview quality.'
      )
    );
  }

  if (!image) {
    issues.push(
      issue(
        "open-graph:missing-image",
        "open-graph",
        "info",
        "Open Graph image (og:image) is missing.",
        'Add <meta property="og:image" content="..."> to display a rich image preview when the page is shared.'
      )
    );
  }

  return issues;
}

function analyzeTwitter(parsed: ParsedPage): AnalysisIssue[] {
  if (!parsed.twitter.card) {
    return [
      issue(
        "twitter:missing-card",
        "twitter",
        "info",
        "Twitter card (twitter:card) is missing.",
        'Add <meta name="twitter:card" content="summary_large_image"> to enable rich Twitter/X link previews.'
      ),
    ];
  }
  return [];
}

function analyzeTechnical(parsed: ParsedPage): AnalysisIssue[] {
  const issues: AnalysisIssue[] = [];

  if (!parsed.technical.hasFavicon) {
    issues.push(
      issue(
        "technical:missing-favicon",
        "technical",
        "info",
        "Page has no favicon.",
        'Add <link rel="icon" href="/favicon.ico"> to give the page a recognisable icon in browser tabs and bookmarks.'
      )
    );
  }

  if (!parsed.technical.charset) {
    issues.push(
      issue(
        "technical:missing-charset",
        "technical",
        "warning",
        "Page is missing a charset declaration.",
        'Add <meta charset="UTF-8"> as the first element inside <head> to prevent character encoding issues.'
      )
    );
  }

  return issues;
}

// ─── Summary builder ───────────────────────────────────────────────────────────

function buildSummary(issues: AnalysisIssue[]): AnalysisSummary {
  return {
    errors: issues.filter((i) => i.severity === "error").length,
    warnings: issues.filter((i) => i.severity === "warning").length,
    infos: issues.filter((i) => i.severity === "info").length,
  };
}

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * Interprets a ParsedPage and returns a structured list of SEO/technical issues.
 * Pure function — no I/O, no side effects.
 */
export function analyzePage(parsed: ParsedPage): PageAnalysis {
  const issues: AnalysisIssue[] = [
    ...analyzeTitle(parsed),
    ...analyzeMetaDescription(parsed),
    ...analyzeLanguage(parsed),
    ...analyzeCanonical(parsed),
    ...analyzeViewport(parsed),
    ...analyzeHeadings(parsed),
    ...analyzeImages(parsed),
    ...analyzeOpenGraph(parsed),
    ...analyzeTwitter(parsed),
    ...analyzeTechnical(parsed),
  ];

  return {
    issues,
    summary: buildSummary(issues),
  };
}
