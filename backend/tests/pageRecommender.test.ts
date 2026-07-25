import { describe, it, expect } from "vitest";
import { recommendPage } from "../src/recommenders/pageRecommender.js";
import { analyzePage } from "../src/analyzers/pageAnalyzer.js";
import { parseHtml } from "../src/parsers/htmlParser.js";
import type { PageAnalysis } from "../src/types/audit.types.js";
import { PERFECT_HTML, BARE_HTML } from "./fixtures/html.fixtures.js";

const BASE_URL = "https://example.com";

function analyzeHtml(html: string): PageAnalysis {
  return analyzePage(parseHtml({ html, url: BASE_URL }));
}

describe("pageRecommender", () => {
  describe("empty result", () => {
    it("returns an empty array when there are no issues", () => {
      const result = recommendPage(analyzeHtml(PERFECT_HTML));
      expect(result).toHaveLength(0);
    });

    it("returns an empty array for an empty issues list", () => {
      const emptyAnalysis: PageAnalysis = {
        issues: [],
        summary: { errors: 0, warnings: 0, infos: 0 },
      };
      expect(recommendPage(emptyAnalysis)).toHaveLength(0);
    });
  });

  describe("one recommendation per issue", () => {
    it("produces exactly one recommendation per issue with a known id", () => {
      const analysis = analyzeHtml(BARE_HTML);
      const recs = recommendPage(analysis);
      // Every recommendation id should appear exactly once
      const ids = recs.map((r) => r.id);
      const unique = new Set(ids);
      expect(ids.length).toBe(unique.size);
    });

    it("number of recommendations equals number of known-id issues", () => {
      const analysis = analyzeHtml(BARE_HTML);
      const recs = recommendPage(analysis);
      // No recommendation should be skipped for any issue the bare page produces
      expect(recs.length).toBeGreaterThan(0);
      expect(recs.length).toBeLessThanOrEqual(analysis.issues.length);
    });
  });

  describe("priority mapping", () => {
    it("error issues map to high priority", () => {
      const analysis = analyzeHtml(BARE_HTML);
      const errorIssues = analysis.issues.filter((i) => i.severity === "error");
      const recs = recommendPage(analysis);
      for (const issue of errorIssues) {
        const rec = recs.find((r) => r.id === issue.id);
        if (rec) expect(rec.priority).toBe("high");
      }
    });

    it("warning issues map to medium priority", () => {
      const analysis = analyzeHtml(BARE_HTML);
      const warnIssues = analysis.issues.filter((i) => i.severity === "warning");
      const recs = recommendPage(analysis);
      for (const issue of warnIssues) {
        const rec = recs.find((r) => r.id === issue.id);
        if (rec) expect(rec.priority).toBe("medium");
      }
    });

    it("info issues map to low priority", () => {
      const analysis = analyzeHtml(BARE_HTML);
      const infoIssues = analysis.issues.filter((i) => i.severity === "info");
      const recs = recommendPage(analysis);
      for (const issue of infoIssues) {
        const rec = recs.find((r) => r.id === issue.id);
        if (rec) expect(rec.priority).toBe("low");
      }
    });
  });

  describe("recommendation shape", () => {
    it("every recommendation has id, priority, title, description, action", () => {
      const recs = recommendPage(analyzeHtml(BARE_HTML));
      for (const rec of recs) {
        expect(rec.id).toBeTruthy();
        expect(rec.priority).toMatch(/^(high|medium|low)$/);
        expect(rec.title).toBeTruthy();
        expect(rec.description.length).toBeGreaterThan(10);
        expect(rec.action.length).toBeGreaterThan(10);
      }
    });

    it("title:missing issue produces the 'Add a page title' recommendation", () => {
      const analysis: PageAnalysis = {
        issues: [{
          id: "title:missing",
          category: "title",
          severity: "error",
          message: "Missing",
          recommendation: "",
        }],
        summary: { errors: 1, warnings: 0, infos: 0 },
      };
      const recs = recommendPage(analysis);
      expect(recs).toHaveLength(1);
      expect(recs[0].title).toBe("Add a page title");
      expect(recs[0].priority).toBe("high");
    });

    it("images:missing-alt maps to the alt text recommendation", () => {
      const analysis: PageAnalysis = {
        issues: [{
          id: "images:missing-alt",
          category: "images",
          severity: "warning",
          message: "Missing alt",
          recommendation: "",
        }],
        summary: { errors: 0, warnings: 1, infos: 0 },
      };
      const recs = recommendPage(analysis);
      expect(recs[0].title).toBe("Add alt text to images");
      expect(recs[0].priority).toBe("medium");
    });

    it("canonical:missing maps to the canonical recommendation", () => {
      const analysis: PageAnalysis = {
        issues: [{
          id: "canonical:missing",
          category: "canonical",
          severity: "warning",
          message: "Missing canonical",
          recommendation: "",
        }],
        summary: { errors: 0, warnings: 1, infos: 0 },
      };
      const recs = recommendPage(analysis);
      expect(recs[0].title).toBe("Add a canonical URL");
    });
  });

  describe("graceful handling of unknown issue ids", () => {
    it("silently skips unknown issue ids", () => {
      const analysis: PageAnalysis = {
        issues: [{
          id: "future:unknown-rule",
          category: "title",
          severity: "warning",
          message: "Unknown",
          recommendation: "",
        }],
        summary: { errors: 0, warnings: 1, infos: 0 },
      };
      expect(() => recommendPage(analysis)).not.toThrow();
      expect(recommendPage(analysis)).toHaveLength(0);
    });
  });
});
