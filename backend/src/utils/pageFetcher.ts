import { ContentTypeError, FetchError, HttpError } from "./errors.js";

const FETCH_TIMEOUT_MS = 10_000;

export interface FetchResult {
  html: string;
  finalUrl: string;
  statusCode: number;
}

/**
 * Fetches a URL and returns its HTML content.
 *
 * Validates:
 * - HTTP response is 2xx
 * - Content-Type is text/html
 * - Enforces a 10-second abort timeout
 *
 * Redirects are followed automatically by fetch; we only reject
 * if the final response is not an HTML resource.
 */
export async function fetchPage(url: string): Promise<FetchResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let response: Response;

  try {
    response = await fetch(url, {
      signal: controller.signal,
      headers: {
        // Identify ourselves; some servers block requests without a UA
        "User-Agent": "PagePulse-Auditor/1.0",
        Accept: "text/html",
      },
    });
  } catch (err) {
    throw new FetchError(err, url);
  } finally {
    clearTimeout(timeoutId);
  }

  // Validate HTTP status (2xx range)
  if (!response.ok) {
    throw new HttpError(response.status, url);
  }

  // Validate Content-Type — must contain text/html
  const contentType = response.headers.get("content-type");
  if (!contentType?.includes("text/html")) {
    throw new ContentTypeError(contentType, url);
  }

  const html = await response.text();
  const finalUrl = response.url; // reflects any redirects that occurred

  return {
    html,
    finalUrl,
    statusCode: response.status,
  };
}
