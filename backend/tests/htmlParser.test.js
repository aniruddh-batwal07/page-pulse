"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const htmlParser_js_1 = require("../src/parsers/htmlParser.js");
const html_fixtures_js_1 = require("./fixtures/html.fixtures.js");
const BASE_URL = "https://example.com";
(0, vitest_1.describe)("htmlParser", () => {
    // ── General ────────────────────────────────────────────────────────────────
    (0, vitest_1.describe)("general", () => {
        (0, vitest_1.it)("extracts the page title", () => {
            const result = (0, htmlParser_js_1.parseHtml)({ html: html_fixtures_js_1.PERFECT_HTML, url: BASE_URL });
            (0, vitest_1.expect)(result.general.title).toBe("A perfectly optimised page title here");
        });
        (0, vitest_1.it)("returns null title when <title> is missing", () => {
            const result = (0, htmlParser_js_1.parseHtml)({ html: html_fixtures_js_1.BARE_HTML, url: BASE_URL });
            (0, vitest_1.expect)(result.general.title).toBeNull();
        });
        (0, vitest_1.it)("extracts the html lang attribute", () => {
            const result = (0, htmlParser_js_1.parseHtml)({ html: html_fixtures_js_1.PERFECT_HTML, url: BASE_URL });
            (0, vitest_1.expect)(result.general.language).toBe("en");
        });
        (0, vitest_1.it)("returns null language when lang is missing", () => {
            const result = (0, htmlParser_js_1.parseHtml)({ html: html_fixtures_js_1.BARE_HTML, url: BASE_URL });
            (0, vitest_1.expect)(result.general.language).toBeNull();
        });
        (0, vitest_1.it)("extracts the canonical URL", () => {
            const result = (0, htmlParser_js_1.parseHtml)({ html: html_fixtures_js_1.PERFECT_HTML, url: BASE_URL });
            (0, vitest_1.expect)(result.general.canonicalUrl).toBe("https://example.com/page");
        });
        (0, vitest_1.it)("returns null canonical when tag is absent", () => {
            const result = (0, htmlParser_js_1.parseHtml)({ html: html_fixtures_js_1.BARE_HTML, url: BASE_URL });
            (0, vitest_1.expect)(result.general.canonicalUrl).toBeNull();
        });
        (0, vitest_1.it)("preserves the pageUrl from input", () => {
            const result = (0, htmlParser_js_1.parseHtml)({ html: html_fixtures_js_1.PERFECT_HTML, url: "https://example.com/page" });
            (0, vitest_1.expect)(result.general.pageUrl).toBe("https://example.com/page");
        });
    });
    // ── Meta ───────────────────────────────────────────────────────────────────
    (0, vitest_1.describe)("meta", () => {
        (0, vitest_1.it)("extracts meta description", () => {
            const result = (0, htmlParser_js_1.parseHtml)({ html: html_fixtures_js_1.PERFECT_HTML, url: BASE_URL });
            (0, vitest_1.expect)(result.meta.description).not.toBeNull();
            (0, vitest_1.expect)(result.meta.description.length).toBeGreaterThan(120);
        });
        (0, vitest_1.it)("returns null description when missing", () => {
            const result = (0, htmlParser_js_1.parseHtml)({ html: html_fixtures_js_1.BARE_HTML, url: BASE_URL });
            (0, vitest_1.expect)(result.meta.description).toBeNull();
        });
        (0, vitest_1.it)("extracts viewport content", () => {
            const result = (0, htmlParser_js_1.parseHtml)({ html: html_fixtures_js_1.PERFECT_HTML, url: BASE_URL });
            (0, vitest_1.expect)(result.meta.viewport).toContain("width=device-width");
        });
        (0, vitest_1.it)("returns null robots when missing", () => {
            const result = (0, htmlParser_js_1.parseHtml)({ html: html_fixtures_js_1.PERFECT_HTML, url: BASE_URL });
            (0, vitest_1.expect)(result.meta.robots).toBeNull();
        });
    });
    // ── Headings ───────────────────────────────────────────────────────────────
    (0, vitest_1.describe)("headings", () => {
        (0, vitest_1.it)("counts h1, h2, h3 correctly", () => {
            const result = (0, htmlParser_js_1.parseHtml)({ html: html_fixtures_js_1.PERFECT_HTML, url: BASE_URL });
            (0, vitest_1.expect)(result.headings.h1Count).toBe(1);
            (0, vitest_1.expect)(result.headings.h2Count).toBe(2);
            (0, vitest_1.expect)(result.headings.h3Count).toBe(1);
        });
        (0, vitest_1.it)("collects h1 text content", () => {
            const result = (0, htmlParser_js_1.parseHtml)({ html: html_fixtures_js_1.PERFECT_HTML, url: BASE_URL });
            (0, vitest_1.expect)(result.headings.h1Texts).toContain("The One True Heading");
        });
        (0, vitest_1.it)("detects multiple h1 elements", () => {
            const result = (0, htmlParser_js_1.parseHtml)({ html: html_fixtures_js_1.MULTI_H1_HTML, url: BASE_URL });
            (0, vitest_1.expect)(result.headings.h1Count).toBe(2);
            (0, vitest_1.expect)(result.headings.h1Texts).toHaveLength(2);
        });
        (0, vitest_1.it)("returns zero counts when no headings present", () => {
            const result = (0, htmlParser_js_1.parseHtml)({ html: html_fixtures_js_1.BARE_HTML, url: BASE_URL });
            (0, vitest_1.expect)(result.headings.h1Count).toBe(0);
            (0, vitest_1.expect)(result.headings.h1Texts).toHaveLength(0);
        });
    });
    // ── Images ─────────────────────────────────────────────────────────────────
    (0, vitest_1.describe)("images", () => {
        (0, vitest_1.it)("counts total images", () => {
            const result = (0, htmlParser_js_1.parseHtml)({ html: html_fixtures_js_1.PERFECT_HTML, url: BASE_URL });
            (0, vitest_1.expect)(result.images.total).toBe(2);
        });
        (0, vitest_1.it)("counts images with alt (including empty alt)", () => {
            const result = (0, htmlParser_js_1.parseHtml)({ html: html_fixtures_js_1.PERFECT_HTML, url: BASE_URL });
            (0, vitest_1.expect)(result.images.withAlt).toBe(2);
            (0, vitest_1.expect)(result.images.missingAlt).toBe(0);
        });
        (0, vitest_1.it)("counts images missing alt attribute", () => {
            const result = (0, htmlParser_js_1.parseHtml)({ html: html_fixtures_js_1.MISSING_ALT_HTML, url: BASE_URL });
            (0, vitest_1.expect)(result.images.missingAlt).toBe(2);
            (0, vitest_1.expect)(result.images.withAlt).toBe(1);
        });
        (0, vitest_1.it)("returns zero counts when no images", () => {
            const result = (0, htmlParser_js_1.parseHtml)({ html: html_fixtures_js_1.BARE_HTML, url: BASE_URL });
            (0, vitest_1.expect)(result.images.total).toBe(0);
        });
    });
    // ── Links ──────────────────────────────────────────────────────────────────
    (0, vitest_1.describe)("links", () => {
        (0, vitest_1.it)("counts total anchor tags", () => {
            const result = (0, htmlParser_js_1.parseHtml)({ html: html_fixtures_js_1.PERFECT_HTML, url: BASE_URL });
            (0, vitest_1.expect)(result.links.total).toBe(3);
        });
        (0, vitest_1.it)("classifies internal vs external links", () => {
            const result = (0, htmlParser_js_1.parseHtml)({ html: html_fixtures_js_1.PERFECT_HTML, url: BASE_URL });
            (0, vitest_1.expect)(result.links.internal).toBe(2); // /internal + same-origin
            (0, vitest_1.expect)(result.links.external).toBe(1); // external.com
        });
        (0, vitest_1.it)("returns zero links on bare page", () => {
            const result = (0, htmlParser_js_1.parseHtml)({ html: html_fixtures_js_1.BARE_HTML, url: BASE_URL });
            (0, vitest_1.expect)(result.links.total).toBe(0);
        });
    });
    // ── Open Graph ─────────────────────────────────────────────────────────────
    (0, vitest_1.describe)("openGraph", () => {
        (0, vitest_1.it)("extracts og:title, og:description, og:image", () => {
            const result = (0, htmlParser_js_1.parseHtml)({ html: html_fixtures_js_1.PERFECT_HTML, url: BASE_URL });
            (0, vitest_1.expect)(result.openGraph.title).toBe("Perfect OG title");
            (0, vitest_1.expect)(result.openGraph.description).toBe("Perfect OG description for social sharing");
            (0, vitest_1.expect)(result.openGraph.image).toBe("https://example.com/og.png");
        });
        (0, vitest_1.it)("returns nulls when OG tags are absent", () => {
            const result = (0, htmlParser_js_1.parseHtml)({ html: html_fixtures_js_1.BARE_HTML, url: BASE_URL });
            (0, vitest_1.expect)(result.openGraph.title).toBeNull();
            (0, vitest_1.expect)(result.openGraph.description).toBeNull();
            (0, vitest_1.expect)(result.openGraph.image).toBeNull();
        });
    });
    // ── Twitter ────────────────────────────────────────────────────────────────
    (0, vitest_1.describe)("twitter", () => {
        (0, vitest_1.it)("extracts twitter card tags", () => {
            const result = (0, htmlParser_js_1.parseHtml)({ html: html_fixtures_js_1.PERFECT_HTML, url: BASE_URL });
            (0, vitest_1.expect)(result.twitter.card).toBe("summary_large_image");
            (0, vitest_1.expect)(result.twitter.title).toBe("Perfect Twitter title");
        });
        (0, vitest_1.it)("returns nulls when twitter tags are absent", () => {
            const result = (0, htmlParser_js_1.parseHtml)({ html: html_fixtures_js_1.BARE_HTML, url: BASE_URL });
            (0, vitest_1.expect)(result.twitter.card).toBeNull();
        });
    });
    // ── Technical ──────────────────────────────────────────────────────────────
    (0, vitest_1.describe)("technical", () => {
        (0, vitest_1.it)("detects favicon presence", () => {
            const result = (0, htmlParser_js_1.parseHtml)({ html: html_fixtures_js_1.PERFECT_HTML, url: BASE_URL });
            (0, vitest_1.expect)(result.technical.hasFavicon).toBe(true);
        });
        (0, vitest_1.it)("detects missing favicon", () => {
            const result = (0, htmlParser_js_1.parseHtml)({ html: html_fixtures_js_1.BARE_HTML, url: BASE_URL });
            (0, vitest_1.expect)(result.technical.hasFavicon).toBe(false);
        });
        (0, vitest_1.it)("extracts charset", () => {
            const result = (0, htmlParser_js_1.parseHtml)({ html: html_fixtures_js_1.PERFECT_HTML, url: BASE_URL });
            (0, vitest_1.expect)(result.technical.charset).toBe("UTF-8");
        });
        (0, vitest_1.it)("returns null charset when absent", () => {
            const result = (0, htmlParser_js_1.parseHtml)({ html: html_fixtures_js_1.BARE_HTML, url: BASE_URL });
            (0, vitest_1.expect)(result.technical.charset).toBeNull();
        });
        (0, vitest_1.it)("detects viewport presence", () => {
            const result = (0, htmlParser_js_1.parseHtml)({ html: html_fixtures_js_1.PERFECT_HTML, url: BASE_URL });
            (0, vitest_1.expect)(result.technical.hasViewport).toBe(true);
        });
        (0, vitest_1.it)("detects missing viewport", () => {
            const result = (0, htmlParser_js_1.parseHtml)({ html: html_fixtures_js_1.BARE_HTML, url: BASE_URL });
            (0, vitest_1.expect)(result.technical.hasViewport).toBe(false);
        });
    });
    // ── Resilience ─────────────────────────────────────────────────────────────
    (0, vitest_1.describe)("resilience", () => {
        (0, vitest_1.it)("does not throw on malformed HTML", () => {
            (0, vitest_1.expect)(() => (0, htmlParser_js_1.parseHtml)({ html: html_fixtures_js_1.MALFORMED_HTML, url: BASE_URL })).not.toThrow();
        });
        (0, vitest_1.it)("parses a title from malformed HTML", () => {
            const result = (0, htmlParser_js_1.parseHtml)({ html: html_fixtures_js_1.MALFORMED_HTML, url: BASE_URL });
            (0, vitest_1.expect)(result.general.title).toBe("Broken");
        });
        (0, vitest_1.it)("does not throw on empty string", () => {
            (0, vitest_1.expect)(() => (0, htmlParser_js_1.parseHtml)({ html: "", url: BASE_URL })).not.toThrow();
        });
    });
});
