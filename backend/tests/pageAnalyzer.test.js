"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const pageAnalyzer_js_1 = require("../src/analyzers/pageAnalyzer.js");
const htmlParser_js_1 = require("../src/parsers/htmlParser.js");
const html_fixtures_js_1 = require("./fixtures/html.fixtures.js");
const BASE_URL = "https://example.com";
// Helper to get issue ids from an analysis
function issueIds(html) {
    const parsed = (0, htmlParser_js_1.parseHtml)({ html, url: BASE_URL });
    return (0, pageAnalyzer_js_1.analyzePage)(parsed).issues.map((i) => i.id);
}
(0, vitest_1.describe)("pageAnalyzer", () => {
    (0, vitest_1.describe)("zero issues on a perfect page", () => {
        (0, vitest_1.it)("returns no issues", () => {
            const parsed = (0, htmlParser_js_1.parseHtml)({ html: html_fixtures_js_1.PERFECT_HTML, url: BASE_URL });
            const result = (0, pageAnalyzer_js_1.analyzePage)(parsed);
            (0, vitest_1.expect)(result.issues).toHaveLength(0);
        });
        (0, vitest_1.it)("summary counts are all zero", () => {
            const parsed = (0, htmlParser_js_1.parseHtml)({ html: html_fixtures_js_1.PERFECT_HTML, url: BASE_URL });
            const { summary } = (0, pageAnalyzer_js_1.analyzePage)(parsed);
            (0, vitest_1.expect)(summary.errors).toBe(0);
            (0, vitest_1.expect)(summary.warnings).toBe(0);
            (0, vitest_1.expect)(summary.infos).toBe(0);
        });
    });
    // ── Title rules ────────────────────────────────────────────────────────────
    (0, vitest_1.describe)("title", () => {
        (0, vitest_1.it)("flags title:missing when <title> is absent", () => {
            (0, vitest_1.expect)(issueIds(html_fixtures_js_1.BARE_HTML)).toContain("title:missing");
        });
        (0, vitest_1.it)("flags title:too-short for titles under 30 chars", () => {
            const html = html_fixtures_js_1.PERFECT_HTML.replace("A perfectly optimised page title here", "Short");
            (0, vitest_1.expect)(issueIds(html)).toContain("title:too-short");
        });
        (0, vitest_1.it)("flags title:too-long for titles over 60 chars", () => {
            const html = html_fixtures_js_1.PERFECT_HTML.replace("A perfectly optimised page title here", "A".repeat(61));
            (0, vitest_1.expect)(issueIds(html)).toContain("title:too-long");
        });
        (0, vitest_1.it)("does NOT flag title:missing when title is present", () => {
            (0, vitest_1.expect)(issueIds(html_fixtures_js_1.PERFECT_HTML)).not.toContain("title:missing");
        });
    });
    // ── Meta description rules ─────────────────────────────────────────────────
    (0, vitest_1.describe)("meta description", () => {
        (0, vitest_1.it)("flags meta-description:missing when absent", () => {
            (0, vitest_1.expect)(issueIds(html_fixtures_js_1.BARE_HTML)).toContain("meta-description:missing");
        });
        (0, vitest_1.it)("flags meta-description:too-short for descriptions under 120 chars", () => {
            const html = html_fixtures_js_1.PERFECT_HTML.replace(/content="This is a well-written[^"]*"/, 'content="Too short"');
            (0, vitest_1.expect)(issueIds(html)).toContain("meta-description:too-short");
        });
        (0, vitest_1.it)("flags meta-description:too-long for descriptions over 160 chars", () => {
            const html = html_fixtures_js_1.PERFECT_HTML.replace(/content="This is a well-written[^"]*"/, `content="${"x".repeat(161)}"`);
            (0, vitest_1.expect)(issueIds(html)).toContain("meta-description:too-long");
        });
    });
    // ── Headings rules ─────────────────────────────────────────────────────────
    (0, vitest_1.describe)("headings", () => {
        (0, vitest_1.it)("flags headings:no-h1 when no H1 exists", () => {
            (0, vitest_1.expect)(issueIds(html_fixtures_js_1.BARE_HTML)).toContain("headings:no-h1");
        });
        (0, vitest_1.it)("flags headings:multiple-h1 when two H1s exist", () => {
            (0, vitest_1.expect)(issueIds(html_fixtures_js_1.MULTI_H1_HTML)).toContain("headings:multiple-h1");
        });
        (0, vitest_1.it)("does NOT flag heading issues on perfect page", () => {
            const ids = issueIds(html_fixtures_js_1.PERFECT_HTML);
            (0, vitest_1.expect)(ids).not.toContain("headings:no-h1");
            (0, vitest_1.expect)(ids).not.toContain("headings:multiple-h1");
        });
    });
    // ── Viewport rule ──────────────────────────────────────────────────────────
    (0, vitest_1.describe)("viewport", () => {
        (0, vitest_1.it)("flags viewport:missing when tag is absent", () => {
            (0, vitest_1.expect)(issueIds(html_fixtures_js_1.BARE_HTML)).toContain("viewport:missing");
        });
        (0, vitest_1.it)("does NOT flag viewport when present", () => {
            (0, vitest_1.expect)(issueIds(html_fixtures_js_1.PERFECT_HTML)).not.toContain("viewport:missing");
        });
    });
    // ── Image alt rules ────────────────────────────────────────────────────────
    (0, vitest_1.describe)("images", () => {
        (0, vitest_1.it)("flags images:missing-alt when images lack alt attribute", () => {
            (0, vitest_1.expect)(issueIds(html_fixtures_js_1.MISSING_ALT_HTML)).toContain("images:missing-alt");
        });
        (0, vitest_1.it)("does NOT flag images:missing-alt when all images have alt", () => {
            (0, vitest_1.expect)(issueIds(html_fixtures_js_1.PERFECT_HTML)).not.toContain("images:missing-alt");
        });
        (0, vitest_1.it)("does NOT flag images:missing-alt when there are no images", () => {
            (0, vitest_1.expect)(issueIds(html_fixtures_js_1.BARE_HTML)).not.toContain("images:missing-alt");
        });
    });
    // ── Summary builder ────────────────────────────────────────────────────────
    (0, vitest_1.describe)("summary", () => {
        (0, vitest_1.it)("counts errors, warnings, infos correctly", () => {
            const parsed = (0, htmlParser_js_1.parseHtml)({ html: html_fixtures_js_1.BARE_HTML, url: BASE_URL });
            const { summary, issues } = (0, pageAnalyzer_js_1.analyzePage)(parsed);
            const expectedErrors = issues.filter((i) => i.severity === "error").length;
            const expectedWarnings = issues.filter((i) => i.severity === "warning").length;
            const expectedInfos = issues.filter((i) => i.severity === "info").length;
            (0, vitest_1.expect)(summary.errors).toBe(expectedErrors);
            (0, vitest_1.expect)(summary.warnings).toBe(expectedWarnings);
            (0, vitest_1.expect)(summary.infos).toBe(expectedInfos);
        });
    });
});
