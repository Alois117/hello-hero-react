import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useAuthenticatedFetch } from '@/keycloak/hooks/useAuthenticatedFetch';
import {
  KEYCLOAK_EVENTS_URL,
  KEYCLOAK_ADMIN_EVENTS_URL,
  KEYCLOAK_URL,
  KEYCLOAK_REALM,
} from '@/config/env';
import { safeParseResponse } from '@/lib/safeFetch';
import type {
  SystemLogEntry,
  SystemLogsSummary,
  SystemLogsFilters,
  SystemLogsPagination,
  LogSeverity,
  LogSource,
} from './types';

const REFRESH_INTERVAL = 30_000; // 30s silent refresh
const PAGE_SIZE = 10;
const MAX_EVENTS_PER_TYPE = 200; // safety limit per call - adjust if needed

// Cache for user details to avoid repeated fetches
const userCache = new Map<string, { username: string; email?: string }>();

// ── Severity mapper ──
const mapSeverity = (event: string, source: LogSource): LogSeverity => {
  const e = event.toUpperCase();
  if (e.includes('ERROR') || e.includes('LOGIN_ERROR') || e.includes('BRUTE') || e.includes('INVALID') || e.includes('BLOCK')) {
    return 'high';
  }
  if (
    e.includes('UPDATE') ||
    e.includes('DELETE') ||
    e.includes('CREATE') ||
    e.includes('PERMISSION') ||
    e.includes('ROLE') ||
    e.includes('GRANT') ||
    source === 'ADMIN_EVENT'
  ) {
    return 'medium';
  }
  return 'low';
};

// ── Normalize Keycloak event into SystemLogEntry (now async for user lookup) ──
const normalizeEvent = async (
  raw: any,
  source: LogSource,
  index: number,
  authenticatedFetch: ReturnType<typeof useAuthenticatedFetch>['authenticatedFetch']
): Promise<SystemLogEntry> => {
  const event =
    source === 'USER_EVENT'
      ? (raw.type as string) || 'UNKNOWN'
      : [raw.operationType, raw.resourceType].filter(Boolean).join(' ') || 'UNKNOWN';

  const timestamp =
    typeof raw.time === 'number'
      ? new Date(raw.time).toISOString()
      : (raw.time as string) || new Date().toISOString();

  // ── User resolution with cache + API lookup ──
  const userId = raw.userId as string | undefined;
  let displayUser = (raw.username as string) || 'system';

  if (userId && displayUser === 'system') {
    if (userCache.has(userId)) {
      const cached = userCache.get(userId)!;
      displayUser = cached.email || cached.username || `user:${userId.slice(0, 8)}`;
    } else {
      try {
        const userRes = await authenticatedFetch(
          `${KEYCLOAK_URL.replace(/\/$/, '')}/admin/realms/${KEYCLOAK_REALM}/users/${userId}`,
          { method: 'GET', headers: { Accept: 'application/json' } }
        );
        const userResult = await safeParseResponse<any>(userRes);
        if (userResult.ok && userResult.data) {
          const email = userResult.data.email as string | undefined;
          const username = userResult.data.username as string || `user:${userId.slice(0, 8)}`;
          userCache.set(userId, { username, email });
          displayUser = email || username;
        } else {
          displayUser = `user:${userId.slice(0, 8)}`;
        }
      } catch (e) {
        console.warn(`Failed to fetch user ${userId}:`, e);
        displayUser = `user:${userId.slice(0, 8)}`;
      }
    }
  }

  const ipAddress = raw.ipAddress || raw.ip || '—';

  const severity = mapSeverity(event, source);

  // Collect details
  let details: Record<string, unknown> | null = null;
  if (raw.details && typeof raw.details === 'object') {
    details = { ...raw.details };
  }
  if (source === 'ADMIN_EVENT' && raw.representation) {
    details = { ...(details || {}), representation: raw.representation };
  }
  if (raw.authDetails) {
    details = { ...(details || {}), auth: raw.authDetails };
  }
  if (raw.resourcePath) {
    details = { ...(details || {}), resourcePath: raw.resourcePath };
  }

  return {
    id: raw.id || `kc-${source}-${index}-${Date.now()}`,
    timestamp,
    event,
    user: displayUser,
    ipAddress,
    severity,
    source,
    details,
  };
};

export const useSystemLogs = (): UseSystemLogsReturn => {
  const [allLogs, setAllLogs] = useState<SystemLogEntry[]>([]);
  const [summary, setSummary] = useState<SystemLogsSummary>({
    totalEvents: 0,
    successfulLogins: 0,
    failedAttempts: 0,
    securityAlerts: 0,
    updatedAt: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [filters, setFiltersState] = useState<SystemLogsFilters>({
    search: '',
    severity: '',
    source: '',
    timeRange: '',
    dateFrom: undefined,
    dateTo: undefined,
  });

  const [page, setPage] = useState(1);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { authenticatedFetch } = useAuthenticatedFetch();

  // ── Fetch both user events and admin events ──
  const fetchLogs = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          max: MAX_EVENTS_PER_TYPE.toString(),
          // Optional: add dateFrom for fresher data, e.g.:
          // dateFrom: new Date(Date.now() - 24*60*60*1000).toISOString()
        });

        const userUrl = `${KEYCLOAK_EVENTS_URL}?${params}`;
        const adminUrl = `${KEYCLOAK_ADMIN_EVENTS_URL}?${params}`;

        const [userRes, adminRes] = await Promise.all([
          authenticatedFetch(userUrl, {
            method: 'GET',
            headers: { Accept: 'application/json' },
          }),
          authenticatedFetch(adminUrl, {
            method: 'GET',
            headers: { Accept: 'application/json' },
          }),
        ]);

        const userResult = await safeParseResponse<any[]>(userRes, userUrl);
        const adminResult = await safeParseResponse<any[]>(adminRes, adminUrl);

        if (!userResult.ok && !adminResult.ok) {
          throw new Error('We couldn\'t load system logs. Please try again.');
        }

        const userEvents: any[] = Array.isArray(userResult.ok ? userResult.data : null) ? (userResult.data as any[]) : [];
        const adminEvents: any[] = Array.isArray(adminResult.ok ? adminResult.data : null) ? (adminResult.data as any[]) : [];

        // Normalize with async user lookup
        const userEntries = await Promise.all(
          userEvents.map((e, i) => normalizeEvent(e, 'USER_EVENT', i, authenticatedFetch))
        );
        const adminEntries = await Promise.all(
          adminEvents.map((e, i) => normalizeEvent(e, 'ADMIN_EVENT', i, authenticatedFetch))
        );

        const combined = [...userEntries, ...adminEntries].sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        setAllLogs(combined);

        // Compute summary
        const now = new Date().toISOString();
        setSummary({
          totalEvents: combined.length,
          successfulLogins: combined.filter(
            (e) => e.event === 'LOGIN' && e.severity === 'low'
          ).length,
          failedAttempts: combined.filter((e) => e.severity === 'high').length,
          securityAlerts: combined.filter(
            (e) => e.severity === 'high' || e.severity === 'medium'
          ).length,
          updatedAt: now,
        });

        setIsConnected(true);
        setLastUpdated(new Date());
      } catch (err: any) {
        const safe = err instanceof Error ? err.message : "We couldn't load system logs. Please try again.";
        console.error('[useSystemLogs] Error:', err);
        if (!silent) setError(safe);
        setIsConnected(false);
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [authenticatedFetch]
  );

  // ── Client-side filtering ──
  const filteredLogs = useMemo(() => {
    let result = allLogs;

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (l) =>
          l.event.toLowerCase().includes(q) ||
          l.user.toLowerCase().includes(q) ||
          l.ipAddress.includes(q)
      );
    }

    if (filters.severity) {
      result = result.filter((l) => l.severity === filters.severity);
    }

    if (filters.source) {
      result = result.filter((l) => l.source === filters.source);
    }

    if (filters.timeRange && filters.timeRange !== 'custom') {
      const now = Date.now();
      const ranges: Record<string, number> = {
        '1h': 60 * 60 * 1000,
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000,
      };
      const ms = ranges[filters.timeRange];
      if (ms) {
        result = result.filter(
          (l) => new Date(l.timestamp).getTime() >= now - ms
        );
      }
    }

    if (filters.dateFrom) {
      result = result.filter(
        (l) => new Date(l.timestamp) >= filters.dateFrom!
      );
    }

    if (filters.dateTo) {
      const end = new Date(filters.dateTo);
      end.setHours(23, 59, 59, 999);
      result = result.filter((l) => new Date(l.timestamp) <= end);
    }

    return result;
  }, [allLogs, filters]);

  const paginatedLogs = useMemo(
    () =>
      filteredLogs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filteredLogs, page]
  );

  const pagination: SystemLogsPagination = {
    page,
    pageSize: PAGE_SIZE,
    total: filteredLogs.length,
    totalPages: Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE)),
  };

  const setFilters = useCallback((partial: Partial<SystemLogsFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...partial }));
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState({
      search: '',
      severity: '',
      source: '',
      timeRange: '',
      dateFrom: undefined,
      dateTo: undefined,
    });
    setPage(1);
  }, []);

  // ── Auto-fetch & refresh ──
  useEffect(() => {
    fetchLogs(false);
  }, [fetchLogs]);

  useEffect(() => {
    intervalRef.current = setInterval(() => fetchLogs(true), REFRESH_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchLogs]);

  const refresh = useCallback(() => fetchLogs(false), [fetchLogs]);

  return {
    logs: paginatedLogs,
    summary,
    pagination,
    filters,
    loading,
    error,
    isConnected,
    lastUpdated,
    setPage,
    setFilters,
    clearFilters,
    refresh,
  };
};

export interface UseSystemLogsReturn {
  logs: SystemLogEntry[];
  summary: SystemLogsSummary;
  pagination: SystemLogsPagination;
  filters: SystemLogsFilters;
  loading: boolean;
  error: string | null;
  isConnected: boolean;
  lastUpdated: Date | null;
  setPage: (page: number) => void;
  setFilters: (f: Partial<SystemLogsFilters>) => void;
  clearFilters: () => void;
  refresh: () => Promise<void>;
}

export default useSystemLogs;