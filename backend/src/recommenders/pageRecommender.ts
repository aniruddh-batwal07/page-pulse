import {
  AnalysisIssue,
  IssueSeverity,
  PageAnalysis,
  Recommendation,
  RecommendationPriority,
} from "../types/audit.types.js";

// ─── Priority mapping ─────────────────────────────────────────────────────────
//
// Recommendations inherit priority directly from the severity of the issue
// they are derived from. This is intentional — recommendations tell the user
// WHAT to fix, while scores tell them HOW BAD things are. Keeping these two
// concerns separate means you can adjust scoring weights without rewriting
// recommendation copy, and vice versa.

const SEVERITY_TO_PRIORITY: Record<IssueSeverity, RecommendationPriority> = {
  error: "high",
  warning: "medium",
  info: "low",
};

// ─── Recommendation map ───────────────────────────────────────────────────────
//
// Every issue id emitted by pageAnalyzer.ts maps to exactly one static
// recommendation record. The `id` field on each entry matches the issue id
// so the consumer can correlate recommendations back to issues if needed.
//
// Adding a new analyzer rule: add one entry here. No other file changes.

interface RecommendationTemplate {
  title: string;
  description: string;
  action: string;
}

const RECOMMENDATION_MAP: Record<string, RecommendationTemplate> = {
  // ── Title ──────────────────────────────────────────────────────────────────

  "title:missing": {
    title: "Add a page title",
    description:
      "The <title> element is one of the most important on-page SEO signals. " +
      "Search engines display it as the clickable headline in results and use it " +
      "to understand the page's primary topic.",
    action:
      "Add a unique <title> tag inside <head> with between 30 and 60 characters " +
      "that clearly describes the page content.",
  },

  "title:too-short": {
    title: "Lengthen the page title",
    description:
      "Your title is shorter than 30 characters. Short titles miss the opportunity " +
      "to include relevant keywords and may appear thin to search engines.",
    action:
      "Expand the title to at least 30 characters while keeping it under 60, " +
      "incorporating the primary keyword naturally.",
  },

  "title:too-long": {
    title: "Shorten the page title",
    description:
      "Your title exceeds 60 characters. Search engines typically truncate titles " +
      "at around 60 characters in results pages, cutting off your message.",
    action:
      "Trim the title to 60 characters or fewer. Front-load the most important " +
      "keyword so it isn't cut off.",
  },

  // ── Meta Description ───────────────────────────────────────────────────────

  "meta-description:missing": {
    title: "Add a meta description",
    description:
      "A meta description is the short summary displayed beneath your title in " +
      "search results. Without one, search engines will auto-generate a snippet " +
      "from page content — often poorly.",
    action:
      'Add <meta name="description" content="..."> inside <head> with a ' +
      "compelling summary between 120 and 160 characters.",
  },

  "meta-description:too-short": {
    title: "Expand the meta description",
    description:
      "Your meta description is shorter than 120 characters. A brief description " +
      "wastes valuable search snippet space and may not give users enough reason " +
      "to click through.",
    action:
      "Write a description of at least 120 characters that summarises the page " +
      "value and includes a natural call to action.",
  },

  "meta-description:too-long": {
    title: "Shorten the meta description",
    description:
      "Your meta description exceeds 160 characters. Search engines truncate " +
      "descriptions at roughly 160 characters, cutting your message short.",
    action:
      "Trim the description to 160 characters or fewer, keeping the most " +
      "persuasive content at the beginning.",
  },

  // ── Language ───────────────────────────────────────────────────────────────

  "language:missing": {
    title: "Declare the page language",
    description:
      "The lang attribute on <html> tells browsers, screen readers, and search " +
      "engines what language the page is written in. Its absence can affect " +
      "accessibility compliance and international SEO.",
    action:
      'Add lang="en" (or the appropriate BCP-47 code) to the opening <html> tag.',
  },

  // ── Canonical ──────────────────────────────────────────────────────────────

  "canonical:missing": {
    title: "Add a canonical URL",
    description:
      "Without a canonical tag, search engines may index multiple versions of " +
      "the same page (http vs https, www vs non-www, trailing slash variations), " +
      "splitting ranking signals across duplicates.",
    action:
      'Add <link rel="canonical" href="https://yoursite.com/page"> inside ' +
      "<head> pointing to the definitive URL for this page.",
  },

  // ── Viewport ───────────────────────────────────────────────────────────────

  "viewport:missing": {
    title: "Add a viewport meta tag",
    description:
      "The viewport tag controls how the page scales on mobile devices. " +
      "Without it, mobile browsers render the page at desktop width and zoom out, " +
      "creating a poor experience. Google also uses mobile-first indexing.",
    action:
      'Add <meta name="viewport" content="width=device-width, initial-scale=1"> ' +
      "as the first meta tag inside <head>.",
  },

  // ── Headings ───────────────────────────────────────────────────────────────

  "headings:no-h1": {
    title: "Add an H1 heading",
    description:
      "The <h1> is the primary semantic heading of the page and a strong SEO " +
      "signal. Its absence tells search engines — and users — that the page lacks " +
      "a clear main topic.",
    action:
      "Add a single <h1> element that clearly states the main subject of the " +
      "page. It should ideally include the primary keyword.",
  },

  "headings:multiple-h1": {
    title: "Use only one H1 per page",
    description:
      "Multiple <h1> elements dilute the topical signal of your primary heading " +
      "and can confuse both search engines and screen reader users navigating by " +
      "heading structure.",
    action:
      "Keep exactly one <h1> for the page title. Demote any additional <h1> " +
      "elements to <h2> or lower according to the content hierarchy.",
  },

  // ── Images ─────────────────────────────────────────────────────────────────

  "images:missing-alt": {
    title: "Add alt text to images",
    description:
      "Alt attributes describe images to screen readers and search engine " +
      "crawlers. Images without alt text are inaccessible to visually impaired " +
      "users and invisible to image search indexing.",
    action:
      "Add a descriptive alt attribute to every informational image " +
      '(e.g. alt="A screenshot of the dashboard"). Use alt="" for purely ' +
      "decorative images to indicate they should be skipped by screen readers.",
  },

  // ── Open Graph ─────────────────────────────────────────────────────────────

  "open-graph:missing-title": {
    title: "Add an Open Graph title",
    description:
      "The og:title tag controls the title shown when your page is shared on " +
      "social media platforms like Facebook, LinkedIn, and Slack. Without it, " +
      "platforms fall back to the <title> tag or display nothing useful.",
    action:
      'Add <meta property="og:title" content="Your Page Title"> inside <head>.',
  },

  "open-graph:missing-description": {
    title: "Add an Open Graph description",
    description:
      "The og:description tag controls the preview text shown in social media " +
      "link cards. A missing description produces a blank or auto-generated " +
      "snippet that reduces engagement.",
    action:
      'Add <meta property="og:description" content="A short summary..."> ' +
      "inside <head>, ideally 2–4 sentences.",
  },

  "open-graph:missing-image": {
    title: "Add an Open Graph image",
    description:
      "Pages shared without an og:image appear as plain text links on most " +
      "social platforms. A compelling image significantly increases click-through " +
      "rates from social shares.",
    action:
      'Add <meta property="og:image" content="https://yoursite.com/preview.png">. ' +
      "Use an image at least 1200×630px for best results.",
  },

  // ── Twitter ────────────────────────────────────────────────────────────────

  "twitter:missing-card": {
    title: "Add a Twitter card tag",
    description:
      "The twitter:card meta tag enables rich preview cards when your page is " +
      "shared on Twitter/X. Without it, links appear as plain text with no " +
      "visual preview.",
    action:
      'Add <meta name="twitter:card" content="summary_large_image"> inside ' +
      "<head> along with twitter:title, twitter:description, and twitter:image.",
  },

  // ── Technical ──────────────────────────────────────────────────────────────

  "technical:missing-favicon": {
    title: "Add a favicon",
    description:
      "Favicons appear in browser tabs, bookmarks, and mobile home screens. " +
      "A missing favicon causes browsers to make a failed network request and " +
      "gives the site an unpolished, untrustworthy appearance.",
    action:
      'Add <link rel="icon" type="image/png" href="/favicon.png"> inside <head>. ' +
      "Use a 32×32px PNG or SVG file.",
  },

  "technical:missing-charset": {
    title: "Declare the character encoding",
    description:
      "Without a charset declaration, browsers may misinterpret the page " +
      "encoding, leading to garbled characters. The spec also requires charset " +
      "to appear within the first 1024 bytes of the document.",
    action:
      'Add <meta charset="UTF-8"> as the very first element inside <head>, ' +
      "before any other tags including <title>.",
  },
};

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Generates one Recommendation per AnalysisIssue.
 * Issues with no mapping entry are silently skipped (forward-compatibility).
 * Pure function — no I/O, no side effects.
 */
export function recommendPage(analysis: PageAnalysis): Recommendation[] {
  const recommendations: Recommendation[] = [];

  for (const issue of analysis.issues) {
    const template = RECOMMENDATION_MAP[issue.id];

    // Skip unknown issue ids gracefully — future analyzer rules won't break
    if (!template) continue;

    recommendations.push({
      id: issue.id,
      priority: SEVERITY_TO_PRIORITY[issue.severity],
      title: template.title,
      description: template.description,
      action: template.action,
    });
  }

  return recommendations;
}
