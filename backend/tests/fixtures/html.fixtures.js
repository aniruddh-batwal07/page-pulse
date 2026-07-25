"use strict";
// ─── Shared HTML fixtures for backend tests ───────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.MALFORMED_HTML = exports.MISSING_ALT_HTML = exports.MULTI_H1_HTML = exports.BARE_HTML = exports.PERFECT_HTML = void 0;
/** A fully compliant page — should produce zero issues */
exports.PERFECT_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>A perfectly optimised page title here</title>
  <meta name="description" content="This is a well-written meta description that sits comfortably between one hundred and twenty and one hundred and sixty characters total length.">
  <link rel="canonical" href="https://example.com/page">
  <link rel="icon" href="/favicon.ico">
  <meta property="og:title" content="Perfect OG title">
  <meta property="og:description" content="Perfect OG description for social sharing">
  <meta property="og:image" content="https://example.com/og.png">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Perfect Twitter title">
  <meta name="twitter:description" content="Perfect Twitter description">
</head>
<body>
  <h1>The One True Heading</h1>
  <h2>Subheading One</h2>
  <h2>Subheading Two</h2>
  <h3>Sub-sub heading</h3>
  <img src="img1.jpg" alt="A descriptive alt text">
  <img src="img2.jpg" alt="">
  <a href="/internal">Internal link</a>
  <a href="https://external.com">External link</a>
  <a href="https://example.com/same-origin">Same origin</a>
</body>
</html>`;
/** A completely bare page — should trigger maximum issues */
exports.BARE_HTML = `<html><body><p>Hello</p></body></html>`;
/** Page with multiple H1s */
exports.MULTI_H1_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>A page with multiple H1 headings present on it</title>
  <meta name="description" content="${"x".repeat(130)}">
  <link rel="canonical" href="https://example.com/">
  <link rel="icon" href="/fav.ico">
  <meta property="og:title" content="OG">
  <meta property="og:description" content="OG Desc">
  <meta property="og:image" content="https://example.com/img.png">
  <meta name="twitter:card" content="summary_large_image">
</head>
<body>
  <h1>First H1</h1>
  <h1>Second H1</h1>
</body>
</html>`;
/** Page with images missing alt attributes */
exports.MISSING_ALT_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>A page that has images missing alt attributes set</title>
  <meta name="description" content="${"x".repeat(130)}">
  <link rel="canonical" href="https://example.com/">
  <link rel="icon" href="/fav.ico">
  <meta property="og:title" content="OG">
  <meta property="og:description" content="OG Desc">
  <meta property="og:image" content="https://example.com/img.png">
  <meta name="twitter:card" content="summary_large_image">
</head>
<body>
  <h1>Main Heading</h1>
  <img src="a.jpg">
  <img src="b.jpg">
  <img src="c.jpg" alt="has alt">
</body>
</html>`;
/** Malformed HTML — Cheerio should still parse it gracefully */
exports.MALFORMED_HTML = `<html><head><title>Broken</title>
  <<<<not valid>>>
</head><body><h1>Still works</h1></body>`;
