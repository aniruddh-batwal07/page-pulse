import axios from 'axios';
import type { AuditApiResponse, AuditData } from '../types/audit';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000, // 30s — backend fetch + parse can take time
});

/**
 * POST /api/v1/audit
 * Sends a URL to the backend and returns the fully typed audit result.
 * Throws an Error with a human-readable message on failure.
 */
export async function auditWebsite(url: string): Promise<AuditData> {
  const response = await apiClient.post<AuditApiResponse>('/api/v1/audit', { url });
  return response.data.data;
}
