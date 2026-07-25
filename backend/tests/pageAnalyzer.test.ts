import { describe, it, expect } from "vitest";
import { analyzePage } from "../src/analyzers/pageAnalyzer.js";
import { parseHtml } from "../src/parsers/htmlParser.js";
import {
  PERFECT_HTML,
  BARE_HTML,
  MULTI_H1_HTML,
  MISSING_ALT_HTML,
} from "./fixtures/html.fixtures.js";

const BASE_URL = "https://example.com";

// Helper to get issue ids from an analysis
function issueIds(html: string): string[] {
  const parsed = parseHtml({ html, url: BASE_URL });
  return analyzePage(parsed).issues.map((i) => i.id);
}

describe("pageAnalyzer", () => {
  describe("zero issues on a perfect page", () => {
    it("returns no issues", () => {
      const parsed = parseHtml({ html: PERFECT_HTML, url: BASE_URL });
      const result = analyzePage(parsed);
      expect(result.issues).toHaveLength(0);
    });

    it("summary counts are all zero", () => {
      const parsed = parseHtml({ html: PERFECT_HTML, url: BASE_URL });
      const { summary } = analyzePage(parsed);
      expect(summary.errors).toBe(0);
      expect(summary.warnings).toBe(0);
      expect(summary.infos).toBe(0);
    });
  });

  // ── Title rules ────────────────────────────────────────────────────────────

  describe("title", () => {
    it("flags title:missing when <title> is absent", () => {
      expect(issueIds(BARE_HTML)).toContain("title:missing");
    });

    it("flags title:too-short for titles under 30 chars", () => {
      const html = PERFECT_HTML.replace(
        "A perfectly optimised page title here",
        "Short"
      );
      expect(issueIds(html)).toContain("title:too-short");
    });

    it("flags title:too-long for titles over 60 chars", () => {
      const html = PERFECT_HTML.replace(
        "A perfectly optimised page title here",
        "A".repeat(61)
      );
      expect(issueIds(html)).toContain("title:too-long");
    });

    it("does NOT flag title:missing when title is present", () => {
      expect(issueIds(PERFECT_HTML)).not.toContain("title:missing");
    });
  });

  // ── Meta description rules ─────────────────────────────────────────────────

  describe("meta description", () => {
    it("flags meta-description:missing when absent", () => {
      expect(issueIds(BARE_HTML)).toContain("meta-description:missing");
    });

    it("flags meta-description:too-short for descriptions under 120 chars", () => {
      const html = PERFECT_HTML.replace(
        /content="This is a well-written[^"]*"/,
        'content="Too short"'
      );
      expect(issueIds(html)).toContain("meta-description:too-short");
    });

    it("flags meta-description:too-long for descriptions over 160 chars", () => {
      const html = PERFECT_HTML.replace(
        /content="This is a well-written[^"]*"/,
        `content="${"x".repeat(161)}"`
      );
      expect(issueIds(html)).toContain("meta-description:too-long");
    });
  });

  // ── Headings rules ─────────────────────────────────────────────────────────

  describe("headings", () => {
    it("flags headings:no-h1 when no H1 exists", () => {
      expect(issueIds(BARE_HTML)).toContain("headings:no-h1");
    });

    it("flags headings:multiple-h1 when two H1s exist", () => {
      expect(issueIds(MULTI_H1_HTML)).toContain("headings:multiple-h1");
    });

    it("does NOT flag heading issues on perfect page", () => {
      const ids = issueIds(PERFECT_HTML);
      expect(ids).not.toContain("headings:no-h1");
      expect(ids).not.toContain("headings:multiple-h1");
    });
  });

  // ── Viewport rule ──────────────────────────────────────────────────────────

  describe("viewport", () => {
    it("flags viewport:missing when tag is absent", () => {
      expect(issueIds(BARE_HTML)).toContain("viewport:missing");
    });

    it("does NOT flag viewport when present", () => {
      expect(issueIds(PERFECT_HTML)).not.toContain("viewport:missing");
    });
  });

  // ── Image alt rules ────────────────────────────────────────────────────────

  describe("images", () => {
    it("flags images:missing-alt when images lack alt attribute", () => {
      expect(issueIds(MISSING_ALT_HTML)).toContain("images:missing-alt");
    });

    it("does NOT flag images:missing-alt when all images have alt", () => {
      expect(issueIds(PERFECT_HTML)).not.toContain("images:missing-alt");
    });

    it("does NOT flag images:missing-alt when there are no images", () => {
      expect(issueIds(BARE_HTML)).not.toContain("images:missing-alt");
    });
  });

  // ── Summary builder ────────────────────────────────────────────────────────

  describe("summary", () => {
    it("counts errors, warnings, infos correctly", () => {
      const parsed = parseHtml({ html: BARE_HTML, url: BASE_URL });
      const { summary, issues } = analyzePage(parsed);

      const expectedErrors = issues.filter((i) => i.severity === "error").length;
      const expectedWarnings = issues.filter((i) => i.severity === "warning").length;
      const expectedInfos = issues.filter((i) => i.severity === "info").length;

      expect(summary.errors).toBe(expectedErrors);
      expect(summary.warnings).toBe(expectedWarnings);
      expect(summary.infos).toBe(expectedInfos);
    });
  });
});
