/**
 * Returns an error message string if the URL is invalid, or null if valid.
 * Keeps validation logic out of both the component and the API layer.
 */
export function validateUrl(raw: string): string | null {
  const trimmed = raw.trim();

  if (!trimmed) {
    return 'Please enter a URL.';
  }

  try {
    const url = new URL(trimmed);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return 'URL must start with http:// or https://';
    }
    return null;
  } catch {
    return 'Please enter a valid URL (e.g. https://example.com)';
  }
}
