"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const pageScorer_js_1 = require("../src/scorers/pageScorer.js");
const pageAnalyzer_js_1 = require("../src/analyzers/pageAnalyzer.js");
const htmlParser_js_1 = require("../src/parsers/htmlParser.js");
const html_fixtures_js_1 = require("./fixtures/html.fixtures.js");
const BASE_URL = "https://example.com";
/** Build a PageAnalysis from raw HTML */
function analyzeHtml(html) {
    return (0, pageAnalyzer_js_1.analyzePage)((0, htmlParser_js_1.parseHtml)({ html, url: BASE_URL }));
}
/** Build a synthetic PageAnalysis with a fixed list of issue ids/severities */
function makeAnalysis(issues) {
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
(0, vitest_1.describe)("pageScorer", () => {
    // ── Score range invariants ─────────────────────────────────────────────────
    (0, vitest_1.describe)("score range", () => {
        (0, vitest_1.it)("scores never exceed 100", () => {
            const result = (0, pageScorer_js_1.scorePage)(analyzeHtml(html_fixtures_js_1.PERFECT_HTML));
            (0, vitest_1.expect)(result.overallScore).toBeLessThanOrEqual(100);
            (0, vitest_1.expect)(result.seoScore).toBeLessThanOrEqual(100);
            (0, vitest_1.expect)(result.accessibilityScore).toBeLessThanOrEqual(100);
        });
        (0, vitest_1.it)("scores never go below 0", () => {
            // Inject far more errors than could ever subtract 100 points
            const manyErrors = Array.from({ length: 20 }, (_, i) => ({
                id: `title:err-${i}`,
                severity: "error",
                category: "title",
            }));
            const result = (0, pageScorer_js_1.scorePage)(makeAnalysis(manyErrors));
            (0, vitest_1.expect)(result.seoScore).toBeGreaterThanOrEqual(0);
            (0, vitest_1.expect)(result.overallScore).toBeGreaterThanOrEqual(0);
        });
        (0, vitest_1.it)("all scores are integers", () => {
            const result = (0, pageScorer_js_1.scorePage)(analyzeHtml(html_fixtures_js_1.BARE_HTML));
            (0, vitest_1.expect)(Number.isInteger(result.overallScore)).toBe(true);
            (0, vitest_1.expect)(Number.isInteger(result.seoScore)).toBe(true);
            (0, vitest_1.expect)(Number.isInteger(result.accessibilityScore)).toBe(true);
        });
    });
    // ── Perfect page ───────────────────────────────────────────────────────────
    (0, vitest_1.describe)("perfect page", () => {
        (0, vitest_1.it)("scores 100 for SEO with no issues", () => {
            const result = (0, pageScorer_js_1.scorePage)(analyzeHtml(html_fixtures_js_1.PERFECT_HTML));
            (0, vitest_1.expect)(result.seoScore).toBe(100);
        });
        (0, vitest_1.it)("scores 100 for accessibility with no issues", () => {
            const result = (0, pageScorer_js_1.scorePage)(analyzeHtml(html_fixtures_js_1.PERFECT_HTML));
            (0, vitest_1.expect)(result.accessibilityScore).toBe(100);
        });
        (0, vitest_1.it)("overall score is 100 when both domains are perfect", () => {
            const result = (0, pageScorer_js_1.scorePage)(analyzeHtml(html_fixtures_js_1.PERFECT_HTML));
            (0, vitest_1.expect)(result.overallScore).toBe(100);
        });
    });
    // ── Score deduction logic ──────────────────────────────────────────────────
    (0, vitest_1.describe)("deductions", () => {
        (0, vitest_1.it)("a single SEO error deducts 15 from seoScore", () => {
            const result = (0, pageScorer_js_1.scorePage)(makeAnalysis([{ id: "title:missing", severity: "error", category: "title" }]));
            (0, vitest_1.expect)(result.seoScore).toBe(85);
        });
        (0, vitest_1.it)("a single SEO warning deducts 7 from seoScore", () => {
            const result = (0, pageScorer_js_1.scorePage)(makeAnalysis([{ id: "title:too-short", severity: "warning", category: "title" }]));
            (0, vitest_1.expect)(result.seoScore).toBe(93);
        });
        (0, vitest_1.it)("a single SEO info deducts 2 from seoScore", () => {
            const result = (0, pageScorer_js_1.scorePage)(makeAnalysis([{ id: "open-graph:missing-image", severity: "info", category: "open-graph" }]));
            (0, vitest_1.expect)(result.seoScore).toBe(98);
        });
        (0, vitest_1.it)("a single accessibility error deducts 15 from accessibilityScore", () => {
            const result = (0, pageScorer_js_1.scorePage)(makeAnalysis([{ id: "viewport:missing", severity: "error", category: "viewport" }]));
            (0, vitest_1.expect)(result.accessibilityScore).toBe(85);
        });
        (0, vitest_1.it)("SEO issues do NOT affect accessibilityScore", () => {
            const result = (0, pageScorer_js_1.scorePage)(makeAnalysis([{ id: "title:missing", severity: "error", category: "title" }]));
            (0, vitest_1.expect)(result.accessibilityScore).toBe(100);
        });
        (0, vitest_1.it)("accessibility issues do NOT affect seoScore", () => {
            const result = (0, pageScorer_js_1.scorePage)(makeAnalysis([{ id: "viewport:missing", severity: "error", category: "viewport" }]));
            (0, vitest_1.expect)(result.seoScore).toBe(100);
        });
    });
    // ── Overall score weighting ────────────────────────────────────────────────
    (0, vitest_1.describe)("overall weighting", () => {
        (0, vitest_1.it)("overall is a weighted composite (60% SEO, 40% accessibility)", () => {
            const result = (0, pageScorer_js_1.scorePage)(makeAnalysis([
                { id: "title:missing", severity: "error", category: "title" }, // SEO -15 → 85
                { id: "viewport:missing", severity: "error", category: "viewport" }, // A11y -15 → 85
            ]));
            // Expected: round(85 * 0.6 + 85 * 0.4) = round(51 + 34) = 85
            (0, vitest_1.expect)(result.overallScore).toBe(85);
            (0, vitest_1.expect)(result.seoScore).toBe(85);
            (0, vitest_1.expect)(result.accessibilityScore).toBe(85);
        });
        (0, vitest_1.it)("low SEO + perfect a11y produces correct weighted overall", () => {
            const errors = Array.from({ length: 7 }, (_, i) => ({
                id: `title:err-${i}`,
                severity: "error",
                category: "title",
            }));
            const result = (0, pageScorer_js_1.scorePage)(makeAnalysis(errors));
            // 7 errors × 15 = 105 deductions → clamped to 0 SEO
            // overall = round(0 * 0.6 + 100 * 0.4) = 40
            (0, vitest_1.expect)(result.seoScore).toBe(0);
            (0, vitest_1.expect)(result.accessibilityScore).toBe(100);
            (0, vitest_1.expect)(result.overallScore).toBe(40);
        });
    });
    // ── Breakdown structure ────────────────────────────────────────────────────
    (0, vitest_1.describe)("breakdown", () => {
        (0, vitest_1.it)("breakdown.seo.start is always 100", () => {
            const result = (0, pageScorer_js_1.scorePage)(analyzeHtml(html_fixtures_js_1.BARE_HTML));
            (0, vitest_1.expect)(result.breakdown.seo.start).toBe(100);
        });
        (0, vitest_1.it)("breakdown includes deduction records for each matched issue", () => {
            const result = (0, pageScorer_js_1.scorePage)(makeAnalysis([
                { id: "title:missing", severity: "error", category: "title" },
                { id: "canonical:missing", severity: "warning", category: "canonical" },
            ]));
            (0, vitest_1.expect)(result.breakdown.seo.deductions).toHaveLength(2);
            (0, vitest_1.expect)(result.breakdown.seo.deductions[0].issueId).toBe("title:missing");
            (0, vitest_1.expect)(result.breakdown.seo.deductions[0].points).toBe(15);
        });
    });
});
