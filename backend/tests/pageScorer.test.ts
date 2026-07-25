import { describe, it, expect } from "vitest";
import { scorePage } from "../src/scorers/pageScorer.js";
import { analyzePage } from "../src/analyzers/pageAnalyzer.js";
import { parseHtml } from "../src/parsers/htmlParser.js";
import type { PageAnalysis } from "../src/types/audit.types.js";
import { PERFECT_HTML, BARE_HTML } from "./fixtures/html.fixtures.js";

const BASE_URL = "https://example.com";

/** Build a PageAnalysis from raw HTML */
function analyzeHtml(html: string): PageAnalysis {
  return analyzePage(parseHtml({ html, url: BASE_URL }));
}

/** Build a synthetic PageAnalysis with a fixed list of issue ids/severities */
function makeAnalysis(
  issues: Array<{
    id: string;
    severity: "error" | "warning" | "info";
    category: "title" | "meta-description" | "canonical" | "headings" | "open-graph" |
               "twitter" | "technical" | "language" | "viewport" | "images";
  }>
): PageAnalysis {
  return {
    issues: issues.map((i) => ({
      id: i.id,
      category: i.category,
      severity: i.severity,
      message: i.id,
      recommendation: "",
    })),
    summary: {
      errors: issues.filter((i) => i.severity === "error").length,
      warnings: issues.filter((i) => i.severity === "warning").length,
      infos: issues.filter((i) => i.severity === "info").length,
    },
  };
}

describe("pageScorer", () => {
  // ── Score range invariants ─────────────────────────────────────────────────

  describe("score range", () => {
    it("scores never exceed 100", () => {
      const result = scorePage(analyzeHtml(PERFECT_HTML));
      expect(result.overallScore).toBeLessThanOrEqual(100);
      expect(result.seoScore).toBeLessThanOrEqual(100);
      expect(result.accessibilityScore).toBeLessThanOrEqual(100);
    });

    it("scores never go below 0", () => {
      // Inject far more errors than could ever subtract 100 points
      const manyErrors = Array.from({ length: 20 }, (_, i) => ({
        id: `title:err-${i}`,
        severity: "error" as const,
        category: "title" as const,
      }));
      const result = scorePage(makeAnalysis(manyErrors));
      expect(result.seoScore).toBeGreaterThanOrEqual(0);
      expect(result.overallScore).toBeGreaterThanOrEqual(0);
    });

    it("all scores are integers", () => {
      const result = scorePage(analyzeHtml(BARE_HTML));
      expect(Number.isInteger(result.overallScore)).toBe(true);
      expect(Number.isInteger(result.seoScore)).toBe(true);
      expect(Number.isInteger(result.accessibilityScore)).toBe(true);
    });
  });

  // ── Perfect page ───────────────────────────────────────────────────────────

  describe("perfect page", () => {
    it("scores 100 for SEO with no issues", () => {
      const result = scorePage(analyzeHtml(PERFECT_HTML));
      expect(result.seoScore).toBe(100);
    });

    it("scores 100 for accessibility with no issues", () => {
      const result = scorePage(analyzeHtml(PERFECT_HTML));
      expect(result.accessibilityScore).toBe(100);
    });

    it("overall score is 100 when both domains are perfect", () => {
      const result = scorePage(analyzeHtml(PERFECT_HTML));
      expect(result.overallScore).toBe(100);
    });
  });

  // ── Score deduction logic ──────────────────────────────────────────────────

  describe("deductions", () => {
    it("a single SEO error deducts 15 from seoScore", () => {
      const result = scorePage(
        makeAnalysis([{ id: "title:missing", severity: "error", category: "title" }])
      );
      expect(result.seoScore).toBe(85);
    });

    it("a single SEO warning deducts 7 from seoScore", () => {
      const result = scorePage(
        makeAnalysis([{ id: "title:too-short", severity: "warning", category: "title" }])
      );
      expect(result.seoScore).toBe(93);
    });

    it("a single SEO info deducts 2 from seoScore", () => {
      const result = scorePage(
        makeAnalysis([{ id: "open-graph:missing-image", severity: "info", category: "open-graph" }])
      );
      expect(result.seoScore).toBe(98);
    });

    it("a single accessibility error deducts 15 from accessibilityScore", () => {
      const result = scorePage(
        makeAnalysis([{ id: "viewport:missing", severity: "error", category: "viewport" }])
      );
      expect(result.accessibilityScore).toBe(85);
    });

    it("SEO issues do NOT affect accessibilityScore", () => {
      const result = scorePage(
        makeAnalysis([{ id: "title:missing", severity: "error", category: "title" }])
      );
      expect(result.accessibilityScore).toBe(100);
    });

    it("accessibility issues do NOT affect seoScore", () => {
      const result = scorePage(
        makeAnalysis([{ id: "viewport:missing", severity: "error", category: "viewport" }])
      );
      expect(result.seoScore).toBe(100);
    });
  });

  // ── Overall score weighting ────────────────────────────────────────────────

  describe("overall weighting", () => {
    it("overall is a weighted composite (60% SEO, 40% accessibility)", () => {
      const result = scorePage(
        makeAnalysis([
          { id: "title:missing", severity: "error", category: "title" },      // SEO -15 → 85
          { id: "viewport:missing", severity: "error", category: "viewport" }, // A11y -15 → 85
        ])
      );
      // Expected: round(85 * 0.6 + 85 * 0.4) = round(51 + 34) = 85
      expect(result.overallScore).toBe(85);
      expect(result.seoScore).toBe(85);
      expect(result.accessibilityScore).toBe(85);
    });

    it("low SEO + perfect a11y produces correct weighted overall", () => {
      const errors = Array.from({ length: 7 }, (_, i) => ({
        id: `title:err-${i}`,
        severity: "error" as const,
        category: "title" as const,
      }));
      const result = scorePage(makeAnalysis(errors));
      // 7 errors × 15 = 105 deductions → clamped to 0 SEO
      // overall = round(0 * 0.6 + 100 * 0.4) = 40
      expect(result.seoScore).toBe(0);
      expect(result.accessibilityScore).toBe(100);
      expect(result.overallScore).toBe(40);
    });
  });

  // ── Breakdown structure ────────────────────────────────────────────────────

  describe("breakdown", () => {
    it("breakdown.seo.start is always 100", () => {
      const result = scorePage(analyzeHtml(BARE_HTML));
      expect(result.breakdown.seo.start).toBe(100);
    });

    it("breakdown includes deduction records for each matched issue", () => {
      const result = scorePage(
        makeAnalysis([
          { id: "title:missing", severity: "error", category: "title" },
          { id: "canonical:missing", severity: "warning", category: "canonical" },
        ])
      );
      expect(result.breakdown.seo.deductions).toHaveLength(2);
      expect(result.breakdown.seo.deductions[0].issueId).toBe("title:missing");
      expect(result.breakdown.seo.deductions[0].points).toBe(15);
    });
  });
});
