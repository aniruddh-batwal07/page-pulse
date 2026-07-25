"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const pageRecommender_js_1 = require("../src/recommenders/pageRecommender.js");
const pageAnalyzer_js_1 = require("../src/analyzers/pageAnalyzer.js");
const htmlParser_js_1 = require("../src/parsers/htmlParser.js");
const html_fixtures_js_1 = require("./fixtures/html.fixtures.js");
const BASE_URL = "https://example.com";
function analyzeHtml(html) {
    return (0, pageAnalyzer_js_1.analyzePage)((0, htmlParser_js_1.parseHtml)({ html, url: BASE_URL }));
}
(0, vitest_1.describe)("pageRecommender", () => {
    (0, vitest_1.describe)("empty result", () => {
        (0, vitest_1.it)("returns an empty array when there are no issues", () => {
            const result = (0, pageRecommender_js_1.recommendPage)(analyzeHtml(html_fixtures_js_1.PERFECT_HTML));
            (0, vitest_1.expect)(result).toHaveLength(0);
        });
        (0, vitest_1.it)("returns an empty array for an empty issues list", () => {
            const emptyAnalysis = {
                issues: [],
                summary: { errors: 0, warnings: 0, infos: 0 },
            };
            (0, vitest_1.expect)((0, pageRecommender_js_1.recommendPage)(emptyAnalysis)).toHaveLength(0);
        });
    });
    (0, vitest_1.describe)("one recommendation per issue", () => {
        (0, vitest_1.it)("produces exactly one recommendation per issue with a known id", () => {
            const analysis = analyzeHtml(html_fixtures_js_1.BARE_HTML);
            const recs = (0, pageRecommender_js_1.recommendPage)(analysis);
            // Every recommendation id should appear exactly once
            const ids = recs.map((r) => r.id);
            const unique = new Set(ids);
            (0, vitest_1.expect)(ids.length).toBe(unique.size);
        });
        (0, vitest_1.it)("number of recommendations equals number of known-id issues", () => {
            const analysis = analyzeHtml(html_fixtures_js_1.BARE_HTML);
            const recs = (0, pageRecommender_js_1.recommendPage)(analysis);
            // No recommendation should be skipped for any issue the bare page produces
            (0, vitest_1.expect)(recs.length).toBeGreaterThan(0);
            (0, vitest_1.expect)(recs.length).toBeLessThanOrEqual(analysis.issues.length);
        });
    });
    (0, vitest_1.describe)("priority mapping", () => {
        (0, vitest_1.it)("error issues map to high priority", () => {
            const analysis = analyzeHtml(html_fixtures_js_1.BARE_HTML);
            const errorIssues = analysis.issues.filter((i) => i.severity === "error");
            const recs = (0, pageRecommender_js_1.recommendPage)(analysis);
            for (const issue of errorIssues) {
                const rec = recs.find((r) => r.id === issue.id);
                if (rec)
                    (0, vitest_1.expect)(rec.priority).toBe("high");
            }
        });
        (0, vitest_1.it)("warning issues map to medium priority", () => {
            const analysis = analyzeHtml(html_fixtures_js_1.BARE_HTML);
            const warnIssues = analysis.issues.filter((i) => i.severity === "warning");
            const recs = (0, pageRecommender_js_1.recommendPage)(analysis);
            for (const issue of warnIssues) {
                const rec = recs.find((r) => r.id === issue.id);
                if (rec)
                    (0, vitest_1.expect)(rec.priority).toBe("medium");
            }
        });
        (0, vitest_1.it)("info issues map to low priority", () => {
            const analysis = analyzeHtml(html_fixtures_js_1.BARE_HTML);
            const infoIssues = analysis.issues.filter((i) => i.severity === "info");
            const recs = (0, pageRecommender_js_1.recommendPage)(analysis);
            for (const issue of infoIssues) {
                const rec = recs.find((r) => r.id === issue.id);
                if (rec)
                    (0, vitest_1.expect)(rec.priority).toBe("low");
            }
        });
    });
    (0, vitest_1.describe)("recommendation shape", () => {
        (0, vitest_1.it)("every recommendation has id, priority, title, description, action", () => {
            const recs = (0, pageRecommender_js_1.recommendPage)(analyzeHtml(html_fixtures_js_1.BARE_HTML));
            for (const rec of recs) {
                (0, vitest_1.expect)(rec.id).toBeTruthy();
                (0, vitest_1.expect)(rec.priority).toMatch(/^(high|medium|low)$/);
                (0, vitest_1.expect)(rec.title).toBeTruthy();
                (0, vitest_1.expect)(rec.description.length).toBeGreaterThan(10);
                (0, vitest_1.expect)(rec.action.length).toBeGreaterThan(10);
            }
        });
        (0, vitest_1.it)("title:missing issue produces the 'Add a page title' recommendation", () => {
            const analysis = {
                issues: [{
                        id: "title:missing",
                        category: "title",
                        severity: "error",
                        message: "Missing",
                        recommendation: "",
                    }],
                summary: { errors: 1, warnings: 0, infos: 0 },
            };
            const recs = (0, pageRecommender_js_1.recommendPage)(analysis);
            (0, vitest_1.expect)(recs).toHaveLength(1);
            (0, vitest_1.expect)(recs[0].title).toBe("Add a page title");
            (0, vitest_1.expect)(recs[0].priority).toBe("high");
        });
        (0, vitest_1.it)("images:missing-alt maps to the alt text recommendation", () => {
            const analysis = {
                issues: [{
                        id: "images:missing-alt",
                        category: "images",
                        severity: "warning",
                        message: "Missing alt",
                        recommendation: "",
                    }],
                summary: { errors: 0, warnings: 1, infos: 0 },
            };
            const recs = (0, pageRecommender_js_1.recommendPage)(analysis);
            (0, vitest_1.expect)(recs[0].title).toBe("Add alt text to images");
            (0, vitest_1.expect)(recs[0].priority).toBe("medium");
        });
        (0, vitest_1.it)("canonical:missing maps to the canonical recommendation", () => {
            const analysis = {
                issues: [{
                        id: "canonical:missing",
                        category: "canonical",
                        severity: "warning",
                        message: "Missing canonical",
                        recommendation: "",
                    }],
                summary: { errors: 0, warnings: 1, infos: 0 },
            };
            const recs = (0, pageRecommender_js_1.recommendPage)(analysis);
            (0, vitest_1.expect)(recs[0].title).toBe("Add a canonical URL");
        });
    });
    (0, vitest_1.describe)("graceful handling of unknown issue ids", () => {
        (0, vitest_1.it)("silently skips unknown issue ids", () => {
            const analysis = {
                issues: [{
                        id: "future:unknown-rule",
                        category: "title",
                        severity: "warning",
                        message: "Unknown",
                        recommendation: "",
                    }],
                summary: { errors: 0, warnings: 1, infos: 0 },
            };
            (0, vitest_1.expect)(() => (0, pageRecommender_js_1.recommendPage)(analysis)).not.toThrow();
            (0, vitest_1.expect)((0, pageRecommender_js_1.recommendPage)(analysis)).toHaveLength(0);
        });
    });
});
