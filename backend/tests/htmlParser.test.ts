import { describe, it, expect } from "vitest";
import { parseHtml } from "../src/parsers/htmlParser.js";
import {
  PERFECT_HTML,
  BARE_HTML,
  MULTI_H1_HTML,
  MISSING_ALT_HTML,
  MALFORMED_HTML,
} from "./fixtures/html.fixtures.js";

const BASE_URL = "https://example.com";

describe("htmlParser", () => {
  // ── General ────────────────────────────────────────────────────────────────

  describe("general", () => {
    it("extracts the page title", () => {
      const result = parseHtml({ html: PERFECT_HTML, url: BASE_URL });
      expect(result.general.title).toBe("A perfectly optimised page title here");
    });

    it("returns null title when <title> is missing", () => {
      const result = parseHtml({ html: BARE_HTML, url: BASE_URL });
      expect(result.general.title).toBeNull();
    });

    it("extracts the html lang attribute", () => {
      const result = parseHtml({ html: PERFECT_HTML, url: BASE_URL });
      expect(result.general.language).toBe("en");
    });

    it("returns null language when lang is missing", () => {
      const result = parseHtml({ html: BARE_HTML, url: BASE_URL });
      expect(result.general.language).toBeNull();
    });

    it("extracts the canonical URL", () => {
      const result = parseHtml({ html: PERFECT_HTML, url: BASE_URL });
      expect(result.general.canonicalUrl).toBe("https://example.com/page");
    });

    it("returns null canonical when tag is absent", () => {
      const result = parseHtml({ html: BARE_HTML, url: BASE_URL });
      expect(result.general.canonicalUrl).toBeNull();
    });

    it("preserves the pageUrl from input", () => {
      const result = parseHtml({ html: PERFECT_HTML, url: "https://example.com/page" });
      expect(result.general.pageUrl).toBe("https://example.com/page");
    });
  });

  // ── Meta ───────────────────────────────────────────────────────────────────

  describe("meta", () => {
    it("extracts meta description", () => {
      const result = parseHtml({ html: PERFECT_HTML, url: BASE_URL });
      expect(result.meta.description).not.toBeNull();
      expect(result.meta.description!.length).toBeGreaterThan(120);
    });

    it("returns null description when missing", () => {
      const result = parseHtml({ html: BARE_HTML, url: BASE_URL });
      expect(result.meta.description).toBeNull();
    });

    it("extracts viewport content", () => {
      const result = parseHtml({ html: PERFECT_HTML, url: BASE_URL });
      expect(result.meta.viewport).toContain("width=device-width");
    });

    it("returns null robots when missing", () => {
      const result = parseHtml({ html: PERFECT_HTML, url: BASE_URL });
      expect(result.meta.robots).toBeNull();
    });
  });

  // ── Headings ───────────────────────────────────────────────────────────────

  describe("headings", () => {
    it("counts h1, h2, h3 correctly", () => {
      const result = parseHtml({ html: PERFECT_HTML, url: BASE_URL });
      expect(result.headings.h1Count).toBe(1);
      expect(result.headings.h2Count).toBe(2);
      expect(result.headings.h3Count).toBe(1);
    });

    it("collects h1 text content", () => {
      const result = parseHtml({ html: PERFECT_HTML, url: BASE_URL });
      expect(result.headings.h1Texts).toContain("The One True Heading");
    });

    it("detects multiple h1 elements", () => {
      const result = parseHtml({ html: MULTI_H1_HTML, url: BASE_URL });
      expect(result.headings.h1Count).toBe(2);
      expect(result.headings.h1Texts).toHaveLength(2);
    });

    it("returns zero counts when no headings present", () => {
      const result = parseHtml({ html: BARE_HTML, url: BASE_URL });
      expect(result.headings.h1Count).toBe(0);
      expect(result.headings.h1Texts).toHaveLength(0);
    });
  });

  // ── Images ─────────────────────────────────────────────────────────────────

  describe("images", () => {
    it("counts total images", () => {
      const result = parseHtml({ html: PERFECT_HTML, url: BASE_URL });
      expect(result.images.total).toBe(2);
    });

    it("counts images with alt (including empty alt)", () => {
      const result = parseHtml({ html: PERFECT_HTML, url: BASE_URL });
      expect(result.images.withAlt).toBe(2);
      expect(result.images.missingAlt).toBe(0);
    });

    it("counts images missing alt attribute", () => {
      const result = parseHtml({ html: MISSING_ALT_HTML, url: BASE_URL });
      expect(result.images.missingAlt).toBe(2);
      expect(result.images.withAlt).toBe(1);
    });

    it("returns zero counts when no images", () => {
      const result = parseHtml({ html: BARE_HTML, url: BASE_URL });
      expect(result.images.total).toBe(0);
    });
  });

  // ── Links ──────────────────────────────────────────────────────────────────

  describe("links", () => {
    it("counts total anchor tags", () => {
      const result = parseHtml({ html: PERFECT_HTML, url: BASE_URL });
      expect(result.links.total).toBe(3);
    });

    it("classifies internal vs external links", () => {
      const result = parseHtml({ html: PERFECT_HTML, url: BASE_URL });
      expect(result.links.internal).toBe(2);   // /internal + same-origin
      expect(result.links.external).toBe(1);   // external.com
    });

    it("returns zero links on bare page", () => {
      const result = parseHtml({ html: BARE_HTML, url: BASE_URL });
      expect(result.links.total).toBe(0);
    });
  });

  // ── Open Graph ─────────────────────────────────────────────────────────────

  describe("openGraph", () => {
    it("extracts og:title, og:description, og:image", () => {
      const result = parseHtml({ html: PERFECT_HTML, url: BASE_URL });
      expect(result.openGraph.title).toBe("Perfect OG title");
      expect(result.openGraph.description).toBe("Perfect OG description for social sharing");
      expect(result.openGraph.image).toBe("https://example.com/og.png");
    });

    it("returns nulls when OG tags are absent", () => {
      const result = parseHtml({ html: BARE_HTML, url: BASE_URL });
      expect(result.openGraph.title).toBeNull();
      expect(result.openGraph.description).toBeNull();
      expect(result.openGraph.image).toBeNull();
    });
  });

  // ── Twitter ────────────────────────────────────────────────────────────────

  describe("twitter", () => {
    it("extracts twitter card tags", () => {
      const result = parseHtml({ html: PERFECT_HTML, url: BASE_URL });
      expect(result.twitter.card).toBe("summary_large_image");
      expect(result.twitter.title).toBe("Perfect Twitter title");
    });

    it("returns nulls when twitter tags are absent", () => {
      const result = parseHtml({ html: BARE_HTML, url: BASE_URL });
      expect(result.twitter.card).toBeNull();
    });
  });

  // ── Technical ──────────────────────────────────────────────────────────────

  describe("technical", () => {
    it("detects favicon presence", () => {
      const result = parseHtml({ html: PERFECT_HTML, url: BASE_URL });
      expect(result.technical.hasFavicon).toBe(true);
    });

    it("detects missing favicon", () => {
      const result = parseHtml({ html: BARE_HTML, url: BASE_URL });
      expect(result.technical.hasFavicon).toBe(false);
    });

    it("extracts charset", () => {
      const result = parseHtml({ html: PERFECT_HTML, url: BASE_URL });
      expect(result.technical.charset).toBe("UTF-8");
    });

    it("returns null charset when absent", () => {
      const result = parseHtml({ html: BARE_HTML, url: BASE_URL });
      expect(result.technical.charset).toBeNull();
    });

    it("detects viewport presence", () => {
      const result = parseHtml({ html: PERFECT_HTML, url: BASE_URL });
      expect(result.technical.hasViewport).toBe(true);
    });

    it("detects missing viewport", () => {
      const result = parseHtml({ html: BARE_HTML, url: BASE_URL });
      expect(result.technical.hasViewport).toBe(false);
    });
  });

  // ── Resilience ─────────────────────────────────────────────────────────────

  describe("resilience", () => {
    it("does not throw on malformed HTML", () => {
      expect(() => parseHtml({ html: MALFORMED_HTML, url: BASE_URL })).not.toThrow();
    });

    it("parses a title from malformed HTML", () => {
      const result = parseHtml({ html: MALFORMED_HTML, url: BASE_URL });
      expect(result.general.title).toBe("Broken");
    });

    it("does not throw on empty string", () => {
      expect(() => parseHtml({ html: "", url: BASE_URL })).not.toThrow();
    });
  });
});
