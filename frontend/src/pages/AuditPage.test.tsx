import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuditPage } from './AuditPage';
import { useAudit } from '../hooks/useAudit';

vi.mock('../hooks/useAudit', () => ({
  useAudit: vi.fn(),
}));

const mockUseAudit = vi.mocked(useAudit);

const baseAuditData = {
  parsedData: {
    general: {
      title: 'Example title',
      language: 'en',
      canonicalUrl: 'https://example.com/canonical',
      pageUrl: 'https://example.com',
    },
    meta: {
      description: 'A meeting description that is long enough to be valid.',
      robots: null,
      viewport: 'width=device-width',
    },
    headings: {
      h1Count: 1,
      h2Count: 2,
      h3Count: 0,
      h1Texts: ['Example title'],
    },
    images: { total: 1, withAlt: 1, missingAlt: 0 },
    links: { total: 1, internal: 1, external: 0 },
    openGraph: { title: 'OG', description: 'OG desc', image: 'https://example.com/og.png' },
    twitter: { card: 'summary_large_image', title: 'Twitter', description: 'Twitter desc' },
    technical: { hasFavicon: true, charset: 'UTF-8', hasViewport: true },
    statusCode: 200,
  },
  analysis: {
    issues: [],
    summary: { errors: 0, warnings: 0, infos: 0 },
  },
  scores: {
    overallScore: 100,
    seoScore: 100,
    accessibilityScore: 100,
    breakdown: {
      seo: { start: 100, deductions: [], final: 100 },
      accessibility: { start: 100, deductions: [], final: 100 },
    },
  },
  recommendations: [],
};

describe('AuditPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the URL input', () => {
    mockUseAudit.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
      run: vi.fn(),
      reset: vi.fn(),
    });

    render(<AuditPage />);

    expect(screen.getByPlaceholderText(/https:\/\/example\.com/i)).toBeInTheDocument();
  });

  it('validates empty URL submissions', async () => {
    const user = userEvent.setup();
    const run = vi.fn();

    mockUseAudit.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
      run,
      reset: vi.fn(),
    });

    render(<AuditPage />);

    await user.click(screen.getByRole('button', { name: /analyze/i }));

    expect(await screen.findByText(/please enter a url/i)).toBeInTheDocument();
    expect(run).not.toHaveBeenCalled();
  });

  it('shows a loading state while running', () => {
    mockUseAudit.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      run: vi.fn(),
      reset: vi.fn(),
    });

    render(<AuditPage />);

    expect(screen.getByText(/fetching and analyzing page/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /analyzing/i })).toBeDisabled();
  });

  it('renders a backend error', () => {
    mockUseAudit.mockReturnValue({
      data: null,
      isLoading: false,
      error: 'Backend unavailable',
      run: vi.fn(),
      reset: vi.fn(),
    });

    render(<AuditPage />);

    expect(screen.getByText('Backend unavailable')).toBeInTheDocument();
  });

  it('renders the dashboard after a successful response', async () => {
    const run = vi.fn();
    mockUseAudit.mockReturnValue({
      data: baseAuditData,
      isLoading: false,
      error: null,
      run,
      reset: vi.fn(),
    });

    render(<AuditPage />);

    await waitFor(() => {
      expect(screen.getByText(/page pulse/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/seo score/i)).toBeInTheDocument();
  });
});
