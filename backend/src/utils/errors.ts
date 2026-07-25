/**
 * Base class for all application-level errors.
 * Carries an HTTP statusCode so the error handler can respond correctly.
 */
export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    // Restore prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Thrown when the remote server returns a non-2xx HTTP status.
 */
export class HttpError extends AppError {
  public readonly remoteStatus: number;

  constructor(remoteStatus: number, url: string) {
    super(
      `Remote server returned HTTP ${remoteStatus} for URL: ${url}`,
      502 // Bad Gateway — the upstream server gave us a bad response
    );
    this.remoteStatus = remoteStatus;
  }
}

/**
 * Thrown when the fetched resource is not an HTML page.
 */
export class ContentTypeError extends AppError {
  constructor(contentType: string | null, url: string) {
    super(
      `Expected text/html but received "${contentType ?? "none"}" for URL: ${url}`,
      422 // Unprocessable — we reached the URL but it's not the right content
    );
  }
}

/**
 * Thrown when the fetch itself fails (network error, timeout, DNS failure, etc.).
 */
export class FetchError extends AppError {
  constructor(cause: unknown, url: string) {
    const reason =
      cause instanceof Error ? cause.message : "Unknown network error";
    super(`Failed to fetch URL: ${url} — ${reason}`, 502);
  }
}
