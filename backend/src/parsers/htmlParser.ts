import * as cheerio from "cheerio";
import {
  ParsedGeneral,
  ParsedHeadings,
  ParsedImages,
  ParsedLinks,
  ParsedMeta,
  ParsedOpenGraph,
  ParsedPage,
  ParsedTechnical,
  ParsedTwitter,
} from "../types/audit.types.js";

export interface ParserInput {
  html: string;
  /** The final URL of the page (after redirects). Used to classify links. */
  url: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns the trimmed content of a <meta> tag matched by name attribute,
 * or null if the tag is absent or empty.
 */
function getMetaByName(
  $: cheerio.CheerioAPI,
  name: string
): string | null {
  const content = $(`meta[name="${name}"]`).attr("content");
  return content?.trim() || null;
}

/**
 * Returns the trimmed content of a <meta> tag matched by property attribute
 * (used for Open Graph / Twitter tags).
 */
function getMetaByProperty(
  $: cheerio.CheerioAPI,
  property: string
): string | null {
  const content = $(`meta[property="${property}"]`).attr("content");
  return content?.trim() || null;
}

/**
 * Determines whether a href value is an external link relative to the page origin.
 * - Ignores mailto:, tel:, javascript: and fragment-only anchors.
 * - Treats protocol-relative URLs as external.
 * - Treats absolute URLs with a different hostname as external.
 * - Treats relative URLs as internal.
 */
function classifyLink(href: string, pageOrigin: string): "internal" | "external" | "ignore" {
  if (!href) return "ignore";

  const trimmed = href.trim();

  // Skip non-navigational links
  if (
    trimmed.startsWith("mailto:") ||
    trimmed.startsWith("tel:") ||
    trimmed.startsWith("javascript:") ||
    trimmed.startsWith("#")
  ) {
    return "ignore";
  }

  // Relative links are internal
  if (!trimmed.startsWith("http") && !trimmed.startsWith("//")) {
    return "internal";
  }

  try {
    // Normalise protocol-relative URLs before parsing
    const normalized = trimmed.startsWith("//")
      ? `https:${trimmed}`
      : trimmed;
    const linkOrigin = new URL(normalized).origin;
    return linkOrigin === pageOrigin ? "internal" : "external";
  } catch {
    // Malformed URL — treat as internal to avoid false external counts
    return "internal";
  }
}

// ─── Section parsers ──────────────────────────────────────────────────────────

function parseGeneral($: cheerio.CheerioAPI, pageUrl: string): ParsedGeneral {
  return {
    title: $("title").first().text().trim() || null,
    language: $("html").attr("lang")?.trim() || null,
    canonicalUrl: $('link[rel="canonical"]').attr("href")?.trim() || null,
    pageUrl,
  };
}

function parseMeta($: cheerio.CheerioAPI): ParsedMeta {
  return {
    description: getMetaByName($, "description"),
    robots: getMetaByName($, "robots"),
    viewport: getMetaByName($, "viewport"),
  };
}

function parseHeadings($: cheerio.CheerioAPI): ParsedHeadings {
  const h1Elements = $("h1");
  const h1Texts: string[] = [];

  h1Elements.each((_i, el) => {
    const text = $(el).text().trim();
    if (text) h1Texts.push(text);
  });

  return {
    h1Count: h1Elements.length,
    h2Count: $("h2").length,
    h3Count: $("h3").length,
    h1Texts,
  };
}

function parseImages($: cheerio.CheerioAPI): ParsedImages {
  const images = $("img");
  let withAlt = 0;
  let missingAlt = 0;

  images.each((_i, el) => {
    // alt="" is valid (decorative image) — only flag completely absent alt
    const alt = $(el).attr("alt");
    if (alt !== undefined) {
      withAlt++;
    } else {
      missingAlt++;
    }
  });

  return {
    total: images.length,
    withAlt,
    missingAlt,
  };
}

function parseLinks($: cheerio.CheerioAPI, pageUrl: string): ParsedLinks {
  let pageOrigin: string;

  try {
    pageOrigin = new URL(pageUrl).origin;
  } catch {
    pageOrigin = "";
  }

  const anchors = $("a[href]");
  let internal = 0;
  let external = 0;

  anchors.each((_i, el) => {
    const href = $(el).attr("href") ?? "";
    const classification = classifyLink(href, pageOrigin);
    if (classification === "internal") internal++;
    else if (classification === "external") external++;
  });

  return {
    total: anchors.length,
    internal,
    external,
  };
}

function parseOpenGraph($: cheerio.CheerioAPI): ParsedOpenGraph {
  return {
    title: getMetaByProperty($, "og:title"),
    description: getMetaByProperty($, "og:description"),
    image: getMetaByProperty($, "og:image"),
  };
}

function parseTwitter($: cheerio.CheerioAPI): ParsedTwitter {
  return {
    card: getMetaByName($, "twitter:card"),
    title: getMetaByName($, "twitter:title"),
    description: getMetaByName($, "twitter:description"),
  };
}

function parseTechnical($: cheerio.CheerioAPI): ParsedTechnical {
  const favicon =
    $('link[rel="icon"]').length > 0 ||
    $('link[rel="shortcut icon"]').length > 0;

  // <meta charset="UTF-8"> (HTML5) or <meta http-equiv="Content-Type" content="...charset=...">
  let charset: string | null =
    $("meta[charset]").attr("charset")?.trim() || null;

  if (!charset) {
    const contentType = $('meta[http-equiv="Content-Type"]').attr("content");
    if (contentType) {
      const match = /charset=([^\s;]+)/i.exec(contentType);
      charset = match?.[1] ?? null;
    }
  }

  const hasViewport = $('meta[name="viewport"]').length > 0;

  return {
    hasFavicon: favicon,
    charset,
    hasViewport,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Parses a raw HTML string and extracts structured SEO-relevant data.
 * Never throws for absent tags — missing data is expressed as null or 0.
 */
export function parseHtml(input: ParserInput): ParsedPage {
  const $ = cheerio.load(input.html);

  return {
    general: parseGeneral($, input.url),
    meta: parseMeta($),
    headings: parseHeadings($),
    images: parseImages($),
    links: parseLinks($, input.url),
    openGraph: parseOpenGraph($),
    twitter: parseTwitter($),
    technical: parseTechnical($),
    // statusCode will be populated by the service (not the parser's concern)
    statusCode: 0,
  };
}
