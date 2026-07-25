import { useState } from 'react';
import axios from 'axios';
import { auditWebsite } from '../api/auditApi';
import type { AuditData } from '../types/audit';

interface UseAuditReturn {
  data: AuditData | null;
  isLoading: boolean;
  error: string | null;
  run: (url: string) => Promise<void>;
  reset: () => void;
}

/**
 * Encapsulates all async state for an audit request.
 * The page component stays declarative — it just calls run() and reads state.
 */
export function useAudit(): UseAuditReturn {
  const [data, setData] = useState<AuditData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(url: string): Promise<void> {
    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      const result = await auditWebsite(url);
      setData(result);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        // Prefer the backend's error message if present
        const serverMessage =
          err.response?.data?.error as string | undefined;
        setError(serverMessage ?? err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  function reset(): void {
    setData(null);
    setError(null);
  }

  return { data, isLoading, error, run, reset };
}
